const crypto = require('crypto');
const https = require('https');

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function firestoreRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: '/v1/projects/ff-squad-arena-bd/databases/(default)/documents/' + path,
      method: 'GET'
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testLoginSim(identifier, enteredPin) {
  console.log(`\n--- TESTING LOGIN: ID="${identifier}" PIN="${enteredPin}" ---`);
  
  // 1. Direct Slug Lookup
  const cleanSlug = identifier.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  let tenantDoc = null;
  let tenantId = null;

  if (cleanSlug) {
    const res = await firestoreRequest('tenants/' + cleanSlug);
    if (res.status === 200 && res.data?.fields) {
      tenantDoc = res.data.fields;
      tenantId = cleanSlug;
      console.log(`[PASS] Found tenant doc directly by slug: "${cleanSlug}"`);
    }
  }

  // 2. Phone Lookup Fallback
  if (!tenantDoc) {
    const rawDigits = identifier.replace(/\D/g, '');
    const listRes = await firestoreRequest('tenants');
    if (listRes.status === 200 && listRes.data?.documents) {
      for (const d of listRes.data.documents) {
        const docId = d.name.split('/').pop();
        const f = d.fields;
        const phone = (f.whatsappNumber?.stringValue || f.ownerPhone?.stringValue || '').replace(/\D/g, '');
        if (phone && (phone === rawDigits || phone.endsWith(rawDigits))) {
          tenantDoc = f;
          tenantId = docId;
          console.log(`[PASS] Found tenant doc by phone number: "${docId}"`);
          break;
        }
      }
    }
  }

  if (!tenantDoc) {
    console.error(`[FAIL] Tenant not found for identifier: ${identifier}`);
    return false;
  }

  // Verify PIN
  const enteredHash = hashPin(enteredPin);
  const savedHash = tenantDoc.adminPinHash?.stringValue || '';
  const savedPlain = tenantDoc.adminPin?.stringValue || '';

  const isMatch = (savedHash && savedHash === enteredHash) || (savedPlain && savedPlain === enteredPin);
  if (isMatch) {
    console.log(`[PASS] PIN verification succeeded! Authenticated for ${tenantDoc.guildName?.stringValue || tenantId}`);
    console.log(`Redirect Target: /admin?org=${tenantId}`);
    console.log(`Player Target: /player?org=${tenantId}`);
    return true;
  } else {
    console.error(`[FAIL] PIN verification failed!`);
    return false;
  }
}

async function main() {
  await testLoginSim('tanvir-esports', '5678');
  await testLoginSim('01711223344', '5678');
  await testLoginSim('apex-bd', '1234');
}

main();
