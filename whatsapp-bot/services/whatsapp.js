import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  isJidNewsletter
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { runDokanAiAgent, parsePaymentScreenshot, executeToolCall } from './gemini.js';
import { useFirestoreAuthState } from './firestoreAuth.js';
import { normalizePhone } from './firestore.js';
import { sessionManager } from './session.js';
import { config } from '../config.js';
import { botState, registerSocket, addLog } from './server.js';

const logger = pino({ level: config.bot.debug ? 'debug' : 'silent' });

// Track message IDs dispatched by this bot instance to avoid self-reply loops
const botSentMessageIds = new Set();

export async function sendBotMessage(sock, jid, content) {
  try {
    const result = await sock.sendMessage(jid, content);
    if (result?.key?.id) {
      botSentMessageIds.add(result.key.id);
      if (botSentMessageIds.size > 300) {
        const first = botSentMessageIds.values().next().value;
        botSentMessageIds.delete(first);
      }
    }
    return result;
  } catch (err) {
    console.error(`[sendBotMessage Error to ${jid}]:`, err.message);
    throw err;
  }
}

// Tournament keywords for Smart Trigger & Silent Filter
const TOURNAMENT_KEYWORDS = [
  '[arena-booking]', 'arena', 'বুকিং', 'booking', 'ম্যাচ', 'match',
  'slot', 'স্লট', 'squad', 'স্কোয়াড', 'টিম', 'team', 'trxid', 'trx',
  'বিকাশ', 'bkash', 'নগদ', 'nagad', 'রকেট', 'rocket', 'রুম আইডি',
  'room id', 'password', 'পাসওয়ার্ড', 'রেজিস্ট্রেশন', 'registration',
  'টুর্নামেন্ট', 'tournament', 'ফ্রি ফায়ার', 'free fire', 'টাকা', 'taka',
  'pathaisi', 'পাঠাইছি', 'send money', 'সেন্ড মানি', 'পেমেন্ট', 'payment', 'khali', 'খালি',
  'scrim', 'scrims', 'কাস্টম', 'custom', 'খেলব', 'খেলবো', 'জয়েন', 'join',
  'room', 'রুম', 'pass', 'পাস', 'prize', 'প্রাইজ', 'entry', 'fee', 'ফি',
  'test', 'hi', 'hello', 'vai', 'ভাই', 'bro', 'সালাম', 'assalamu alaikum',
  'kemon acho', 'কেমন আছো', 'kemon achen', 'কেমন আছেন', 'help', 'সাহায্য',
  'info', 'khobor', 'তথ্য', 'schedule', 'শিডিউল', 'rules', 'নিয়ম'
];

function isTournamentRelatedText(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return TOURNAMENT_KEYWORDS.some(kw => lower.includes(kw));
}

function extractMessageText(message) {
  if (!message) return '';
  const m = message.ephemeralMessage?.message ||
            message.viewOnceMessage?.message ||
            message.viewOnceMessageV2?.message ||
            message.documentWithCaptionMessage?.message ||
            message;
  return m.conversation ||
         m.extendedTextMessage?.text ||
         m.imageMessage?.caption ||
         m.documentMessage?.caption ||
         '';
}

export async function startWhatsAppBot() {
  const clientId = process.env.CLIENT_ID || 'default_client';
  
  // Cloud-Resilient Firestore Auth State (Survives Render / Docker restarts)
  const { state, saveCreds } = await useFirestoreAuthState(clientId);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[WhatsApp]: Starting Baileys Client (v${version.join('.')}, isLatest: ${isLatest})...`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    browser: ['ARENA X DokanAI Agent', 'Chrome', '1.0.0'],
    getMessage: async (key) => {
      return { conversation: 'ARENA X Bot' };
    },
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidNewsletter(jid) || jid.endsWith('@newsletter')
  });

  registerSocket(sock);

  // Save auth state changes directly to Firestore & local cache
  sock.ev.on('creds.update', saveCreds);

  // Connection Updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    addLog('CONNECTION_UPDATE', {
      connection: connection || 'status_update',
      isNewLogin: update.isNewLogin
    });

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
      if (sock._heartbeatTimer) clearInterval(sock._heartbeatTimer);
      botState.status = 'disconnected';
      botState.user = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WhatsApp]: Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      } else {
        console.log('[WhatsApp]: Session unauthenticated/logged out.');
        setTimeout(startWhatsAppBot, 3000);
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

      // Keep WhatsApp WebSocket actively listening & prevent TCP idle drops
      if (sock._heartbeatTimer) clearInterval(sock._heartbeatTimer);
      sock._heartbeatTimer = setInterval(async () => {
        try {
          if (botState.status === 'connected') {
            await sock.sendPresenceUpdate('available');
          }
        } catch (e) {}
      }, 3 * 60 * 1000); // Every 3 minutes
    }
  });

  // Incoming Messages Handler with Smart Trigger & Silent Filter
  sock.ev.on('messages.upsert', async (m) => {
    addLog('UPSERT_EVENT_RAW', { type: m.type, count: m.messages?.length });
    if (m.type !== 'notify' && m.type !== 'append') return;

    for (const msg of m.messages) {
      if (!msg.message) continue;

      const msgId = msg.key?.id;
      // Skip if this message was sent by the bot itself
      if (msgId && botSentMessageIds.has(msgId)) {
        continue;
      }

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) continue;
      // Filter out status broadcasts or group chats
      if (remoteJid.includes('@g.us') || remoteJid.includes('@broadcast') || remoteJid.includes('@newsletter')) continue;

      // Allow self-chat testing (message to oneself)
      const botPhone = (sock.user?.id || '').split(':')[0].split('@')[0];
      const isSelfChat = botPhone && remoteJid.startsWith(botPhone);
      if (msg.key.fromMe && !isSelfChat) continue;

      const senderPhone = normalizePhone(remoteJid.split('@')[0]);

      try {
        await handleIncomingPlayerMessage(sock, msg, remoteJid, senderPhone, isSelfChat);
      } catch (err) {
        addLog('MESSAGE_ERROR', { senderPhone, error: err.message });
        console.error('[Error handling message]:', err);
      }
    }
  });

  return sock;
}

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function convertBengaliDigits(str) {
  if (!str) return '';
  return str.replace(/[০-৯]/g, d => BANGLA_DIGITS.indexOf(d));
}

/**
 * Universal Parser for Player Booking Messages (Format, Key-Value, or Conversational)
 */
export function parseStructuredBookingMessage(rawText) {
  if (!rawText) return {};
  const normalized = convertBengaliDigits(rawText);
  const lines = normalized.split('\n');
  const extracted = {};

  for (const line of lines) {
    const match = line.match(/^([^:=-]+)[:=-]\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const val = match[2].trim();
      if (!val) continue;

      if (key.length <= 25 && key.split(/\s+/).length <= 4) {
        if (key.includes('match') || key.includes('ম্যাচ')) {
          extracted.matchQuery = val;
        } else if (key.includes('squad') || key.includes('team') || key.includes('স্কোয়াড') || key.includes('টিম') || key.includes('দল')) {
          extracted.squadName = val;
        } else if (key.includes('leader') || key.includes('লিডার') || key.includes('ign')) {
          extracted.leaderName = val;
        } else if (key.includes('slot') || key.includes('স্লট')) {
          const num = parseInt(val.replace(/\D/g, ''));
          if (num) extracted.slotNumber = num;
        } else if (key.includes('trx') || key.includes('টিআরএক্স') || key.includes('ট্রানজেকশন') || key.includes('txn')) {
          const trxMatch = val.match(/[A-Za-z0-9]{8,14}/);
          if (trxMatch) extracted.trxId = trxMatch[0].toUpperCase();
        }
      }
    }
  }

  // Fallbacks for inline/unstructured sentences
  if (!extracted.squadName) {
    const teamMatch = normalized.match(/(?:team|squad|টিম|স্কোয়াড)\s*[:=-]?\s*([A-Za-z0-9_\u0980-\u09FF ]+?)(?=\s*(?:slot|স্লট|trx|টিআরএক্স|txn|ম্যাচ|match|$))/i);
    if (teamMatch && teamMatch[1].trim()) extracted.squadName = teamMatch[1].trim();
  }
  if (!extracted.slotNumber) {
    const slotMatch = normalized.match(/(?:slot|স্লট)\s*[:=-]?\s*#?\s*([0-9]{1,2})/i);
    if (slotMatch) extracted.slotNumber = parseInt(slotMatch[1]);
  }
  if (!extracted.trxId) {
    const trxMatch = normalized.match(/(?:trxid|trx|টিআরএক্স|txn)\s*[:=-]?\s*([A-Za-z0-9]{8,14})/i);
    if (trxMatch) extracted.trxId = trxMatch[1].toUpperCase();
  }
  if (!extracted.matchQuery) {
    const matchMatch = normalized.match(/(?:match|ম্যাচ)\s*#?\s*([0-9]{1,2}|bermuda|purgatory|kalahari)/i);
    if (matchMatch) extracted.matchQuery = matchMatch[0].trim();
  }

  return extracted;
}

/**
 * Clean 1-Tap Copyable Booking Template (Sent as a Separate Message)
 */
export function generateCopyableBookingTemplate({
  matchQuery = 'Match 4',
  slotNumber = '',
  trxId = '',
  squadName = '',
  leaderName = ''
} = {}) {
  const matchNum = (matchQuery.toString().match(/\d+/) || ['4'])[0];
  const directLink = `https://ff-squad-arena-bd.web.app/player?match=${matchNum}${slotNumber ? `&slot=${slotNumber}` : ''}`;

  return `[ARENA-BOOKING]
Match: ${matchQuery || 'Match 4'}
Squad Name: ${squadName || ''}
Leader Name: ${leaderName || ''}
Slot No: ${slotNumber || ''}
TrxID: ${trxId || ''}

🌐 ১-ক্লিক ডিরেক্ট বুকিং ও পেমেন্ট ভেরিফাই লিংক:
${directLink}`;
}

/**
 * Smart Message Handler with DokanAI Brain & Silent Filter
 */
async function handleIncomingPlayerMessage(sock, msg, remoteJid, senderPhone, isSelfChat = false) {
  const unwrapped = msg.message?.ephemeralMessage?.message ||
                    msg.message?.viewOnceMessage?.message ||
                    msg.message?.viewOnceMessageV2?.message ||
                    msg.message?.documentWithCaptionMessage?.message ||
                    msg.message;

  const isImage = !!unwrapped?.imageMessage;
  const rawText = extractMessageText(msg.message);

  addLog('INCOMING_MESSAGE', {
    senderPhone,
    remoteJid,
    fromMe: msg.key?.fromMe,
    isSelfChat,
    isImage,
    rawText: rawText.slice(0, 80)
  });

  // Retrieve player session
  const existingSession = sessionManager.get(senderPhone) || {
    chatHistory: [],
    lastActivity: 0
  };

  const isRecentBookingActive = existingSession.lastActivity && (Date.now() - existingSession.lastActivity < 30 * 60 * 1000);
  const isMatchInquiry = isTournamentRelatedText(rawText);

  // 1. SMART TRIGGER & SILENT FILTER:
  // If owner is testing (self-chat), ALWAYS respond!
  // For external players: only respond if tournament-related OR active booking session:
  if (!isSelfChat && !isMatchInquiry && !(isImage && isRecentBookingActive)) {
    addLog('FILTER_IGNORED', { senderPhone, rawText: rawText.slice(0, 50) });
    console.log(`[Silent Filter]: Ignored personal/unrelated chat from ${senderPhone}: "${rawText.slice(0, 30)}"`);
    return;
  }

  console.log(`\n[ARENA X Host Active]: ${isSelfChat ? '👑 Owner Test' : 'Player ' + senderPhone} engaged with: "${rawText.slice(0, 50)}" (Image: ${isImage})`);

  // Mark message as read & send typing presence
  try {
    await sock.readMessages([msg.key]);
    await sock.sendPresenceUpdate('composing', remoteJid);
  } catch (e) {}

  let imageDetails = null;

  // 2. Multimodal OCR if image was sent (bKash/Nagad receipt)
  if (isImage) {
    try {
      await sendBotMessage(sock, remoteJid, { react: { text: '🔍', key: msg.key } });
      const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger });
      imageDetails = await parsePaymentScreenshot(
        buffer,
        msg.message.imageMessage.mimetype || 'image/jpeg',
        rawText
      );
      console.log('[DokanAI Vision Extracted]:', imageDetails);

      if (imageDetails.trx_id) {
        existingSession.trx_id = imageDetails.trx_id;
        existingSession.amount = imageDetails.amount;
        existingSession.payment_method = imageDetails.payment_method;
      }
    } catch (e) {
      console.warn('[DokanAI Vision Error]:', e.message);
    }
  }

  // Update session activity timestamp
  existingSession.lastActivity = Date.now();

  // 3. Parse structured booking details from text
  const parsedBooking = parseStructuredBookingMessage(rawText);

  // Update session with any extracted tokens
  if (parsedBooking.squadName) existingSession.squadName = parsedBooking.squadName;
  if (parsedBooking.slotNumber) existingSession.preferredSlot = parsedBooking.slotNumber;
  if (parsedBooking.leaderName) existingSession.leaderName = parsedBooking.leaderName;
  if (parsedBooking.matchQuery) existingSession.preferredMatch = parsedBooking.matchQuery;
  if (parsedBooking.trxId) existingSession.trx_id = parsedBooking.trxId;
  sessionManager.set(senderPhone, existingSession);

  // 4. FAST BOOKING PATH: If user already provided Squad, Slot, and TrxID (from text, session, or OCR)
  const effectiveSquad = parsedBooking.squadName || existingSession.squadName;
  const effectiveSlot = parsedBooking.slotNumber || existingSession.preferredSlot;
  const effectiveTrx = parsedBooking.trxId || imageDetails?.trx_id || existingSession.trx_id;
  const effectiveMatch = parsedBooking.matchQuery || existingSession.preferredMatch || 'Match 4';

  if (effectiveSquad && effectiveSlot && effectiveTrx) {
    console.log(`[Fast Booking Executing]: Squad "${effectiveSquad}", Slot #${effectiveSlot}, TrxID "${effectiveTrx}" on ${effectiveMatch}`);
    const bookResult = await executeToolCall('verifyAndBookSlot', {
      matchQuery: effectiveMatch,
      slotNumber: effectiveSlot,
      squadName: effectiveSquad,
      leaderName: parsedBooking.leaderName || existingSession.leaderName || `${effectiveSquad}_Lead`,
      contactPhone: senderPhone,
      trxId: effectiveTrx,
      amount: existingSession.amount || 10,
      paymentMethod: existingSession.payment_method || 'bkash'
    }, { phone: senderPhone, ...existingSession });

    if (bookResult && bookResult.success) {
      await sendBotMessage(sock, remoteJid, { react: { text: '✅', key: msg.key } });
      const b = bookResult;
      const confirmationSlip = `🎮 *ARENA X TOURNAMENT CONFIRMATION* 🎮
━━━━━━━━━━━━━━━━━━━━━━━
✅ *আপনার স্কোয়াড সফলভাবে কনফার্ম হয়েছে!*

🏆 *ম্যাচ:* ${b.match?.title || 'Daily Squad Clash'}
🎯 *স্লট নম্বর:* Slot #${b.slotNumber < 10 ? '0' + b.slotNumber : b.slotNumber}
🛡️ *স্কোয়াড:* ${b.squadName}
👑 *লিডার:* ${b.leaderName}
📱 *ভেরিফাইড নম্বর:* ${b.contactPhone}
💰 *পেমেন্ট:* ৳${b.amount} (${(b.paymentMethod || 'bKash').toUpperCase()} - ${b.trxId})
━━━━━━━━━━━━━━━━━━━━━━━
🔑 *রুম আইডি ও পাসওয়ার্ড অ্যাক্সেস:*
ম্যাচ শুরুর ১৫ মিনিট আগে সরাসরি ওয়েবসাইটে গিয়ে আপনার এই হোয়াটসঅ্যাপ নম্বরটি (*${b.contactPhone}*) ভেরিফাই করলেই কাস্টম রুম আইডি ও পাসওয়ার্ড আনলক হয়ে যাবে!

🌐 *লাইভ ওয়েবসাইট:*
${config.tournament.websiteUrl}`;

      await sendBotMessage(sock, remoteJid, { text: confirmationSlip });
      sessionManager.clear(senderPhone);
      return;
    } else if (bookResult && !bookResult.success) {
      await sendBotMessage(sock, remoteJid, {
        text: `⚠️ *বুকিং ব্যর্থ হয়েছে!*\n\n${bookResult.message || bookResult.reason || 'স্লটটি ইতিমধ্যে অন্য কেউ বুক করেছে অথবা TrxID টি ভুল।'}\n\nঅনুগ্রহ করে অন্য একটি স্লট বেছে নিয়ে নিচের ফরম্যাটটি পূরণ করে পাঠান:`
      });
      // Send separate booking format with prefilled TrxID so they can easily pick another slot!
      await new Promise(r => setTimeout(r, 500));
      await sendBotMessage(sock, remoteJid, {
        text: generateCopyableBookingTemplate({
          matchQuery: effectiveMatch,
          squadName: effectiveSquad,
          trxId: effectiveTrx
        })
      });
      return;
    }
  }

  // 5. Run DokanAI Agent Brain (with Tools) for inquiries or partial details
  const agentOutput = await runDokanAiAgent({
    userMessage: rawText,
    senderPhone,
    chatHistory: existingSession.chatHistory || [],
    sessionData: existingSession,
    imageContext: imageDetails
  });

  // Save conversation turn in history (up to last 10 turns)
  if (!existingSession.chatHistory) existingSession.chatHistory = [];
  existingSession.chatHistory.push(
    { role: 'user', parts: [{ text: rawText || '(Sent payment screenshot)' }] },
    { role: 'model', parts: [{ text: agentOutput.replyText }] }
  );
  if (existingSession.chatHistory.length > 10) existingSession.chatHistory = existingSession.chatHistory.slice(-10);
  sessionManager.set(senderPhone, existingSession);

  // 6. Handle Separate Booking Format Message Dispatch
  const isFormatInquiry = /(?:format|ফরম্যাট|কিভাবে|কীভাবে|নিয়ম|rules|process|ফরম্যাট দাও)/i.test(rawText);
  const isExplicitBookingIntent = /(?:বুক করতে চাই|বুক করব|বুকিং করব|slot nite chai|book koren|slot book)/i.test(rawText);
  const isLinkInquiry = /(?:link|লিংক|ওয়েবসাইট|website|web link|direct link)/i.test(rawText);
  const hasPaymentMissingDetails = (imageDetails?.trx_id || existingSession.trx_id) && (!existingSession.squadName || !existingSession.preferredSlot);

  let conversationalText = agentOutput.replyText || '';
  let separateTemplate = null;

  // Ensure dynamic direct match booking link is always available if link was requested or intent expressed
  if ((isLinkInquiry || isExplicitBookingIntent) && !conversationalText.includes('ff-squad-arena-bd.web.app')) {
    const targetMatchNum = existingSession.preferredMatch ? (existingSession.preferredMatch.match(/\d+/) || ['4'])[0] : '4';
    const targetSlot = existingSession.preferredSlot || '';
    const webLink = `https://ff-squad-arena-bd.web.app/player?match=${targetMatchNum}${targetSlot ? `&slot=${targetSlot}` : ''}`;
    conversationalText += `\n\n🔗 *১-ক্লিক ডিরেক্ট বুকিং ও ভেরিফাই লিংক:*\n${webLink}`;
  }

  // Extract template if AI included it in reply text
  if (conversationalText.includes('[ARENA-BOOKING]') || conversationalText.includes('[ARENA BOOKING]')) {
    const splitRegex = /\[ARENA-?BOOKING\][\s\S]*/i;
    const match = conversationalText.match(splitRegex);
    if (match) {
      separateTemplate = match[0].trim();
      conversationalText = conversationalText.replace(splitRegex, '').trim();
    }
  }

  // Generate clean template ONLY when explicitly requested, booking intent expressed, or payment receipt received
  if (!separateTemplate && (isFormatInquiry || isExplicitBookingIntent || hasPaymentMissingDetails)) {
    separateTemplate = generateCopyableBookingTemplate({
      matchQuery: existingSession.preferredMatch || 'Match 4',
      slotNumber: existingSession.preferredSlot || '',
      squadName: existingSession.squadName || '',
      leaderName: existingSession.leaderName || '',
      trxId: imageDetails?.trx_id || existingSession.trx_id || ''
    });
  }

  // Send Message 1: Conversational friendly explanation
  if (conversationalText) {
    addLog('SENDING_REPLY', { remoteJid, text: conversationalText.slice(0, 100) });
    await sendBotMessage(sock, remoteJid, { text: conversationalText });
  }

  // Send Message 2: Standalone 1-Tap Copyable Booking Template (SENT SEPARATELY)
  if (separateTemplate && (!agentOutput.toolExecuted || agentOutput.toolExecuted !== 'verifyAndBookSlot')) {
    addLog('SENDING_TEMPLATE', { remoteJid, template: separateTemplate.slice(0, 60) });
    await new Promise(r => setTimeout(r, 600)); // Natural 600ms gap
    await sendBotMessage(sock, remoteJid, { text: separateTemplate });
  }

  // 7. If a slot was successfully booked via Gemini's verifyAndBookSlot tool:
  if (agentOutput.toolExecuted === 'verifyAndBookSlot' && agentOutput.toolResult?.success) {
    await sendBotMessage(sock, remoteJid, { react: { text: '✅', key: msg.key } });

    const b = agentOutput.toolResult;
    const confirmationSlip = `🎮 *ARENA X TOURNAMENT CONFIRMATION* 🎮
━━━━━━━━━━━━━━━━━━━━━━━
✅ *আপনার স্কোয়াড সফলভাবে কনফার্ম হয়েছে!*

🏆 *ম্যাচ:* ${b.match?.title || 'Daily Squad Clash'}
🎯 *স্লট নম্বর:* Slot #${b.slotNumber < 10 ? '0' + b.slotNumber : b.slotNumber}
🛡️ *স্কোয়াড:* ${b.squadName}
👑 *লিডার:* ${b.leaderName}
📱 *ভেরিফাইড নম্বর:* ${b.contactPhone}
💰 *পেমেন্ট:* ৳${b.amount} (${(b.paymentMethod || 'bKash').toUpperCase()} - ${b.trxId})
━━━━━━━━━━━━━━━━━━━━━━━
🔑 *রুম আইডি ও পাসওয়ার্ড অ্যাক্সেস:*
ম্যাচ শুরুর ১৫ মিনিট আগে সরাসরি ওয়েবসাইটে গিয়ে আপনার এই হোয়াটসঅ্যাপ নম্বরটি (*${b.contactPhone}*) ভেরিফাই করলেই কাস্টম রুম আইডি ও পাসওয়ার্ড আনলক হয়ে যাবে!

🌐 *লাইভ ওয়েবসাইট:*
${config.tournament.websiteUrl}`;

    await sendBotMessage(sock, remoteJid, { text: confirmationSlip });

    // Clear session after successful booking
    sessionManager.clear(senderPhone);
  }
}
