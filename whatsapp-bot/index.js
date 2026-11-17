import { startWhatsAppBot } from './services/whatsapp.js';
import { initFirestore } from './services/firestore.js';
import { startWebServer } from './services/server.js';
import { config } from './config.js';

console.log(`
======================================================
  🔥 ARENA X — AUTONOMOUS WHATSAPP TOURNAMENT BOT 🔥
======================================================
- Engine: Node.js (ESM)
- WhatsApp Client: @whiskeysockets/baileys
- AI Vision & Parser: Google Gemini 1.5 Flash
- Database: Firebase Cloud Firestore (Real-time Sync)
- Anti-Fraud: Automatic Duplicate TrxID & OCR Filter
======================================================
`);

async function main() {
  // 0. Start Web Dashboard & Cloud Healthcheck Server (for Render / Koyeb / Mobile Pairing)
  startWebServer(process.env.PORT || 3000);

  // 1. Verify Gemini API Key
  if (!config.gemini.apiKey) {
    console.error('❌ [CRITICAL]: GEMINI_API_KEY is missing!');
    console.error('Please create a .env file and add your Google Gemini API Key from:');
    console.error('👉 https://aistudio.google.com/app/apikey\n');
  } else {
    console.log('✓ Google Gemini API Key configured.');
  }

  // 2. Initialize Firestore
  try {
    initFirestore();
    console.log('✓ Firebase Firestore connected successfully.');
  } catch (err) {
    console.warn('⚠️ [Firestore Warning]:', err.message);
    console.warn('Make sure serviceAccountKey.json is in the bot root folder.\n');
  }

  // 3. Launch WhatsApp Bot
  try {
    await startWhatsAppBot();
  } catch (err) {
    console.error('❌ [WhatsApp Launch Error]:', err);
    process.exit(1);
  }

  // 3b. Auto-resume existing registered tenant bots from Cloud Firestore & local disk
  try {
    const { initFirestore, clientCollection, getClientDocs } = await import('./services/firestore.js');
    const { clientDbInstance } = initFirestore();
    const bootedTenants = new Set();

    if (clientDbInstance) {
      const sessionsSnap = await getClientDocs(clientCollection(clientDbInstance, 'bot_sessions'));
      sessionsSnap.forEach(docSnap => {
        const clientId = docSnap.id;
        // Ignore test docs or default demo bot (which was already booted in step 3)
        if (clientId && clientId !== 'test_doc' && clientId !== 'test_bundle' && clientId !== 'default_client') {
          bootedTenants.add(clientId);
          console.log(`✓ [Auto-Resume]: Found cloud session for tenant [${clientId}]. Booting bot...`);
          startWhatsAppBot(clientId).catch(e => console.warn(`[Auto-Resume ${clientId} Error]:`, e.message));
        }
      });
    }

    // Also check local disk for any offline/local sessions not yet in cloud
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const items = fs.readdirSync(__dirname);
    for (const item of items) {
      if (item.startsWith('auth_info_tenant_')) {
        const tenantSlug = item.replace('auth_info_tenant_', '');
        if (!bootedTenants.has(tenantSlug)) {
          const credsPath = path.join(__dirname, item, 'creds.json');
          if (fs.existsSync(credsPath)) {
            console.log(`[Auto-Resume]: Found disk session for tenant [${tenantSlug}]. Booting bot...`);
            startWhatsAppBot(tenantSlug).catch(e => console.warn(`[Auto-Resume ${tenantSlug} Error]:`, e.message));
          }
        }
      }
    }
  } catch (e) {
    console.warn('[Tenant Auto-Resume Warning]:', e.message);
  }

  // 3c. 24/7 Sentinel Keep-Alive (Prevents Render Free Tier from sleeping)
  start24x7KeepAlive();
}

function start24x7KeepAlive() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || 'https://bd-battle-pro.onrender.com';
  console.log(`[Keep-Alive]: 24/7 Sentinel active. Pinging ${targetUrl}/health every 8 minutes...`);
  
  // Initial ping after 30 seconds
  setTimeout(async () => {
    try {
      const res = await fetch(`${targetUrl}/health`);
      if (res.ok) console.log(`✓ [Keep-Alive]: Initial warmup ping success to ${targetUrl}/health`);
    } catch (e) {}
  }, 30000);

  // Recurring ping every 8 minutes (480,000 ms)
  setInterval(async () => {
    try {
      const res = await fetch(`${targetUrl}/health`);
      if (res.ok) {
        console.log(`✓ [Keep-Alive]: Sentinel ping success at ${new Date().toLocaleTimeString()} (Status: ${res.status})`);
      }
    } catch (e) {
      console.warn('[Keep-Alive Notice]: Sentinel ping error:', e.message);
    }
  }, 8 * 60 * 1000);
}

// Graceful exit handlers
process.on('SIGINT', () => {
  console.log('\n[Bot]: Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Bot]: Received SIGTERM. Shutting down...');
  process.exit(0);
});

main();
