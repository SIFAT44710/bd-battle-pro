import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { parseBookingText, parsePaymentScreenshot } from './gemini.js';
import { bookSlotInFirestore, normalizePhone, getTournamentData, findTargetMatch, findRecentSmsLog } from './firestore.js';
import { sessionManager } from './session.js';
import { config } from '../config.js';
import { botState, registerSocket } from './server.js';

const logger = pino({ level: config.bot.debug ? 'debug' : 'silent' });

export async function startWhatsAppBot() {
  const authDir = path.resolve('./auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[WhatsApp]: Starting Baileys Client (v${version.join('.')}, isLatest: ${isLatest})...`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['ARENA X Bot', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true
  });

  registerSocket(sock);

  // Save auth state changes
  sock.ev.on('creds.update', saveCreds);

  // Connection Updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      botState.qr = qr;
      botState.status = 'qr_ready';
      console.log('\n======================================================');
      console.log('📱 SCAN THIS WHATSAPP QR CODE WITH YOUR PHONE:');
      console.log('======================================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\nOpen WhatsApp > Settings > Linked Devices > Link a Device\n');
    }

    if (connection === 'close') {
      botState.status = 'disconnected';
      botState.user = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WhatsApp]: Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      } else {
        console.log('[WhatsApp]: Session unauthenticated/logged out. Clearing stale credentials and refreshing...');
        try {
          fs.rmSync(authDir, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(startWhatsAppBot, 2000);
      }
    } else if (connection === 'open') {
      botState.status = 'connected';
      botState.user = sock.user?.id || 'Connected';
      botState.connectedAt = new Date().toISOString();
      botState.qr = null;
      botState.pairingCode = null;
      console.log('\n======================================================');
      console.log(`🟢 WHATSAPP BOT ONLINE & CONNECTED AS: ${sock.user?.id || 'ARENA X'}`);
      console.log('======================================================\n');
    }
  });

  // Incoming Messages Handler
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      // Filter out status broadcast or group messages if only handling private DMs
      if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') continue;

      const senderPhone = normalizePhone(remoteJid.split('@')[0]);
      console.log(`\n[Incoming Message] from: ${senderPhone}`);

      try {
        await handleIncomingPlayerMessage(sock, msg, remoteJid, senderPhone);
      } catch (err) {
        console.error('[Error handling message]:', err);
        await sock.sendMessage(remoteJid, {
          text: '⚠️ একটি টেকনিক্যাল সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা অর্গানাইজারের সাথে সরাসরি যোগাযোগ করুন।'
        });
      }
    }
  });

  return sock;
}

/**
 * Core Message Processing & Automated Response Pipeline
 */
async function handleIncomingPlayerMessage(sock, msg, remoteJid, senderPhone) {
  const isImage = !!msg.message.imageMessage;
  const rawText = msg.message.conversation ||
                  msg.message.extendedTextMessage?.text ||
                  msg.message.imageMessage?.caption ||
                  '';

  // Mark message as read
  await sock.readMessages([msg.key]);

  // Retrieve any existing session data for this player
  const existingSession = sessionManager.get(senderPhone) || {};

  let parsedData = { ...existingSession };

  // 1. Process Image (bKash/Nagad Screenshot)
  if (isImage) {
    console.log('[Bot]: Player sent an image attachment. Downloading & analyzing with Gemini Vision...');
    await sock.sendMessage(remoteJid, {
      react: { text: '🔍', key: msg.key }
    });

    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger }
    );

    const visionResult = await parsePaymentScreenshot(
      buffer,
      msg.message.imageMessage.mimetype || 'image/jpeg',
      rawText
    );

    console.log('[Gemini Vision Result]:', visionResult);

    if (visionResult.trx_id) parsedData.trx_id = visionResult.trx_id;
    if (visionResult.amount) parsedData.amount = visionResult.amount;
    if (visionResult.payment_method) parsedData.payment_method = visionResult.payment_method;

    if (visionResult.caption_booking_info) {
      if (visionResult.caption_booking_info.squad_name) parsedData.squad_name = visionResult.caption_booking_info.squad_name;
      if (visionResult.caption_booking_info.slot_number) parsedData.slot_number = visionResult.caption_booking_info.slot_number;
      if (visionResult.caption_booking_info.leader_name) parsedData.leader_name = visionResult.caption_booking_info.leader_name;
      if (visionResult.caption_booking_info.match_query) parsedData.match_query = visionResult.caption_booking_info.match_query;
    }
  }

  // 2. Process Text (if text provided or image caption)
  if (rawText && !isImage) {
    console.log(`[Bot]: Player sent text: "${rawText}". Parsing with Gemini 1.5 Flash...`);
    const textResult = await parseBookingText(rawText);
    console.log('[Gemini Text Result]:', textResult);

    if (textResult.trx_id) parsedData.trx_id = textResult.trx_id;
    if (textResult.amount) parsedData.amount = textResult.amount;
    if (textResult.payment_method) parsedData.payment_method = textResult.payment_method;
    if (textResult.squad_name) parsedData.squad_name = textResult.squad_name;
    if (textResult.slot_number) parsedData.slot_number = textResult.slot_number;
    if (textResult.leader_name) parsedData.leader_name = textResult.leader_name;
    if (textResult.match_query) parsedData.match_query = textResult.match_query;
    if (textResult.player_names && textResult.player_names.length) parsedData.player_names = textResult.player_names;
  }

  // 3. Auto-match payment from sms_logs in Firestore (if TrxID not yet in session)
  if (!parsedData.trx_id) {
    try {
      const recentSms = await findRecentSmsLog(senderPhone);
      if (recentSms && recentSms.trx_id) {
        parsedData.trx_id = recentSms.trx_id;
        parsedData.amount = recentSms.amount;
        parsedData.payment_method = recentSms.method;
        console.log(`[Bot]: Auto-matched SMS log for ${senderPhone}: TrxID=${recentSms.trx_id}, ৳${recentSms.amount}`);
      }
    } catch (e) {
      console.warn('[Bot]: Error checking recent SMS logs:', e.message);
    }
  }

  // 4. Fetch Live Tournament Data from Firestore
  let matches = [];
  try {
    const tourney = await getTournamentData();
    matches = (tourney && tourney.data && tourney.data.matches) || [];
  } catch (err) {
    console.error('[Bot Fetch Tournament Error]:', err.message);
  }

  // 5. Resolve Target Match dynamically based on player's request
  let targetMatch = null;
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  // If player explicitly specified a match (e.g. "Match 4", "Match 5", "m4", "4", "Bermuda"):
  if (parsedData.match_query) {
    targetMatch = findTargetMatch(matches, parsedData.match_query, false);
    if (targetMatch) {
      parsedData.targetMatchId = targetMatch.id || targetMatch.matchNumber;
    }
  }

  // If still not found, check existing session (only if that match is still upcoming)
  if (!targetMatch && existingSession.targetMatchId) {
    const prev = matches.find(m => (m.id && m.id === existingSession.targetMatchId) || m.matchNumber === existingSession.targetMatchId);
    if (prev && prev.status === 'upcoming') {
      targetMatch = prev;
    }
  }

  // If there is ONLY ONE upcoming match in the whole tournament, auto-pick it:
  if (!targetMatch && upcomingMatches.length === 1) {
    targetMatch = upcomingMatches[0];
    parsedData.targetMatchId = targetMatch.id || targetMatch.matchNumber;
  }

  // Save merged state into session
  sessionManager.set(senderPhone, parsedData);

  // STEP A: If targetMatch is still undefined (multiple matches exist and player hasn't chosen one):
  if (!targetMatch) {
    let matchListText = '';
    if (upcomingMatches.length > 0) {
      matchListText = upcomingMatches.map((m, idx) => {
        const freeCount = (m.slots || []).filter(s => !s.booked).length;
        const num = m.matchNumber || (idx + 1);
        return `🎮 *Match ${num}:* ${m.title || 'Daily Squad Clash'}\n   🗺️ ম্যাপ: ${m.map || 'Bermuda'} | ⏰ সময়: ${m.time || '08:30 PM'}\n   💰 এন্ট্রি ফি: ৳${m.entryFee || 100} | 🎯 খালি স্লট: ${freeCount}টি`;
      }).join('\n\n');
    } else {
      matchListText = 'বর্তমানে কোনো আপকামিং টুর্নামেন্ট শিডিউল নেই।';
    }

    const reply = `👋 স্বাগতম *ARENA X* ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্মে!

🏆 *বর্তমানে একাধিক ম্যাচ চালু রয়েছে:*
━━━━━━━━━━━━━━━━━━━━━━━
${matchListText}
━━━━━━━━━━━━━━━━━━━━━━━

👉 *স্লট বুক করতে নিচের যেকোনো একটি ফরম্যাটে মেসেজ দিন:*

📋 *বুকিং ফরম্যাট (কপি করে পাঠান):*
ম্যাচ: Match 4 (অথবা Match 5)
স্লট: ৫ (১-১২ এর মধ্যে)
টিম: আপনার স্কোয়াড নাম
প্লেয়ার: ১, ২, ৩, ৪
TrxID: বিকাশ/নগদ ফিরতি SMS-এর ট্রানজেকশন আইডি

*(অথবা এক লাইনে লিখুন: Match 4, Slot 5, Team Venom, TrxID XXXXXXXXX)*`;

    await sock.sendMessage(remoteJid, { text: reply });
    return;
  }

  // STEP B: Target match is confirmed! Use its dynamic entry fee
  const requiredFee = Number(targetMatch.entryFee || 100);
  const hasPayment = !!parsedData.trx_id;
  const hasSquad = !!parsedData.squad_name;

  // Case 1: Missing Payment (Player wants to book but hasn't paid or given TrxID)
  if (!hasPayment) {
    const freeSlots = (targetMatch.slots || []).filter(s => !s.booked).map(s => '#' + s.slotNumber);
    const reply = `🎯 *${targetMatch.title}*
🗺️ ম্যাপ: ${targetMatch.map || 'Bermuda'} | ⏰ সময়: ${targetMatch.time || '08:30 PM'}
💰 এন্ট্রি ফি: *৳${requiredFee}*
🎯 খালি স্লটসমূহ: *${freeSlots.join(', ')}*

বুকিং করতে অনুগ্রহ করে এন্ট্রি ফি (৳${requiredFee}) নিচের যেকোনো নম্বরে *Send Money* করুন:
📱 *বিকাশ (Personal):* 01791357521
📱 *নগদ (Personal):* 01791357521
📱 *রকেট (Personal):* 01791357521

Send Money করার পর নিচের ফরম্যাটে ফিরতি SMS-এর *TrxID* এবং আপনার *স্কোয়াডের নাম* লিখে পাঠান:

📋 *বুকিং ফরম্যাট (কপি করে পাঠান):*
ম্যাচ: ${targetMatch.matchNumber || 4}
স্লট: ${freeSlots[0] ? freeSlots[0].replace('#', '') : '১'}
টিম: আপনার স্কোয়াড নাম
প্লেয়ার: ১, ২, ৩, ৪
TrxID: আপনার বিকাশ/নগদ TrxID

*(অথবা সরাসরি পেমেন্ট স্ক্রিনশট সেন্ড করুন)*`;

    await sock.sendMessage(remoteJid, { text: reply });
    return;
  }

  // Case 2: Payment found, but Missing Squad Name
  if (hasPayment && !hasSquad) {
    const paidAmount = parsedData.amount || requiredFee;
    let feeNote = '';
    if (parsedData.amount && parsedData.amount < requiredFee) {
      feeNote = `\n⚠️ *সতর্কতা:* এই ম্যাচের এন্ট্রি ফি ৳${requiredFee}, তবে আপনার পেমেন্টে ৳${parsedData.amount} শনাক্ত হয়েছে।`;
    }

    const freeSlots = (targetMatch.slots || []).filter(s => !s.booked).map(s => '#' + s.slotNumber);
    const reply = `✅ ধন্যবাদ! আপনার *৳${paidAmount}* পেমেন্ট সফলভাবে শনাক্ত হয়েছে (TrxID: *${parsedData.trx_id}*)।${feeNote}

🎮 *ম্যাচ:* ${targetMatch.title}
🎯 খালি স্লটসমূহ: *${freeSlots.join(', ')}*

এবার অনুগ্রহ করে আপনার *স্কোয়াড নাম* এবং আপনি *কত নম্বর স্লটে* খেলতে চান তা লিখে পাঠান:
(যেমন: *Squad Vortex, Slot 3, Leader Tanvir*)`;

    await sock.sendMessage(remoteJid, { text: reply });
    return;
  }

  // Case 3: Both Payment & Squad Details are ready -> Perform Automatic Firestore Booking!
  console.log(`[Bot]: All details ready for ${senderPhone} in ${targetMatch.title}. Booking slot in Firestore...`);

  await sock.sendMessage(remoteJid, {
    react: { text: '⏳', key: msg.key }
  });

  const bookingResult = await bookSlotInFirestore({
    matchQuery: targetMatch.title || parsedData.match_query,
    preferredSlot: parsedData.slot_number,
    squadName: parsedData.squad_name,
    leaderName: parsedData.leader_name,
    playerNames: parsedData.player_names || [],
    contactPhone: senderPhone,
    trxId: parsedData.trx_id,
    amount: parsedData.amount || requiredFee,
    paymentMethod: parsedData.payment_method
  });

  // Handle Slot Occupied
  if (!bookingResult.success && bookingResult.reason === 'SLOT_OCCUPIED') {
    const reply = `⚠️ দুঃখিত! স্লট *#${parsedData.slot_number}* ইতিমধ্যে অন্য দল বুক করে নিয়েছে।

খালি স্লটসমূহ: *${bookingResult.freeSlots.map(s => '#' + s).join(', ')}*

অনুগ্রহ করে ওপরের যেকোনো একটি খালি স্লট নম্বর লিখে পাঠান (যেমন: *Slot ${bookingResult.freeSlots[0]}*)।`;

    await sock.sendMessage(remoteJid, { text: reply });
    return;
  }

  // Handle Duplicate TrxID Fraud
  if (!bookingResult.success && bookingResult.reason === 'DUPLICATE_TRXID') {
    const reply = `🚫 *পেমেন্ট ভেরিফিকেশন ব্যর্থ!*
আপনার দেওয়া TrxID (*${parsedData.trx_id}*) ইতিমধ্যে অন্য একটি বুকিংয়ে ব্যবহার করা হয়েছে। অনুগ্রহ করে সঠিক TrxID অথবা ফ্রেশ পেমেন্ট স্ক্রিনশট পাঠান।`;

    await sock.sendMessage(remoteJid, { text: reply });
    sessionManager.clear(senderPhone);
    return;
  }

  // Handle No Active Match
  if (!bookingResult.success) {
    await sock.sendMessage(remoteJid, { text: `⚠️ ${bookingResult.message}` });
    return;
  }

  // SUCCESS! Slot Booked & Realtime Firestore Updated!
  sessionManager.clear(senderPhone);

  await sock.sendMessage(remoteJid, {
    react: { text: '✅', key: msg.key }
  });

  const m = bookingResult.match;
  const confirmationMessage = `🎮 *ARENA X TOURNAMENT CONFIRMATION* 🎮
━━━━━━━━━━━━━━━━━━━━━━━
✅ *আপনার স্কোয়াড সফলভাবে রেজিস্টার্ড হয়েছে!*

🏆 *ম্যাচ:* ${m.title || 'Match'}
🗺️ *ম্যাপ:* ${m.map || 'Bermuda'}
⏰ *সময়:* Today ${m.time || '08:30 PM'}
🎯 *স্লট নম্বর:* Slot #${bookingResult.slotNumber < 10 ? '0' + bookingResult.slotNumber : bookingResult.slotNumber}
🛡️ *স্কোয়াড:* ${bookingResult.squadName}
👑 *লিডার:* ${bookingResult.leaderName}
📱 *ভেরিফাইড নম্বর:* ${bookingResult.contactPhone}
💰 *পেমেন্ট:* ৳${bookingResult.amount} (${(bookingResult.paymentMethod || 'bKash').toUpperCase()} - ${bookingResult.trxId})
━━━━━━━━━━━━━━━━━━━━━━━
🔑 *রুম আইডি ও পাসওয়ার্ড অ্যাক্সেস:*
ম্যাচ শুরুর ১৫ মিনিট আগে সরাসরি ওয়েবসাইটে গিয়ে আপনার এই হোয়াটসঅ্যাপ নম্বরটি (*${bookingResult.contactPhone}*) ভেরিফাই করলেই কাস্টম রুম আইডি ও পাসওয়ার্ড আনলক হয়ে যাবে!

🌐 *লাইভ ওয়েবসাইট:*
${config.tournament.websiteUrl}`;

  await sock.sendMessage(remoteJid, { text: confirmationMessage });
  console.log(`[Bot]: Successfully booked Slot #${bookingResult.slotNumber} for Squad ${bookingResult.squadName} (${senderPhone})!`);
}
