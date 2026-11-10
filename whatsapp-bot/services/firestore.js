import admin from 'firebase-admin';
import { initializeApp as initClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, doc as clientDoc, getDoc as getClientDoc, updateDoc as updateClientDoc } from 'firebase/firestore';
import fs from 'fs';
import { config } from '../config.js';

let driver = null; // 'admin' | 'client'
let adminDb = null;
let clientDbInstance = null;

export function initFirestore() {
  if (driver) return { driver, adminDb, clientDbInstance };

  // 1. Try Firebase Admin if serviceAccountKey.json exists or FIREBASE_SERVICE_ACCOUNT_JSON is set
  try {
    let credential = null;
    if (config.firebase.serviceAccountJson) {
      const parsed = typeof config.firebase.serviceAccountJson === 'string'
        ? JSON.parse(config.firebase.serviceAccountJson)
        : config.firebase.serviceAccountJson;
      credential = admin.credential.cert(parsed);
    } else if (fs.existsSync(config.firebase.serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(config.firebase.serviceAccountPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
    }

    if (credential) {
      if (!admin.apps.length) {
        admin.initializeApp({ credential });
      }
      adminDb = admin.firestore();
      driver = 'admin';
      console.log('✓ [Firestore]: Connected via Firebase Admin SDK (Service Account).');
      return { driver, adminDb };
    }
  } catch (err) {
    console.warn('[Firestore]: Service Account not loaded, falling back to Client SDK:', err.message);
  }

  // 2. Turnkey Fallback: Connect via Firebase Client SDK
  try {
    const app = initClientApp(config.firebase.clientConfig);
    clientDbInstance = getClientFirestore(app);
    driver = 'client';
    console.log('✓ [Firestore]: Connected via Firebase Client SDK (ff-squad-arena-bd).');
    return { driver, clientDbInstance };
  } catch (err) {
    console.error('❌ [Firestore Init Error]:', err.message);
    throw err;
  }
}

/**
 * Fetch Tournament Data
 */
export async function getTournamentData() {
  initFirestore();
  const docId = config.firebase.tournamentDocId;

  if (driver === 'admin') {
    const docRef = adminDb.collection('tournaments').doc(docId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Tournament document "${docId}" not found in Firestore!`);
    }
    return {
      driver,
      data: snap.data(),
      update: async (updates) => docRef.update(updates)
    };
  } else {
    const docRef = clientDoc(clientDbInstance, 'tournaments', docId);
    const snap = await getClientDoc(docRef);
    if (!snap.exists()) {
      throw new Error(`Tournament document "${docId}" not found in Firestore!`);
    }
    return {
      driver,
      data: snap.data(),
      update: async (updates) => updateClientDoc(docRef, updates)
    };
  }
}

/**
 * Find the most relevant match based on player request
 */
export function findTargetMatch(matches, query, autoFallback = false) {
  if (!matches || !matches.length) return null;

  // 1. If query specified, match by title, time, map, or match number
  if (query) {
    const q = query.toString().toLowerCase().trim();

    // Check direct match number like "1", "2", "3" or "match 1"
    const matchNumMatch = q.match(/match\s*([0-9]+)/i) || q.match(/^([0-9]+)$/);
    if (matchNumMatch) {
      const num = parseInt(matchNumMatch[1], 10);
      const byNum = matches.find(m => m.matchNumber === num || (m.title && m.title.toLowerCase().includes(`match ${num}`)));
      if (byNum) return byNum;
    }

    const found = matches.find(m => {
      const title = (m.title || '').toLowerCase();
      const time = (m.time || '').toLowerCase();
      const map = (m.map || '').toLowerCase();
      const id = (m.id || '').toLowerCase();
      return title.includes(q) || time.includes(q) || map.includes(q) || id.includes(q);
    });
    if (found) return found;
  }

  if (autoFallback) {
    const firstUpcomingWithSlots = matches.find(m => {
      if (m.status !== 'upcoming') return false;
      const slots = m.slots || [];
      return slots.some(s => !s.booked);
    });
    return firstUpcomingWithSlots || matches[0];
  }

  return null;
}

/**
 * Check Slot Availability for a Match
 */
export function checkSlotStatus(match, requestedSlot) {
  const slots = match.slots || [];
  const freeSlots = [];

  for (let i = 1; i <= 12; i++) {
    const s = slots.find(item => item.slotNumber === i);
    if (!s || !s.booked) {
      freeSlots.push(i);
    }
  }

  if (requestedSlot && requestedSlot >= 1 && requestedSlot <= 12) {
    const targetSlot = slots.find(s => s.slotNumber === requestedSlot);
    const isAvailable = !targetSlot || !targetSlot.booked;
    return {
      available: isAvailable,
      slotNumber: requestedSlot,
      freeSlots
    };
  }

  // If no slot requested, auto-pick first free slot
  return {
    available: freeSlots.length > 0,
    slotNumber: freeSlots[0] || null,
    freeSlots
  };
}

/**
 * Check if TrxID has already been used (Anti-Fraud)
 */
export function isDuplicateTrxId(matches, trxId) {
  if (!trxId) return false;
  const cleanTrx = trxId.toUpperCase().trim();
  for (const m of matches) {
    for (const s of (m.slots || [])) {
      if (s.booked && s.trxId && s.trxId.toUpperCase().trim() === cleanTrx) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Perform Atomic Slot Booking in Firestore
 */
export async function bookSlotInFirestore({
  matchQuery,
  preferredSlot,
  squadName,
  leaderName,
  playerNames = [],
  contactPhone,
  trxId,
  amount,
  paymentMethod
}) {
  const { data, update } = await getTournamentData();
  const matches = data.matches || [];

  const targetMatch = findTargetMatch(matches, matchQuery, true);
  if (!targetMatch) {
    return {
      success: false,
      reason: 'NO_ACTIVE_MATCH',
      message: 'দুঃখিত! বর্তমানে কোনো সক্রিয় ম্যাচ পাওয়া যায়নি।'
    };
  }

  // Check TrxID Fraud
  if (trxId && isDuplicateTrxId(matches, trxId)) {
    return {
      success: false,
      reason: 'DUPLICATE_TRXID',
      message: `এই TrxID (${trxId}) ইতিমধ্যে অন্য একটি স্লট বুকিংয়ে ব্যবহার করা হয়েছে!`
    };
  }

  // Check Slot
  const slotCheck = checkSlotStatus(targetMatch, preferredSlot);
  if (!slotCheck.available) {
    return {
      success: false,
      reason: 'SLOT_OCCUPIED',
      freeSlots: slotCheck.freeSlots,
      match: targetMatch,
      message: `স্লট #${preferredSlot} ইতিমধ্যে বুকড হয়ে গেছে! খালি স্লটগুলো হলো: ${slotCheck.freeSlots.join(', ')}`
    };
  }

  const finalSlotNumber = slotCheck.slotNumber;
  const cleanPhone = normalizePhone(contactPhone);

  const updatedMatches = matches.map(m => {
    if (m.id === targetMatch.id) {
      let currentSlots = m.slots || Array.from({ length: 12 }, (_, i) => ({ slotNumber: i + 1, booked: false }));

      const newSlots = currentSlots.map(s => {
        if (s.slotNumber === finalSlotNumber) {
          return {
            slotNumber: finalSlotNumber,
            booked: true,
            status: 'CONFIRMED',
            squadName: squadName || `SQUAD_${cleanPhone.slice(-4)}`,
            player1: leaderName || playerNames[0] || `${squadName || 'Squad'}_Lead`,
            player2: playerNames[1] || `${squadName || 'Squad'}_P2`,
            player3: playerNames[2] || `${squadName || 'Squad'}_P3`,
            player4: playerNames[3] || `${squadName || 'Squad'}_P4`,
            contact: cleanPhone,
            trxId: trxId || '',
            paymentMethod: paymentMethod || 'bkash',
            feePaid: Number(amount || targetMatch.entryFee || 100),
            bookedVia: 'WhatsApp Bot',
            bookedAt: new Date().toISOString()
          };
        }
        return s;
      });

      return { ...m, slots: newSlots };
    }
    return m;
  });

  // Update in Firestore
  await update({ matches: updatedMatches });

  return {
    success: true,
    match: targetMatch,
    slotNumber: finalSlotNumber,
    squadName: squadName || `SQUAD_${cleanPhone.slice(-4)}`,
    leaderName: leaderName || `${squadName || 'Squad'}_Lead`,
    contactPhone: cleanPhone,
    trxId: trxId || 'VERIFIED_SCREENSHOT',
    amount: amount || targetMatch.entryFee || 100,
    paymentMethod: paymentMethod || 'bkash'
  };
}

/**
 * Normalize BD mobile numbers:
 * Converts 8801791357521 or +8801791357521 to 01791357521
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let clean = rawPhone.replace(/\D/g, '');
  if (clean.startsWith('880')) {
    clean = clean.slice(2);
  }
  return clean;
}

/**
 * Find recent verified SMS payment from Firestore sms_logs for this player's phone
 */
export async function findRecentSmsLog(senderPhone) {
  try {
    const cleanPhone = normalizePhone(senderPhone);
    const res = await fetch('https://firestore.googleapis.com/v1/projects/ff-squad-arena-bd/databases/(default)/documents/sms_logs');
    if (!res.ok) return null;
    const json = await res.json();
    const docs = json.documents || [];
    for (const d of docs) {
      const fields = d.fields || {};
      const sender = fields.sender?.stringValue || '';
      const cleanSender = normalizePhone(sender);
      if (cleanSender && (cleanSender === cleanPhone || cleanSender.includes(cleanPhone) || cleanPhone.includes(cleanSender))) {
        return {
          trx_id: fields.trxId?.stringValue,
          amount: fields.amount?.doubleValue || 0,
          method: fields.method?.stringValue || 'bKash',
          sender: sender,
          timestamp: fields.timestamp?.stringValue
        };
      }
    }
  } catch (err) {
    console.warn('[Firestore findRecentSmsLog error]:', err.message);
  }
  return null;
}
