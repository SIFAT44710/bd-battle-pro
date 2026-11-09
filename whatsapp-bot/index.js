import { startWhatsAppBot } from './services/whatsapp.js';
import { initFirestore } from './services/firestore.js';
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
