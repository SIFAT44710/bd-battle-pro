import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizePhone } from './firestore.js';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const botState = {
  status: 'starting', // 'starting' | 'qr_ready' | 'pairing_ready' | 'connected' | 'disconnected'
  qr: null,
  pairingCode: null,
  user: null,
  connectedAt: null,
  lastPing: new Date().toISOString()
};

export const recentLogs = [];
export function addLog(type, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    data
  };
  recentLogs.unshift(entry);
  if (recentLogs.length > 50) recentLogs.pop();
  console.log(`[${type}]:`, JSON.stringify(data));
}

let currentSock = null;

export function registerSocket(sock) {
  currentSock = sock;
}

export function startWebServer(port = process.env.PORT || 3000) {
  const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // 1. Health check & Ping endpoint (Keeps Render free tier 24/7 awake)
    if (url.pathname === '/health' || url.pathname === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        botStatus: botState.status,
        connected: botState.status === 'connected',
        user: botState.user,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // 1b. Live Debug Logs endpoint
    if (url.pathname === '/logs') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: botState.status,
        user: botState.user,
        uptime: Math.floor(process.uptime()),
        recentLogs
      }, null, 2));
      return;
    }

    // 1c. Test Send Message directly to phone
    if (url.pathname === '/api/send-test') {
      const phone = (url.searchParams.get('phone') || config.contact?.phone || '01872733642').replace(/\D/g, '');
      const fullPhone = phone.startsWith('880') ? phone : (phone.startsWith('0') ? '88' + phone : '880' + phone);
      const jid = `${fullPhone}@s.whatsapp.net`;
      try {
        if (!currentSock) throw new Error('WhatsApp Socket not initialized yet');
        const sendResult = await currentSock.sendMessage(jid, {
          text: `🎮 *ARENA X BOT TEST*: আপনার হোয়াটসঅ্যাপ বট সফলভাবে কানেক্টেড রয়েছে এবং মেসেজ পাঠাতে পারছে! (Time: ${new Date().toLocaleTimeString()})`
        });
        addLog('TEST_SEND_SUCCESS', { jid, messageId: sendResult.key?.id });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: sendResult.key?.id, jid }));
      } catch (err) {
        addLog('TEST_SEND_ERROR', { error: err.message });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // 1c2. Simulate Player Chat turn via DokanAI Agent Brain & dispatch via WhatsApp
    if (url.pathname === '/api/simulate-chat') {
      const message = url.searchParams.get('message') || 'আজকে কি কি ম্যাচ আছে ভাই?';
      const phone = (url.searchParams.get('phone') || config.contact?.phone || '01872733642').replace(/\D/g, '');
      const fullPhone = phone.startsWith('880') ? phone : (phone.startsWith('0') ? '88' + phone : '880' + phone);
      const jid = `${fullPhone}@s.whatsapp.net`;

      try {
        const { runDokanAiAgent } = await import('./gemini.js');
        const agentOutput = await runDokanAiAgent({
          userMessage: message,
          senderPhone: fullPhone,
          chatHistory: []
        });

        let sendStatus = 'skipped_no_socket';
        if (currentSock) {
          await currentSock.sendMessage(jid, { text: agentOutput.replyText });
          sendStatus = 'delivered';
          addLog('SIMULATED_CHAT_DELIVERED', { jid, text: agentOutput.replyText.slice(0, 80) });
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message,
          reply: agentOutput.replyText,
          toolExecuted: agentOutput.toolExecuted,
          sendStatus
        }, null, 2));
      } catch (err) {
        addLog('SIMULATE_CHAT_ERROR', { error: err.message });
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // 1d. Reset Session endpoint (Clears stale session to allow clean re-pairing)
    if (url.pathname === '/api/reset-session') {
      const orgSlug = url.searchParams.get('org')?.trim();
      const isTenant = orgSlug && orgSlug !== 'ff-daily-squad';
      try {
        const { activeSockets, startWhatsAppBot, syncTenantBotStateToFirestore, clearCloudAuthFromFirestore } = await import('./whatsapp.js');
        const authFolderName = isTenant ? `auth_info_tenant_${orgSlug}` : 'auth_info_baileys';
        const authDir = path.resolve(__dirname, `../${authFolderName}`);
        if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
        await clearCloudAuthFromFirestore(isTenant ? orgSlug : 'demo');

        addLog('SESSION_RESET_TRIGGERED', { orgSlug, isTenant });

        if (isTenant) {
          if (activeSockets.has(orgSlug)) {
            try {
              const s = activeSockets.get(orgSlug);
              s.ev.removeAllListeners();
              s.end(undefined);
            } catch (e) {}
            activeSockets.delete(orgSlug);
          }
          await syncTenantBotStateToFirestore(orgSlug, {
            whatsappBotQr: null,
            whatsappBotQrImageUrl: null,
            whatsappPairingCode: '',
            whatsappBotConnected: false,
            whatsappBotStatus: 'starting'
          });
          await startWhatsAppBot(orgSlug);
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
          await startWhatsAppBot(null);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          org: orgSlug || 'demo',
          message: `${isTenant ? `টেন্যান্ট '${orgSlug}' এর` : ''} সেশন রিসেট হয়েছে এবং নতুন কিউআর কোড তৈরি হচ্ছে...` 
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // Direct APK / Gateway Download routes
    if (url.pathname === '/apk/sifr-pay.apk' || url.pathname === '/download/apk') {
      const candidates = [
        path.resolve(__dirname, '../../apk/sifr-pay.apk'),
        path.resolve(__dirname, '../apk/sifr-pay.apk'),
        path.resolve('./apk/sifr-pay.apk')
      ];
      const found = candidates.find(p => fs.existsSync(p));
      if (found) {
        res.writeHead(200, {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="sifr-pay.apk"',
          'Content-Length': fs.statSync(found).size
        });
        fs.createReadStream(found).pipe(res);
        return;
      }
    }

    if (url.pathname === '/apk/sifr-pay-gateway.zip' || url.pathname === '/download/zip') {
      const candidates = [
        path.resolve(__dirname, '../../apk/sifr-pay-gateway.zip'),
        path.resolve(__dirname, '../apk/sifr-pay-gateway.zip'),
        path.resolve('./apk/sifr-pay-gateway.zip')
      ];
      const found = candidates.find(p => fs.existsSync(p));
      if (found) {
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="sifr-pay-gateway.zip"',
          'Content-Length': fs.statSync(found).size
        });
        fs.createReadStream(found).pipe(res);
        return;
      }
    }

    // 2. API to request WhatsApp Pairing Code (Supports POST body or GET query ?phone= & ?org=)
    if (url.pathname === '/api/pair') {
      const handlePair = async (rawPhone, orgSlug = '', action = '') => {
        const { activeSockets, startWhatsAppBot, syncTenantBotStateToFirestore, syncBotStateToFirestore } = await import('./whatsapp.js');

        // Check if this is an init_qr request (which does not require a phone number)
        const isInitQr = action === 'init_qr' || url.searchParams.get('action') === 'init_qr';
        if (isInitQr) {
          console.log(`[Web Action]: Initializing QR for: ${orgSlug || 'demo'}...`);
          if (orgSlug && orgSlug !== 'ff-daily-squad') {
            let tSock = activeSockets.get(orgSlug);
            if (!tSock || tSock.authState?.creds?.registered) {
              await startWhatsAppBot(orgSlug);
            }
          } else {
            let dSock = activeSockets.get('demo') || currentSock;
            if (!dSock || dSock.authState?.creds?.registered) {
              await startWhatsAppBot(null);
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            isTenant: Boolean(orgSlug && orgSlug !== 'ff-daily-squad'),
            org: orgSlug || 'demo',
            message: 'QR initialization triggered'
          }));
          return;
        }

        let phone = (rawPhone || '').trim().replace(/\D/g, '');
        if (!phone) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 01872733642)' }));
          return;
        }

        if (phone.startsWith('0')) {
          phone = '88' + phone;
        } else if (!phone.startsWith('880')) {
          phone = '880' + phone;
        }

        // If this is for a specific SaaS tenant
        if (orgSlug && orgSlug !== 'ff-daily-squad') {
          try {
            console.log(`[Tenant Web Pairing]: Requesting pairing code for tenant: ${orgSlug}, phone: ${phone}...`);
            let formattedCode = null;
            let tSock = activeSockets.get(orgSlug);
            if (!tSock || tSock.authState?.creds?.registered) {
              await startWhatsAppBot(orgSlug);
              tSock = activeSockets.get(orgSlug);
            }

            if (tSock && !tSock.authState?.creds?.registered) {
              const code = await tSock.requestPairingCode(phone);
              formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
              await syncTenantBotStateToFirestore(orgSlug, {
                whatsappPairingCode: formattedCode,
                whatsappBotPhone: phone,
                whatsappBotStatus: 'pairing_ready'
              });
            } else {
              throw new Error('WhatsApp ক্লায়েন্ট বর্তমানে প্রস্তুত নেই বা ইতিমধ্যে সংযুক্ত। অনুগ্রহ করে ২ সেকেন্ড পর পুনরায় চেষ্টা করুন।');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              isTenant: true,
              org: orgSlug,
              phone,
              pairingCode: formattedCode,
              instructions: 'হোয়াটসঅ্যাপ ওপেন করুন > Linked Devices > Link with phone number-এ গিয়ে এই কোডটি লিখুন।'
            }));
            return;
          } catch (err) {
            console.error('[Tenant Pairing Error]:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'পেয়ারিং কোড তৈরি ব্যর্থ হয়েছে' }));
            return;
          }
        }

        let currentDemoSock = activeSockets.get('demo') || currentSock;
        if (!currentDemoSock) {
          await startWhatsAppBot(null);
          currentDemoSock = activeSockets.get('demo') || currentSock;
        }

        if (currentDemoSock?.authState?.creds?.registered) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            alreadyConnected: true,
            user: currentDemoSock.user?.id,
            message: 'হোয়াটসঅ্যাপ ইতিমধ্যে কানেক্টেড রয়েছে! পুনরায় পেয়ার করার প্রয়োজন নেই।'
          }));
          return;
        }

        try {
          console.log(`[Web Pairing]: Requesting pairing code for demo bot phone: ${phone}...`);
          const code = await currentDemoSock.requestPairingCode(phone);
          const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
          botState.pairingCode = formattedCode;
          botState.status = 'pairing_ready';
          await syncBotStateToFirestore({
            pairingCode: formattedCode,
            targetPhone: phone,
            status: 'pairing_ready'
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            pairingCode: formattedCode,
            rawCode: code,
            instructions: 'হোয়াটসঅ্যাপ ওপেন করুন > Linked Devices > Link with phone number-এ গিয়ে এই কোডটি লিখুন।'
          }));
        } catch (err) {
          console.error('[Web Pairing Error]:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: err.message || 'পেয়ারিং কোড তৈরি ব্যর্থ হয়েছে' }));
        }
      };

      if (req.method === 'GET') {
        const phone = url.searchParams.get('phone');
        const org = url.searchParams.get('org');
        const action = url.searchParams.get('action');
        return handlePair(phone, org, action);
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            handlePair(parsed.phone, parsed.org, parsed.action);
          } catch (e) {
            handlePair('', '', '');
          }
        });
        return;
      }
    }

    // 3. API Status JSON (Supports ?org= for tenant bot status)
    if (url.pathname === '/api/status') {
      const orgSlug = url.searchParams.get('org')?.trim();
      if (orgSlug && orgSlug !== 'ff-daily-squad') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ready',
          isTenant: true,
          org: orgSlug,
          session: `tenant_${orgSlug}`,
          timestamp: new Date().toISOString()
        }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(botState));
      return;
    }

    // 3b. API Direct Send Message
    if (url.pathname === '/api/send' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { jid, text } = JSON.parse(body || '{}');
          if (!currentSock || !jid || !text) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Missing jid or text or bot not ready' }));
            return;
          }
          await currentSock.sendMessage(jid, { text });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: err.message }));
        }
      });
      return;
    }

    // 4. Main HTML Dashboard (Mobile-First, Facebook Dark Aesthetic)
    if (url.pathname === '/') {
      const isConnected = botState.status === 'connected';
      const qrImageUrl = botState.qr
        ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(botState.qr)}&size=280x280`
        : null;

      const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARENA X — WhatsApp AI Cloud Controller</title>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #18191a;
      color: #e4e6eb;
      font-family: 'Hind Siliguri', 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      background: #242526;
      border: 1px solid #3a3b3c;
      border-radius: 18px;
      max-width: 480px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-green { background: rgba(37, 211, 102, 0.15); color: #25d366; border: 1px solid rgba(37, 211, 102, 0.3); }
    .badge-yellow { background: rgba(255, 179, 0, 0.15); color: #ffb300; border: 1px solid rgba(255, 179, 0, 0.3); }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-green { background: #25d366; box-shadow: 0 0 8px #25d366; }
    .dot-yellow { background: #ffb300; }
    .btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-primary { background: #25d366; color: #000; }
    .btn-primary:hover { background: #20ba5a; }
    .input-box {
      width: 100%;
      background: #18191a;
      border: 1px solid #3a3b3c;
      border-radius: 12px;
      padding: 12px 14px;
      color: #fff;
      font-size: 14px;
      font-family: monospace;
      outline: none;
    }
    .input-box:focus { border-color: #25d366; }
    .pairing-display {
      background: #18191a;
      border: 2px dashed #25d366;
      border-radius: 14px;
      padding: 16px;
      text-align: center;
      font-family: monospace;
      font-size: 28px;
      font-weight: 800;
      color: #25d366;
      letter-spacing: 4px;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h1 style="font-size:18px; font-weight:800; color:#fff;">ARENA X AI BOT</h1>
        <p style="font-size:12px; color:#b0b3b8;">Autonomous Cloud Host (24/7)</p>
      </div>
      ${isConnected
        ? `<span class="badge badge-green"><span class="dot dot-green"></span> ONLINE</span>`
        : `<span class="badge badge-yellow"><span class="dot dot-yellow"></span> WAITING</span>`
      }
    </div>

    ${isConnected ? `
      <div style="background:#18191a; border-radius:14px; padding:18px; border:1px solid #3a3b3c; margin-bottom:16px; text-align:center;">
        <div style="font-size:36px; margin-bottom:8px;">🟢</div>
        <h3 style="font-size:16px; font-weight:700; color:#fff; margin-bottom:4px;">বট সফলভাবে অনলাইনে কানেক্টেড আছে!</h3>
        <p style="font-size:12px; color:#b0b3b8; font-family:monospace; margin-bottom:12px;">ID: ${botState.user || 'Connected'}</p>
        <p style="font-size:12px; color:#25d366; line-height:1.5;">
          ✓ বিকাশ ও নগদ পেমেন্ট স্ক্রিনশট রিড করতে প্রস্তুত<br>
          ✓ বাংলিশ মেসেজ থেকে স্লট বুকিং একটিভ<br>
          ✓ ফায়ারবেস লাইভ সাইট ইনস্ট্যান্ট সিঙ্ক হচ্ছে
        </p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button type="button" class="btn" onclick="resetSession()" style="background:#dc2626; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:700; cursor:pointer;">
          🔄 সেশন রিসেট ও নতুন পেয়ারিং কোড নিন (Reset Session)
        </button>
        <a href="https://ff-squad-arena-bd.web.app/admin" style="text-decoration:none;">
          <button class="btn btn-primary" style="width:100%;">অ্যাডমিন ড্যাশবোর্ডে যান ➔</button>
        </a>
      </div>
    ` : `
      <!-- MOBILE-FIRST PAIRING CODE (NO PC / NO QR NEEDED) -->
      <div style="background:#18191a; border-radius:14px; padding:16px; border:1px solid #3a3b3c; margin-bottom:16px;">
        <h3 style="font-size:14px; font-weight:700; color:#25d366; margin-bottom:6px;">📱 মোবাইল দিয়ে কানেক্ট করুন (Pairing Code)</h3>
        <p style="font-size:11px; color:#b0b3b8; margin-bottom:12px;">পিসি বা কিউআর কোড স্ক্যান ছাড়াই সরাসরি আপনার ফোন নম্বর দিয়ে লিঙ্ক করুন:</p>
        
        <div id="pairForm" style="${botState.pairingCode ? 'margin-bottom:12px;' : ''}">
          <input type="tel" id="pairPhoneInput" class="input-box" value="${config.contact?.phone || '01872733642'}" placeholder="01872733642" style="margin-bottom:8px;">
          <button type="button" class="btn btn-primary" onclick="requestPairingCode()">
            ${botState.pairingCode ? 'নতুন পেয়ারিং কোড রিফ্রেশ করুন' : 'পেয়ারিং কোড পান (Get Code)'}
          </button>
        </div>

        <div id="pairCodeArea" style="${botState.pairingCode ? 'display:block;' : 'display:none;'}">
          <p style="font-size:12px; color:#fff; font-weight:700; margin-top:8px;">আপনার WhatsApp-এ নিচের কোডটি প্রবেশ করান:</p>
          <div class="pairing-display" id="pairingCodeText">${botState.pairingCode || '----'}</div>
          <p style="font-size:12px; color:#25d366; line-height:1.4; font-weight:600;">
            👉 আপনার ফোনের WhatsApp খুলুন > <strong>Linked Devices</strong> > <strong>Link with phone number instead</strong> > কোডটি টাইপ করুন।
          </p>
        </div>
      </div>

      <!-- ALTERNATIVE: QR CODE FOR DESKTOP -->
      ${qrImageUrl ? `
        <div style="text-align:center; padding:12px; border-top:1px solid #3a3b3c;">
          <p style="font-size:11px; color:#b0b3b8; margin-bottom:8px;">অথবা অন্য ফোন থেকে QR কোড স্ক্যান করুন:</p>
          <div style="background:#fff; padding:10px; border-radius:12px; display:inline-block;">
            <img src="${qrImageUrl}" alt="WhatsApp QR Code" style="width:200px; height:200px; display:block;">
          </div>
        </div>
      ` : `
        <div style="text-align:center; padding:10px; font-size:12px; color:#888;">
          কিউআর কোড জেনারেট হচ্ছে...
        </div>
      `}
    `}

    <div style="margin-top:16px; text-align:center; font-size:11px; color:#888; border-top:1px solid #333; pt-2; padding-top:10px;">
      <div>Free Fire Daily Squad Championship Engine • Author: Sifat Bin Shahjahan</div>
      <div style="margin-top:4px; color:#25d366;">
        <span>📧 <a href="mailto:sifrarchitect@gmail.com" style="color:#25d366; text-decoration:none;">sifrarchitect@gmail.com</a></span> • 
        <span>📱 WhatsApp: 01872733642</span>
      </div>
    </div>
  </div>

  <script>
    async function resetSession() {
      if (!confirm('আপনি কি নিশ্চিত যে বর্তমান হোয়াটসঅ্যাপ সেশন রিসেট করে নতুন পেয়ারিং কোড তৈরি করতে চান?')) return;
      try {
        const res = await fetch('/api/reset-session');
        const data = await res.json();
        alert('সেশন রিসেট সফল হয়েছে! পেজটি ৩ সেকেন্ডের মধ্যে নতুন পেয়ারিং কোড জেনারেটর নিয়ে রিলোড হবে...');
        setTimeout(() => { window.location.reload(); }, 3000);
      } catch (err) {
        alert('এরর: ' + err.message);
      }
    }

    async function requestPairingCode() {
      const phoneInput = document.getElementById('pairPhoneInput');
      const phone = (phoneInput.value || '').trim();
      if (!phone) {
        alert('অনুগ্রহ করে মোবাইল নম্বর লিখুন');
        return;
      }

      phoneInput.disabled = true;
      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await res.json();
        if (data.success && data.pairingCode) {
          document.getElementById('pairForm').style.display = 'none';
          document.getElementById('pairCodeArea').style.display = 'block';
          document.getElementById('pairingCodeText').textContent = data.pairingCode;
        } else {
          alert('সমস্যা: ' + (data.message || 'কোড পাওয়া যায়নি'));
          phoneInput.disabled = false;
        }
      } catch (err) {
        alert('রিকোয়েস্ট ব্যর্থ: ' + err.message);
        phoneInput.disabled = false;
      }
    }

    // Auto-refresh when status becomes connected
    setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.status === 'connected' && !${isConnected}) {
          window.location.reload();
        }
      } catch (e) {}
    }, 4000);
  </script>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(`🌐 [Web Dashboard & Healthcheck]: Server running at http://localhost:${port}`);

    // Autonomous 24/7 Keep-Alive Self-Pinger (Every 8 minutes to prevent Render 15-minute inactivity spin-down)
    const publicUrl = process.env.RENDER_EXTERNAL_URL || 'https://bd-battle-pro.onrender.com';
    const PING_INTERVAL_MS = 8 * 60 * 1000; // 8 minutes

    setInterval(async () => {
      try {
        const pingTarget = `${publicUrl}/health`;
        const res = await fetch(pingTarget, {
          method: 'GET',
          headers: { 'User-Agent': 'ARENA-X-Autonomous-KeepAlive/1.0' }
        });
        if (res.ok) {
          addLog('SELF_PING_SUCCESS', {
            status: res.status,
            time: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        addLog('SELF_PING_ERROR', { error: err.message });
      }
    }, PING_INTERVAL_MS);
  });

  return server;
}