/**
 * FF SQUAD ARENA — FIREBASE & LOCAL STORAGE ENGINE
 * Connected to Firebase Project: ff-squad-arena-bd (Owner: rifatsifat1010@gmail.com)
 * Features:
 *  - Real-time Cloud Sync with Firestore / Realtime Database
 *  - Automatic LocalStorage Fallback Layer for offline/fast caching
 *  - 12 Squads / 48 Players tournament schema
 */

const LOCAL_STORAGE_KEY = 'ff_squad_arena_data_v1';

// Default Tournament Schema
const DEFAULT_TOURNAMENT_DATA = {
  meta: {
    id: 'squad-tourney-01',
    title: 'Free Fire Daily Squad Masters — 12 Teams',
    organizer: 'Sifat Bin Shahjahan',
    contactWhatsApp: '01791357521',
    format: '12 Teams / 48 Players',
    entryFeeBDT: 100, // ৳100 per squad (৳25/player)
    prizePoolBDT: 1000,
    currentMatchIndex: 0,
    totalMatches: 3,
    rules: '1. No emulators allowed (Mobile only).\n2. Official FFWS Points system.\n3. Squad must join custom room within 10 minutes of ID release.'
  },
  roomCredentials: {
    matchNumber: 1,
    roomId: 'FF-SQUAD-88219',
    roomPassword: 'squad2026',
    matchTime: '9:00 PM',
    map: 'Bermuda',
    isUnlocked: true
  },
  // 12 Squad Slots
  teams: [
    {
      id: 'team-1',
      slot: 1,
      teamName: '亗TEAM VIPER亗',
      captainName: 'Tanvir Ahmed',
      captainWhatsApp: '01711223344',
      isBooked: true,
      players: [
        { name: '亗TANVIR亗', uid: '2948201948', isLeader: true },
        { name: 'VIPER_SHADOW', uid: '3849102941', isLeader: false },
        { name: 'VIPER_NINJA', uid: '1948204910', isLeader: false },
        { name: 'VIPER_BOT', uid: '9284019284', isLeader: false }
      ]
    },
    {
      id: 'team-2',
      slot: 2,
      teamName: 'MAFIA ESPORTS',
      captainName: 'Rakib Hassan',
      captainWhatsApp: '01811223355',
      isBooked: true,
      players: [
        { name: 'MAFIA_RAKIB', uid: '3184920491', isLeader: true },
        { name: 'MAFIA_BOSS', uid: '2948194820', isLeader: false },
        { name: 'MAFIA_SNIPER', uid: '8392019482', isLeader: false },
        { name: 'MAFIA_GOD', uid: '4829104928', isLeader: false }
      ]
    },
    {
      id: 'team-3',
      slot: 3,
      teamName: '7X WARRIORS',
      captainName: 'Fahim Shahriar',
      captainWhatsApp: '01911223366',
      isBooked: true,
      players: [
        { name: '7X_FAHIM', uid: '7482910492', isLeader: true },
        { name: '7X_THUNDER', uid: '2948192048', isLeader: false },
        { name: '7X_STORM', uid: '3948201948', isLeader: false },
        { name: '7X_BLAZE', uid: '8492019482', isLeader: false }
      ]
    },
    {
      id: 'team-4',
      slot: 4,
      teamName: 'RED DEVILS BD',
      captainName: 'Al Amin',
      captainWhatsApp: '01611223377',
      isBooked: true,
      players: [
        { name: 'DEVIL_ALAMIN', uid: '9482019482', isLeader: true },
        { name: 'DEVIL_RUSHER', uid: '8392019482', isLeader: false },
        { name: 'DEVIL_KILLER', uid: '4829104928', isLeader: false },
        { name: 'DEVIL_FIRE', uid: '2948194820', isLeader: false }
      ]
    },
    {
      id: 'team-5',
      slot: 5,
      teamName: 'BD TITANS',
      captainName: 'Shakib Khan',
      captainWhatsApp: '01511223388',
      isBooked: true,
      players: [
        { name: 'TITAN_SHAKIB', uid: '3948201948', isLeader: true },
        { name: 'TITAN_SNIPER', uid: '8492019482', isLeader: false },
        { name: 'TITAN_FLASH', uid: '2948192048', isLeader: false },
        { name: 'TITAN_DEAD', uid: '7482910492', isLeader: false }
      ]
    },
    {
      id: 'team-6',
      slot: 6,
      teamName: 'KNIGHT RIDERS',
      captainName: 'Mehedi Hasan',
      captainWhatsApp: '01722334455',
      isBooked: true,
      players: [
        { name: 'KNIGHT_MEHEDI', uid: '1948204910', isLeader: true },
        { name: 'KNIGHT_DRAGON', uid: '3849102941', isLeader: false },
        { name: 'KNIGHT_CYBORG', uid: '2948201948', isLeader: false },
        { name: 'KNIGHT_FROST', uid: '9284019284', isLeader: false }
      ]
    },
    {
      id: 'team-7',
      slot: 7,
      teamName: 'CYBER FORCE',
      captainName: 'Nayeem Islam',
      captainWhatsApp: '01822334466',
      isBooked: true,
      players: [
        { name: 'CYBER_NAYEEM', uid: '2948194820', isLeader: true },
        { name: 'CYBER_ZERO', uid: '3184920491', isLeader: false },
        { name: 'CYBER_VIPER', uid: '8392019482', isLeader: false },
        { name: 'CYBER_APEX', uid: '4829104928', isLeader: false }
      ]
    },
    {
      id: 'team-8',
      slot: 8,
      teamName: 'SILENT ASSASSINS',
      captainName: 'Sohanur Rahman',
      captainWhatsApp: '01922334477',
      isBooked: true,
      players: [
        { name: 'SILENT_SOHAN', uid: '8492019482', isLeader: true },
        { name: 'SILENT_GHOST', uid: '7482910492', isLeader: false },
        { name: 'SILENT_SMOKE', uid: '2948192048', isLeader: false },
        { name: 'SILENT_VENOM', uid: '3948201948', isLeader: false }
      ]
    },
    // Slots 9, 10, 11, 12 Open for Registration / Admin Assignment
    {
      id: 'team-9',
      slot: 9,
      teamName: '',
      captainName: '',
      captainWhatsApp: '',
      isBooked: false,
      players: []
    },
    {
      id: 'team-10',
      slot: 10,
      teamName: '',
      captainName: '',
      captainWhatsApp: '',
      isBooked: false,
      players: []
    },
    {
      id: 'team-11',
      slot: 11,
      teamName: '',
      captainName: '',
      captainWhatsApp: '',
      isBooked: false,
      players: []
    },
    {
      id: 'team-12',
      slot: 12,
      teamName: '',
      captainName: '',
      captainWhatsApp: '',
      isBooked: false,
      players: []
    }
  ],
  // Dynamic Series Matches
  matches: [
    {
      id: 'match-1',
      matchNumber: 1,
      map: 'Bermuda',
      status: 'completed',
      results: {
        'team-1': { rank: 1, kills: 11 },
        'team-2': { rank: 2, kills: 7 },
        'team-3': { rank: 3, kills: 4 },
        'team-4': { rank: 4, kills: 5 },
        'team-5': { rank: 5, kills: 2 },
        'team-6': { rank: 6, kills: 3 },
        'team-7': { rank: 7, kills: 1 },
        'team-8': { rank: 8, kills: 2 }
      }
    },
    {
      id: 'match-2',
      matchNumber: 2,
      map: 'Purgatory',
      status: 'completed',
      results: {
        'team-2': { rank: 1, kills: 9 },
        'team-3': { rank: 2, kills: 6 },
        'team-1': { rank: 3, kills: 8 },
        'team-5': { rank: 4, kills: 4 },
        'team-4': { rank: 5, kills: 3 },
        'team-8': { rank: 6, kills: 4 },
        'team-6': { rank: 7, kills: 2 },
        'team-7': { rank: 8, kills: 0 }
      }
    },
    {
      id: 'match-3',
      matchNumber: 3,
      map: 'Kalahari',
      status: 'upcoming',
      results: {}
    }
  ]
};

// ==============================================================================
// OFFICIAL FIREBASE CONFIGURATION (LIVE & LINKED TO rifatsifat1010@gmail.com)
// ==============================================================================
window.FIREBASE_CONFIG = {
  projectId: "ff-squad-arena-bd",
  appId: "1:604500327184:web:2eae6bfddea7ed2ae74395",
  storageBucket: "ff-squad-arena-bd.firebasestorage.app",
  apiKey: "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
  authDomain: "ff-squad-arena-bd.firebaseapp.com",
  messagingSenderId: "604500327184",
  projectNumber: "604500327184",
  version: "2"
};

class TournamentStorage {
  constructor() {
    this.isFirebaseReady = false;
    this.listeners = [];
    this.data = this.loadLocal();
    this.initFirebase();
  }

  loadLocal() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_TOURNAMENT_DATA));
  }

  saveLocal(data) {
    this.data = data;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    this.notify(data);
  }

  initFirebase() {
    if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }

        // Try Firestore or Realtime Database
        if (firebase.firestore) {
          this.firestoreDb = firebase.firestore();
          this.isFirebaseReady = true;
          console.log('🔥 Firebase Firestore connected successfully!');

          // Listen for live snapshot updates
          this.firestoreDb.collection('tournaments').doc('current').onSnapshot(doc => {
            if (doc.exists) {
              const val = doc.data();
              this.data = val;
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
              this.notify(val);
            } else {
              // Initialize doc if empty
              this.firestoreDb.collection('tournaments').doc('current').set(this.data);
            }
          });
        } else if (firebase.database) {
          this.rtdb = firebase.database();
          this.isFirebaseReady = true;
          console.log('🔥 Firebase Realtime Database connected successfully!');

          this.rtdb.ref('squad_tournament').on('value', snapshot => {
            const val = snapshot.val();
            if (val) {
              this.data = val;
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
              this.notify(val);
            }
          });
        }
      } catch (err) {
        console.warn('Firebase online connection fallback to LocalStorage:', err);
      }
    } else {
      console.log('⚡ LocalStorage mode active.');
    }
  }

  async sync(newData) {
    this.saveLocal(newData);
    if (this.isFirebaseReady) {
      try {
        if (this.firestoreDb) {
          await this.firestoreDb.collection('tournaments').doc('current').set(newData);
        } else if (this.rtdb) {
          await this.rtdb.ref('squad_tournament').set(newData);
        }
      } catch (e) {
        console.warn('Firebase remote write notice (local saved):', e);
      }
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.data);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (err) { console.error(err); }
    });
  }

  resetToDefault() {
    this.sync(JSON.parse(JSON.stringify(DEFAULT_TOURNAMENT_DATA)));
  }
}

window.tourneyStorage = new TournamentStorage();
