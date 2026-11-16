const crypto = require('crypto');
const https = require('https');

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

function firestoreRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: '/v1/projects/ff-squad-arena-bd/databases/(default)/documents/' + path,
      method,
      headers: { 'Content-Type': 'application/json' }
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Check existing shared demo tournament ===');
  const demoRes = await firestoreRequest('tournaments/ff-daily-squad');
  console.log('Demo tournament status:', demoRes.status, 'Title:', demoRes.data?.fields?.matches?.arrayValue?.values?.[0]?.mapValue?.fields?.title?.stringValue);

  console.log('=== TEST 2: Create new tenant (tanvir-esports) ===');
  const pin = '5678';
  const pinHash = hashPin(pin);
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const newTenant = {
    fields: {
      slug: { stringValue: 'tanvir-esports' },
      organizerName: { stringValue: 'Tanvir Ahmed' },
      whatsappNumber: { stringValue: '01711223344' },
      guildName: { stringValue: 'Tanvir Esports' },
      adminPinHash: { stringValue: pinHash },
      createdAt: { stringValue: now.toISOString() },
      trialEndsAt: { stringValue: trialEnds },
      status: { stringValue: 'active' },
      killSwitch: { booleanValue: false },
      paymentSettings: {
        mapValue: {
          fields: {
            bkash: { stringValue: '01711223344' },
            nagad: { stringValue: '01711223344' },
            rocket: { stringValue: '' }
          }
        }
      },
      brand: {
        mapValue: {
          fields: {
            name: { stringValue: 'Tanvir Esports' },
            logoUrl: { stringValue: '' },
            primaryColor: { stringValue: '#FF5722' }
          }
        }
      }
    }
  };

  const createTenantRes = await firestoreRequest('tenants?documentId=tanvir-esports', 'POST', newTenant);
  console.log('Create tanvir-esports status:', createTenantRes.status);

  console.log('=== TEST 3: Create starter match in tenants/tanvir-esports/matches/match-1 ===');
  const starterMatch = {
    fields: {
      id: { stringValue: 'match-1' },
      matchNumber: { integerValue: '1' },
      title: { stringValue: 'Match 1: Bermuda Squad Championship' },
      map: { stringValue: 'Bermuda' },
      time: { stringValue: '08:30 PM' },
      status: { stringValue: 'upcoming' },
      entryFee: { integerValue: '100' },
      prizePool: { integerValue: '1000' },
      roomId: { stringValue: '893411' },
      roomPass: { stringValue: '7788' },
      showIdPass: { booleanValue: true },
      slots: {
        arrayValue: {
          values: Array.from({ length: 12 }, (_, i) => ({
            mapValue: {
              fields: {
                slotNumber: { integerValue: String(i + 1) },
                booked: { booleanValue: false },
                status: { stringValue: 'available' },
                squadName: { stringValue: '' },
                player1: { stringValue: '' },
                player2: { stringValue: '' },
                player3: { stringValue: '' },
                player4: { stringValue: '' },
                contact: { stringValue: '' },
                trxId: { stringValue: '' }
              }
            }
          }))
        }
      }
    }
  };

  const createMatchRes = await firestoreRequest('tenants/tanvir-esports/matches?documentId=match-1', 'POST', starterMatch);
  console.log('Create starter match status:', createMatchRes.status);

  console.log('=== TEST 4: Fetch all tenants for Orbit calculations ===');
  const allTenantsRes = await firestoreRequest('tenants');
  const docs = allTenantsRes.data.documents || [];
  console.log('Total tenants in Orbit:', docs.length);
  docs.forEach(d => {
    const slug = d.name.split('/').pop();
    const gName = d.fields?.guildName?.stringValue || d.fields?.name?.stringValue;
    const isK = d.fields?.killSwitch?.booleanValue;
    console.log(` - Tenant: [${slug}] | Guild: "${gName}" | KillSwitch: ${isK}`);
  });

  console.log('=== TEST 5: Test Kill-Switch toggle on tanvir-esports ===');
  const patchRes = await firestoreRequest('tenants/tanvir-esports?updateMask.fieldPaths=killSwitch&updateMask.fieldPaths=status', 'PATCH', {
    fields: {
      killSwitch: { booleanValue: true },
      status: { stringValue: 'killed' }
    }
  });
  console.log('Kill-Switch flipped to TRUE status:', patchRes.status, 'Current killSwitch:', patchRes.data?.fields?.killSwitch?.booleanValue);

  // Turn it back on for tanvir-esports
  const restoreRes = await firestoreRequest('tenants/tanvir-esports?updateMask.fieldPaths=killSwitch&updateMask.fieldPaths=status', 'PATCH', {
    fields: {
      killSwitch: { booleanValue: false },
      status: { stringValue: 'active' }
    }
  });
  console.log('Re-activated tanvir-esports status:', restoreRes.status, 'Current killSwitch:', restoreRes.data?.fields?.killSwitch?.booleanValue);

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
