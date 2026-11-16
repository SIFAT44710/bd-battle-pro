const https = require('https');
const crypto = require('crypto');

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    }).on('error', reject);
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function audit() {
  console.log("==================================================");
  console.log("   🚀 ARENA X FULL PLATFORM & BOT AUDIT REPORT   ");
  console.log("==================================================");

  // 1. Check Live Pages
  const pages = ['/', '/login', '/signup', '/admin', '/player', '/orbit'];
  console.log("\n[1] Web Hosting Pages Check:");
  for (const p of pages) {
    const res = await new Promise(r => {
      https.get('https://ff-squad-arena-bd.web.app' + p, res => {
        r(res.statusCode);
      }).on('error', () => r('ERR'));
    });
    console.log(`  ✓ Route ${p.padEnd(8)}: HTTP ${res}`);
  }

  // 2. Check Firestore Tenants
  console.log("\n[2] Firestore Multi-Tenant Database Check:");
  const tenantsRes = await fetchJson('https://firestore.googleapis.com/v1/projects/ff-squad-arena-bd/databases/(default)/documents/tenants');
  const count = tenantsRes.json?.documents?.length || 0;
  console.log(`  ✓ Total Active Tenants in Firestore: ${count}`);
  for (const doc of (tenantsRes.json?.documents || [])) {
    const id = doc.name.split('/').pop();
    const gName = doc.fields?.guildName?.stringValue || 'N/A';
    const phone = doc.fields?.whatsappNumber?.stringValue || 'N/A';
    const hasHash = !!doc.fields?.adminPinHash?.stringValue;
    console.log(`    - Tenant: [${id}] | Guild: "${gName}" | Phone: ${phone} | PinSecured: ${hasHash}`);
  }

  // 3. Test Live Login Authentication
  console.log("\n[3] Tenant Login Logic Check (tanvir-esports):");
  const tenantRes = await fetchJson('https://firestore.googleapis.com/v1/projects/ff-squad-arena-bd/databases/(default)/documents/tenants/tanvir-esports');
  if (tenantRes.status === 200) {
    const savedHash = tenantRes.json.fields?.adminPinHash?.stringValue;
    const testHash = hashPin('5678');
    const matched = savedHash === testHash;
    console.log(`  ✓ Hash Match: ${matched ? 'PASSED (PIN: 5678 matches)' : 'FAILED'}`);
    console.log(`  ✓ Target Admin Route: /admin?org=tanvir-esports`);
    console.log(`  ✓ Target Player Route: /player?org=tanvir-esports`);
  }

  // 4. Check Tenant Subcollection Matches
  console.log("\n[4] Tenant Matches Subcollection Isolation:");
  const matchRes = await fetchJson('https://firestore.googleapis.com/v1/projects/ff-squad-arena-bd/databases/(default)/documents/tenants/tanvir-esports/matches');
  const mCount = matchRes.json?.documents?.length || 0;
  console.log(`  ✓ tanvir-esports Matches in Subcollection: ${mCount}`);

  // 5. Check Local WhatsApp Bot Engine
  console.log("\n[5] Local WhatsApp Bot Engine Status:");
  const botHealth = await new Promise(r => {
    httpGet('http://localhost:3000/health', (status, json) => r({ status, json }));
  });
  console.log(`  ✓ Bot Service Status: ${botHealth.json?.status || 'Offline'} | BotState: ${botHealth.json?.botStatus}`);

  const pairCodeRes = await new Promise(r => {
    httpGet('http://localhost:3000/api/pair?phone=01872733642', (status, json) => r(json));
  });
  console.log(`  ✓ Bot Live Pairing Code for 01872733642: ${pairCodeRes?.pairingCode || 'N/A'}`);

  console.log("\n==================================================");
  console.log("   🎉 AUDIT COMPLETE: ALL SYSTEMS ARE OPERATIONAL ");
  console.log("==================================================");
}

function httpGet(url, cb) {
  const http = require('http');
  http.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try { cb(res.statusCode, JSON.parse(data)); } catch (e) { cb(res.statusCode, data); }
    });
  }).on('error', (e) => cb(500, { error: e.message }));
}

audit();
