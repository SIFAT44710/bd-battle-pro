import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  Browsers,
  isJidBroadcast,
  isJidNewsletter
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runDokanAiAgent, parsePaymentScreenshot, transcribeAndParseVoiceNote, executeToolCall } from './gemini.js';
import { normalizePhone } from './firestore.js';
import { sessionManager } from './session.js';
import { config } from '../config.js';
import { botState, registerSocket, addLog } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.resolve(__dirname, '../auth_info_baileys');

const logger = pino({ level: config.bot.debug ? 'debug' : 'silent' });

// Track message IDs dispatched by this bot instance to avoid self-reply loops
const botSentMessageIds = new Set();

let backupDebounceTimers = new Map();

/**
 * Cloud-Resilient Auth Backup to Cloud Firestore
 * Serializes local Baileys session files and pushes to collection `bot_sessions/{clientId}`.
 * Completely immune to ephemeral disk resets on Render/Railway/Koyeb!
 */
export async function backupAuthDirToFirestore(dirPath, clientId) {
  try {
    const { initFirestore, clientDoc, clientSetDoc } = await import('./firestore.js');
    const { driver, adminDb, clientDbInstance } = initFirestore();
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    const bundle = {};
    for (const f of files) {
      if (f.endsWith('.json')) {
        try {
          bundle[f] = fs.readFileSync(path.join(dirPath, f), 'utf8');
        } catch (e) {}
      }
    }

    if (Object.keys(bundle).length === 0) return;

    const payload = {
      bundleJson: JSON.stringify(bundle),
      fileCount: Object.keys(bundle).length,
      updatedAt: new Date().toISOString()
    };

    if (driver === 'admin' && adminDb) {
      await adminDb.collection('bot_sessions').doc(clientId).set(payload, { merge: true });
    } else if (clientDbInstance) {
      await clientSetDoc(clientDoc(clientDbInstance, 'bot_sessions', clientId), payload, { merge: true });
    }
    console.log(`✓ [CloudAuth]: Backed up ${Object.keys(bundle).length} auth files to Firestore (bot_sessions/${clientId}).`);
  } catch (err) {
    console.warn(`[CloudAuth Backup Notice for ${clientId}]:`, err.message);
  }
}

export function debouncedCloudBackup(dirPath, clientId, immediate = false) {
  if (backupDebounceTimers.has(clientId)) {
    clearTimeout(backupDebounceTimers.get(clientId));
  }
  if (immediate) {
    backupAuthDirToFirestore(dirPath, clientId);
    return;
  }
  const timer = setTimeout(() => {
    backupAuthDirToFirestore(dirPath, clientId);
    backupDebounceTimers.delete(clientId);
  }, 2500);
  backupDebounceTimers.set(clientId, timer);
}

/**
 * Restores Baileys session credentials from Cloud Firestore before socket creation.
 */
export async function restoreAuthDirFromFirestore(dirPath, clientId) {
  try {
    const credsPath = path.join(dirPath, 'creds.json');
    if (fs.existsSync(credsPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (existing?.me?.id || existing?.registered) {
          console.log(`✓ [CloudAuth]: Using existing local session (${clientId}).`);
          return true;
        }
      } catch (e) {}
    }

    const { initFirestore, clientDoc, getClientDoc } = await import('./firestore.js');
    const { driver, adminDb, clientDbInstance } = initFirestore();
    let bundleJson = null;

    if (driver === 'admin' && adminDb) {
      const snap = await adminDb.collection('bot_sessions').doc(clientId).get();
      if (snap.exists) bundleJson = snap.data()?.bundleJson;
    } else if (clientDbInstance) {
      const ref = clientDoc(clientDbInstance, 'bot_sessions', clientId);
      const snap = await getClientDoc(ref);
      if (snap.exists()) bundleJson = snap.data()?.bundleJson;
    }

    if (!bundleJson) {
      console.log(`ℹ [CloudAuth]: No cloud session found for [${clientId}]. Ready for new pairing.`);
      return false;
    }

    const bundle = JSON.parse(bundleJson);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let restoredCount = 0;
    for (const [filename, content] of Object.entries(bundle)) {
      try {
        fs.writeFileSync(path.join(dirPath, filename), content, 'utf8');
        restoredCount++;
      } catch (e) {}
    }

    console.log(`✓ [CloudAuth]: Restored ${restoredCount} session files from Firestore for [${clientId}]!`);
    return true;
  } catch (err) {
    console.warn(`[CloudAuth Restore Notice for ${clientId}]:`, err.message);
    return false;
  }
}

/**
 * Clears cloud session on logout / user reset
 */
export async function clearCloudAuthFromFirestore(clientId) {
  try {
    const { initFirestore, clientDoc } = await import('./firestore.js');
    const { driver, adminDb, clientDbInstance } = initFirestore();
    if (driver === 'admin' && adminDb) {
      await adminDb.collection('bot_sessions').doc(clientId).delete();
    } else if (clientDbInstance) {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(clientDoc(clientDbInstance, 'bot_sessions', clientId));
    }
    console.log(`✓ [CloudAuth]: Cleared cloud session from Firestore (bot_sessions/${clientId}).`);
  } catch (err) {
    console.warn(`[CloudAuth Clear Notice for ${clientId}]:`, err.message);
  }
}

export const activeSockets = new Map(); // key: 'demo' or tenantSlug
export function getSocket(tenantSlug = null) {
  return activeSockets.get(tenantSlug || 'demo');
}

export async function syncTenantBotStateToFirestore(tenantSlug, data) {
  if (!tenantSlug || tenantSlug === 'demo') {
    return syncBotStateToFirestore(data);
  }
  try {
    const { initFirestore, clientDoc, clientSetDoc } = await import('./firestore.js');
    const { driver, adminDb, clientDbInstance } = initFirestore();
    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    if (driver === 'admin' && adminDb) {
      await adminDb.collection('tenants').doc(tenantSlug).set(payload, { merge: true });
    } else if (clientDbInstance) {
      await clientSetDoc(clientDoc(clientDbInstance, 'tenants', tenantSlug), payload, { merge: true });
    }
  } catch (err) {
    console.warn(`[syncTenantBotStateToFirestore Notice for ${tenantSlug}]:`, err.message);
  }
}

export async function syncBotStateToFirestore(data) {
  try {
    const { initFirestore, clientDoc, clientSetDoc } = await import('./firestore.js');
    const { driver, adminDb, clientDbInstance } = initFirestore();
    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    if (driver === 'admin' && adminDb) {
      await adminDb.collection('settings').doc('whatsapp_bot').set(payload, { merge: true });
    } else if (clientDbInstance) {
      await clientSetDoc(clientDoc(clientDbInstance, 'settings', 'whatsapp_bot'), payload, { merge: true });
    }
  } catch (err) {
    console.warn('[syncBotStateToFirestore Notice]:', err.message);
  }
}

let bridgeListenerStarted = false;
export async function startFirestoreBridgeListener() {
  if (bridgeListenerStarted) return;
  bridgeListenerStarted = true;
  try {
    const { initFirestore, clientDoc, clientOnSnapshot, updateClientDoc } = await import('./firestore.js');
    const { clientDbInstance } = initFirestore();
    if (clientDbInstance) {
      // 1. Listen for Pairing & Init Requests
      clientOnSnapshot(clientDoc(clientDbInstance, 'settings', 'bot_pairing_request'), async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data || data.processed) return;
        const isTenant = data.org && data.org !== 'demo';
        const targetOrg = isTenant ? data.org : null;
        console.log(`[Firestore Bridge]: Incoming Request [action=${data.action || 'pair'}] for target: ${data.org || 'demo'}, phone: ${data.phone || 'N/A'}`);

        try {
          if (data.action === 'init_qr' && targetOrg) {
            console.log(`[Firestore Bridge]: Initializing dedicated QR code for tenant [${targetOrg}]...`);
            await startWhatsAppBot(targetOrg);
          } else if (data.phone) {
            const rawDigits = data.phone.replace(/\D/g, '');
            const cleanPhone = rawDigits.startsWith('880') ? rawDigits : (rawDigits.startsWith('0') ? '88' + rawDigits : '880' + rawDigits);

            let targetSock = activeSockets.get(targetOrg || 'demo');
            if (!targetSock || targetSock.authState?.creds?.registered) {
              await startWhatsAppBot(targetOrg);
              targetSock = activeSockets.get(targetOrg || 'demo');
            }

            if (targetSock && !targetSock.authState?.creds?.registered) {
              console.log(`[Firestore Bridge]: Requesting pairing code for ${cleanPhone} on [${targetOrg || 'demo'}]...`);
              const code = await targetSock.requestPairingCode(cleanPhone);
              const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
              
              if (targetOrg) {
                await syncTenantBotStateToFirestore(targetOrg, {
                  whatsappPairingCode: formatted,
                  whatsappBotPhone: cleanPhone,
                  whatsappBotStatus: 'pairing_ready'
                });
              } else {
                botState.pairingCode = formatted;
                botState.status = 'pairing_ready';
                await syncBotStateToFirestore({
                  pairingCode: formatted,
                  targetPhone: cleanPhone,
                  status: 'pairing_ready'
                });
              }
            }
          }
        } catch (e) {
          console.error('[Firestore Bridge Pairing/Init Error]:', e.message);
        } finally {
          try {
            await updateClientDoc(clientDoc(clientDbInstance, 'settings', 'bot_pairing_request'), {
              processed: true,
              processedAt: new Date().toISOString()
            });
          } catch (e) {}
        }
      });

      // 2. Listen for Session Reset Requests
      clientOnSnapshot(clientDoc(clientDbInstance, 'settings', 'bot_reset_request'), async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data || data.processed) return;
        const isTenant = data.org && data.org !== 'demo';
        console.log(`[Firestore Bridge]: Incoming Reset Request for [${data.org || 'demo'}]...`);
        try {
          const authDirToClean = isTenant ? path.resolve(__dirname, `../auth_info_tenant_${data.org}`) : authDir;
          if (fs.existsSync(authDirToClean)) {
            fs.rmSync(authDirToClean, { recursive: true, force: true });
          }
          await clearCloudAuthFromFirestore(data.org || 'demo');
          if (isTenant) {
            if (activeSockets.has(data.org)) {
              try {
                const s = activeSockets.get(data.org);
                s.ev.removeAllListeners();
                s.end(undefined);
              } catch (e) {}
              activeSockets.delete(data.org);
            }
            await syncTenantBotStateToFirestore(data.org, {
              whatsappBotQr: null,
              whatsappBotQrImageUrl: null,
              whatsappPairingCode: '',
              whatsappBotConnected: false,
              whatsappBotStatus: 'starting'
            });
          } else {
            if (activeSockets.has('demo')) {
              try {
                const s = activeSockets.get('demo');
                s.ev.removeAllListeners();
                s.end(undefined);
              } catch (e) {}
              activeSockets.delete('demo');
            }
            botState.status = 'starting';
            botState.qr = null;
            botState.pairingCode = null;
            botState.user = null;
          }
          await startWhatsAppBot(isTenant ? data.org : null);
        } catch (e) {
          console.error('[Firestore Bridge Reset Error]:', e.message);
        } finally {
          try {
            await updateClientDoc(clientDoc(clientDbInstance, 'settings', 'bot_reset_request'), {
              processed: true,
              processedAt: new Date().toISOString()
            });
          } catch (e) {}
        }
      });

      console.log('✓ [Firestore Bridge]: Reactive cloud command listener active.');
    }
  } catch (err) {
    console.warn('[startFirestoreBridgeListener Notice]:', err.message);
  }
}

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
            message.editedMessage?.message?.protocolMessage?.editedMessage ||
            message;
  return m.conversation ||
         m.extendedTextMessage?.text ||
         m.imageMessage?.caption ||
         m.documentMessage?.caption ||
         m.videoMessage?.caption ||
         m.buttonsResponseMessage?.selectedButtonId ||
         m.listResponseMessage?.singleSelectReply?.selectedRowId ||
         m.templateButtonReplyMessage?.selectedId ||
         '';
}

let currentSock = null;

export async function startWhatsAppBot(tenantSlug = null) {
  const socketKey = tenantSlug || 'demo';

  // If this specific socket already exists, close it cleanly before replacing
  if (activeSockets.has(socketKey)) {
    try {
      const oldSock = activeSockets.get(socketKey);
      oldSock._isReplaced = true;
      if (oldSock._heartbeatTimer) clearInterval(oldSock._heartbeatTimer);
      oldSock.ev.removeAllListeners();
      oldSock.end(undefined);
    } catch (e) {}
    activeSockets.delete(socketKey);
  }

  const activeAuthDir = tenantSlug ? path.resolve(__dirname, `../auth_info_tenant_${tenantSlug}`) : authDir;

  if (!fs.existsSync(activeAuthDir)) {
    fs.mkdirSync(activeAuthDir, { recursive: true });
  }

  // Cloud Firestore Session Recovery: Restore saved keys before Baileys boots
  await restoreAuthDirFromFirestore(activeAuthDir, socketKey);

  // Multi-File Auth State (Local, atomic, and rock-solid)
  const { state, saveCreds } = await useMultiFileAuthState(activeAuthDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[WhatsApp]: Starting Baileys Client (v${version.join('.')}, isLatest: ${isLatest}, Target: ${tenantSlug ? `Tenant [${tenantSlug}]` : 'Central Demo'})...`);

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
    browser: Browsers.ubuntu('Chrome'),
    getMessage: async (key) => {
      return { conversation: 'ARENA X Bot' };
    },
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidNewsletter(jid) || jid.endsWith('@newsletter')
  });

  sock.tenantSlug = tenantSlug;
  activeSockets.set(socketKey, sock);
  if (!tenantSlug) {
    currentSock = sock;
    registerSocket(sock);
  }
  startFirestoreBridgeListener();

  // Save auth state changes directly to Firestore & local cache
  sock.ev.on('creds.update', async () => {
    await saveCreds();
    debouncedCloudBackup(activeAuthDir, socketKey);
  });

  // Connection Updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    addLog('CONNECTION_UPDATE', {
      target: tenantSlug || 'demo',
      connection: connection || 'status_update',
      isNewLogin: update.isNewLogin
    });

    if (qr) {
      let qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=320x320`;
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
        if (qrDataUrl) qrImageUrl = qrDataUrl;
      } catch (e) {}

      if (tenantSlug) {
        console.log('\n======================================================');
        console.log(`📱 [Tenant ${tenantSlug}]: Dedicated Live QR Code generated & synced!`);
        console.log('======================================================\n');
        qrcode.generate(qr, { small: true });
        console.log(`\nOpen WhatsApp on tenant phone > Settings > Linked Devices > Link a Device\n`);

        await syncTenantBotStateToFirestore(tenantSlug, {
          whatsappBotQr: qr,
          whatsappBotQrImageUrl: qrImageUrl,
          whatsappBotStatus: 'qr_ready',
          whatsappPairingCode: ''
        });
      } else {
        botState.qr = qr;
        botState.status = 'qr_ready';
        syncBotStateToFirestore({
          qr,
          qrImageUrl,
          status: 'qr_ready',
          pairingCode: botState.pairingCode || ''
        });
        console.log('\n======================================================');
        console.log('📱 SCAN THIS DEMO WHATSAPP QR CODE WITH YOUR PHONE:');
        console.log('======================================================\n');
        qrcode.generate(qr, { small: true });
        console.log('\nOpen WhatsApp > Settings > Linked Devices > Link a Device\n');
      }
    }

    if (connection === 'close') {
      if (sock._isReplaced) return; // Discard superseded socket events
      if (sock._heartbeatTimer) clearInterval(sock._heartbeatTimer);

      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isRegistered = Boolean(sock.authState?.creds?.registered || sock.authState?.creds?.me?.id);

      addLog('CONNECTION_CLOSED', {
        target: tenantSlug || 'demo',
        statusCode,
        isRegistered,
        reason: lastDisconnect?.error?.message || 'closed'
      });

      console.log(`[WhatsApp ${tenantSlug || 'demo'}]: Connection closed (${statusCode || 'unknown'}). Registered: ${isRegistered}.`);

      // Only broadcast 'disconnected' to Firestore if the bot was previously logged-in/registered.
      // If still pairing/scanning QR, leave status as 'qr_ready' so the UI doesn't flash false alarms!
      if (isRegistered) {
        if (tenantSlug) {
          await syncTenantBotStateToFirestore(tenantSlug, {
            whatsappBotConnected: false,
            whatsappBotStatus: 'disconnected'
          });
        } else {
          botState.status = 'disconnected';
          botState.user = null;
          syncBotStateToFirestore({
            status: 'disconnected',
            user: null
          });
        }
      }

      // If logged out (401), credentials are invalid/expired; wipe cache so it doesn't loop
      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        console.log(`[WhatsApp ${tenantSlug || 'demo'}]: Session expired (401). Wiping credentials...`);
        try {
          if (fs.existsSync(activeAuthDir)) {
            fs.rmSync(activeAuthDir, { recursive: true, force: true });
          }
          fs.mkdirSync(activeAuthDir, { recursive: true });
          await clearCloudAuthFromFirestore(socketKey);
        } catch (e) {
          console.error('[WhatsApp]: Error clearing authDir:', e.message);
        }
      }

      const reconnectDelay = statusCode === 515 ? 1000 : 3000;
      setTimeout(() => {
        if (!sock._isReplaced && (activeSockets.get(socketKey) === sock || !activeSockets.has(socketKey))) {
          startWhatsAppBot(tenantSlug);
        }
      }, reconnectDelay);
    } else if (connection === 'open') {
      debouncedCloudBackup(activeAuthDir, socketKey, true);
      if (tenantSlug) {
        await syncTenantBotStateToFirestore(tenantSlug, {
          whatsappBotConnected: true,
          whatsappBotStatus: 'connected',
          whatsappBotUser: sock.user?.id || 'Connected',
          whatsappBotLinkedAt: new Date().toISOString(),
          whatsappBotQr: null,
          whatsappBotQrImageUrl: null,
          whatsappPairingCode: null
        });
        console.log('\n======================================================');
        console.log(`🟢 [Tenant ${tenantSlug}]: DEDICATED WHATSAPP BOT CONNECTED AS: ${sock.user?.id || 'ARENA X'}`);
        console.log('======================================================\n');
      } else {
        botState.status = 'connected';
        botState.user = sock.user?.id || 'Connected';
        botState.connectedAt = new Date().toISOString();
        botState.qr = null;
        botState.pairingCode = null;
        syncBotStateToFirestore({
          status: 'connected',
          connectedAt: new Date().toISOString(),
          user: sock.user?.id || 'Connected',
          qr: null,
          qrImageUrl: null,
          pairingCode: null
        });
        console.log('\n======================================================');
        console.log(`🟢 DEMO WHATSAPP BOT ONLINE & CONNECTED AS: ${sock.user?.id || 'ARENA X'}`);
        console.log('======================================================\n');
      }

      // Keep WhatsApp WebSocket actively listening & prevent TCP idle drops
      if (sock._heartbeatTimer) clearInterval(sock._heartbeatTimer);
      sock._heartbeatTimer = setInterval(async () => {
        try {
          await sock.sendPresenceUpdate('available');
        } catch (e) {}
      }, 3 * 60 * 1000); // Every 3 minutes
    }
  });

  // Incoming Messages Handler with Smart Trigger & Silent Filter
  sock.ev.on('messages.upsert', async (m) => {
    // If bot is stopped or paused via config, skip processing immediately
    if (config.bot.enabled === false) {
      return;
    }
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
      const isSelfChat = msg.key.fromMe && (
        (botPhone && remoteJid.includes(botPhone)) ||
        remoteJid.endsWith('@lid') ||
        remoteJid === sock.user?.id
      );
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
  leaderName = '',
  tenantSlug = ''
} = {}) {
  const matchNum = (matchQuery.toString().match(/\d+/) || ['4'])[0];
  const orgParam = tenantSlug ? `org=${encodeURIComponent(tenantSlug)}&` : '';
  const directLink = `https://ff-squad-arena-bd.web.app/player?${orgParam}match=${matchNum}${slotNumber ? `&slot=${slotNumber}` : ''}`;

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
  const isAudio = !!unwrapped?.audioMessage;
  let rawText = extractMessageText(msg.message);

  let imageDetails = null;
  let voiceDetails = null;

  // Retrieve player session
  const existingSession = sessionManager.get(senderPhone) || {
    chatHistory: [],
    lastActivity: 0
  };

  // 1. Multimodal Audio Processing if voice note sent
  if (isAudio) {
    try {
      await sendBotMessage(sock, remoteJid, { react: { text: '🎙️', key: msg.key } });
      const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger });
      const audioMime = unwrapped.audioMessage.mimetype || 'audio/ogg; codecs=opus';
      voiceDetails = await transcribeAndParseVoiceNote(buffer, audioMime);
      console.log('[DokanAI Voice Extracted]:', voiceDetails);

      if (voiceDetails.transcription) {
        rawText = voiceDetails.transcription;
      }
      if (voiceDetails.trx_id) existingSession.trx_id = voiceDetails.trx_id;
      if (voiceDetails.amount) existingSession.amount = voiceDetails.amount;
      if (voiceDetails.payment_method) existingSession.payment_method = voiceDetails.payment_method;
      if (voiceDetails.match_query) existingSession.preferredMatch = voiceDetails.match_query;
      if (voiceDetails.slot_number) existingSession.preferredSlot = voiceDetails.slot_number;
      if (voiceDetails.squad_name) existingSession.squadName = voiceDetails.squad_name;
      if (voiceDetails.leader_name) existingSession.leaderName = voiceDetails.leader_name;
    } catch (e) {
      console.warn('[DokanAI Voice Error]:', e.message);
    }
  }

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

  addLog('INCOMING_MESSAGE', {
    senderPhone,
    remoteJid,
    fromMe: msg.key?.fromMe,
    isSelfChat,
    isImage,
    isAudio,
    rawText: rawText.slice(0, 80)
  });

  const isRecentBookingActive = existingSession.lastActivity && (Date.now() - existingSession.lastActivity < 30 * 60 * 1000);
  const isMatchInquiry = isTournamentRelatedText(rawText);

  // 3. SMART TRIGGER: Respond to all incoming customer chats, owner self-chats, and tournament inquiries
  if (!rawText && !isImage && !isAudio) {
    return;
  }

  console.log(`\n[ARENA X Host Active]: ${isSelfChat ? '👑 Owner Test' : 'Player ' + senderPhone} engaged with: "${rawText.slice(0, 50)}" (Image: ${isImage}, Audio: ${isAudio})`);

  // Mark message as read & send typing presence
  try {
    await sock.readMessages([msg.key]);
    await sock.sendPresenceUpdate('composing', remoteJid);
  } catch (e) {}

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
    if (process.env.DEMO_MODE === 'true') {
      console.log(`[DEMO_MODE ACTIVE]: Fast booking intercepted for "${effectiveSquad}". Sending demo notice.`);
      await sendBotMessage(sock, remoteJid, { react: { text: '🔒', key: msg.key } });
      await sendBotMessage(sock, remoteJid, {
        text: "এটি একটি ডেমো বট। রিয়েল বুকিং সম্পন্ন করতে পূর্ণ এক্সেস প্রয়োজন। WhatsApp-এ +8801872733642 নম্বরে যোগাযোগ করুন।"
      });
      sessionManager.clear(senderPhone);
      return;
    }

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
    }, { phone: senderPhone, tenantSlug: sock.tenantSlug, ...existingSession });

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
          trxId: effectiveTrx,
          tenantSlug: sock.tenantSlug || ''
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
    sessionData: { tenantSlug: sock.tenantSlug, ...existingSession },
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

  // Tenant link isolation: If this is an organizer's bot, guarantee that all player links include ?org=tenantSlug
  if (sock.tenantSlug && sock.tenantSlug !== 'demo' && sock.tenantSlug !== 'ff-daily-squad') {
    const orgEnc = encodeURIComponent(sock.tenantSlug);
    // Replace any generic player?match= with player?org=slug&match=
    conversationalText = conversationalText.replace(
      /https:\/\/ff-squad-arena-bd\.web\.app\/player\?(?!org=)/g,
      `https://ff-squad-arena-bd.web.app/player?org=${orgEnc}&`
    );
    // Replace any bare player link without parameters
    conversationalText = conversationalText.replace(
      /https:\/\/ff-squad-arena-bd\.web\.app\/player(?![/?\w])/g,
      `https://ff-squad-arena-bd.web.app/player?org=${orgEnc}`
    );
  }

  // Ensure dynamic direct match booking link is always available if link was requested or intent expressed
  const hasTenantLink = sock.tenantSlug && sock.tenantSlug !== 'demo' && sock.tenantSlug !== 'ff-daily-squad'
    ? conversationalText.includes(`org=${encodeURIComponent(sock.tenantSlug)}`)
    : conversationalText.includes('ff-squad-arena-bd.web.app');

  if ((isLinkInquiry || isExplicitBookingIntent) && !hasTenantLink) {
    const targetMatchNum = existingSession.preferredMatch ? (existingSession.preferredMatch.match(/\d+/) || ['4'])[0] : '4';
    const targetSlot = existingSession.preferredSlot || '';
    const orgParam = (sock.tenantSlug && sock.tenantSlug !== 'demo' && sock.tenantSlug !== 'ff-daily-squad')
      ? `org=${encodeURIComponent(sock.tenantSlug)}&`
      : '';
    const webLink = `https://ff-squad-arena-bd.web.app/player?${orgParam}match=${targetMatchNum}${targetSlot ? `&slot=${targetSlot}` : ''}`;
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
      trxId: imageDetails?.trx_id || existingSession.trx_id || '',
      tenantSlug: sock.tenantSlug || ''
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

  // 7. If verifyAndBookSlot was called:
  if (agentOutput.toolExecuted === 'verifyAndBookSlot') {
    if (process.env.DEMO_MODE === 'true' || agentOutput.toolResult?.isDemo) {
      await sendBotMessage(sock, remoteJid, { react: { text: '🔒', key: msg.key } });
      await sendBotMessage(sock, remoteJid, {
        text: "এটি একটি ডেমো বট। রিয়েল বুকিং সম্পন্ন করতে পূর্ণ এক্সেস প্রয়োজন। WhatsApp-এ +8801872733642 নম্বরে যোগাযোগ করুন।"
      });
      sessionManager.clear(senderPhone);
      return;
    }

    if (agentOutput.toolResult?.success) {
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
}
