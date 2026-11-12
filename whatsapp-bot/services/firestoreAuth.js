import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';
import { initFirestore } from './firestore.js';
import fs from 'fs';
import path from 'path';

/**
 * Cloud-Resilient Firestore Auth State for Baileys
 * Persists WhatsApp Multi-Device session keys to Firestore collection `bot_sessions/{clientId}`.
 * Survives container restarts, ephemeral cloud disks (Render/Railway/Koyeb), and zero QR re-scans.
 */
export async function useFirestoreAuthState(clientId = 'default_client') {
  const { driver, adminDb, clientDbInstance } = initFirestore();

  // Local fallback cache directory
  const localCacheDir = path.resolve('./auth_info_baileys');
  if (!fs.existsSync(localCacheDir)) {
    try { fs.mkdirSync(localCacheDir, { recursive: true }); } catch (e) {}
  }

  // Firestore Document Reference for Creds
  const credsDocPath = `bot_sessions/${clientId}/data/creds`;
  const keysColPath = `bot_sessions/${clientId}/keys`;

  async function readFirestoreDoc(collectionPath, docId) {
    try {
      if (driver === 'admin') {
        const snap = await adminDb.collection(collectionPath).doc(docId).get();
        if (snap.exists) return snap.data()?.value || null;
      } else {
        const { doc: getDocRef, getDoc } = await import('firebase/firestore');
        const dRef = getDocRef(clientDbInstance, collectionPath, docId);
        const snap = await getDoc(dRef);
        if (snap.exists()) return snap.data()?.value || null;
      }
    } catch (err) {
      console.warn(`[FirestoreAuth] Read error (${collectionPath}/${docId}):`, err.message);
    }
    return null;
  }

  async function writeFirestoreDoc(collectionPath, docId, jsonStr) {
    try {
      if (driver === 'admin') {
        await adminDb.collection(collectionPath).doc(docId).set({
          value: jsonStr,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        const { doc: getDocRef, setDoc } = await import('firebase/firestore');
        const dRef = getDocRef(clientDbInstance, collectionPath, docId);
        await setDoc(dRef, {
          value: jsonStr,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn(`[FirestoreAuth] Write error (${collectionPath}/${docId}):`, err.message);
    }
  }

  async function deleteFirestoreDoc(collectionPath, docId) {
    try {
      if (driver === 'admin') {
        await adminDb.collection(collectionPath).doc(docId).delete();
      } else {
        const { doc: getDocRef, deleteDoc } = await import('firebase/firestore');
        const dRef = getDocRef(clientDbInstance, collectionPath, docId);
        await deleteDoc(dRef);
      }
    } catch (err) {
      console.warn(`[FirestoreAuth] Delete error (${collectionPath}/${docId}):`, err.message);
    }
  }

  // 1. Load or Initialize Creds
  let creds;
  const rawCredsFirestore = await readFirestoreDoc(`bot_sessions/${clientId}/data`, 'creds');
  
  if (rawCredsFirestore) {
    try {
      creds = JSON.parse(rawCredsFirestore, BufferJSON.reviver);
      console.log('✓ [FirestoreAuth]: Loaded credentials from Cloud Firestore (bot_sessions).');
    } catch (e) {
      console.warn('[FirestoreAuth]: Corrupt creds in Firestore, initializing fresh.');
    }
  }

  // Fallback: Check local auth_info_baileys/creds.json if Firestore was empty
  if (!creds) {
    const localCredsPath = path.join(localCacheDir, 'creds.json');
    if (fs.existsSync(localCredsPath)) {
      try {
        const localRaw = fs.readFileSync(localCredsPath, 'utf8');
        creds = JSON.parse(localRaw, BufferJSON.reviver);
        console.log('✓ [FirestoreAuth]: Migrated local credentials into Firestore.');
        // Sync to cloud
        await writeFirestoreDoc(`bot_sessions/${clientId}/data`, 'creds', JSON.stringify(creds, BufferJSON.replacer));
      } catch (e) {
        console.warn('[FirestoreAuth]: Local creds parse failed.');
      }
    }
  }

  if (!creds) {
    creds = initAuthCreds();
    console.log('ℹ [FirestoreAuth]: Initialized brand-new authentication credentials.');
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            const docKey = `${type}-${id}`.replace(/\//g, '_');
            // Try local disk cache first
            const localFile = path.join(localCacheDir, `${docKey}.json`);
            let raw = null;
            if (fs.existsSync(localFile)) {
              try { raw = fs.readFileSync(localFile, 'utf8'); } catch (e) {}
            }
            if (!raw) {
              raw = await readFirestoreDoc(keysColPath, docKey);
            }
            if (raw) {
              try {
                let value = JSON.parse(raw, BufferJSON.reviver);
                if (type === 'app-state-sync-key' && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              } catch (e) {}
            }
          }
          return data;
        },
        set: async (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const docKey = `${category}-${id}`.replace(/\//g, '_');
              const localFile = path.join(localCacheDir, `${docKey}.json`);
              if (value) {
                const str = JSON.stringify(value, BufferJSON.replacer);
                try { fs.writeFileSync(localFile, str, 'utf8'); } catch (e) {}
                await writeFirestoreDoc(keysColPath, docKey, str);
              } else {
                try { if (fs.existsSync(localFile)) fs.unlinkSync(localFile); } catch (e) {}
                await deleteFirestoreDoc(keysColPath, docKey);
              }
            }
          }
        }
      }
    },
    saveCreds: async () => {
      const str = JSON.stringify(creds, BufferJSON.replacer);
      // Save local
      try { fs.writeFileSync(path.join(localCacheDir, 'creds.json'), str, 'utf8'); } catch (e) {}
      // Save Firestore
      await writeFirestoreDoc(`bot_sessions/${clientId}/data`, 'creds', str);
    }
  };
}
