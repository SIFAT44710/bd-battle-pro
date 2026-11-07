/**
 * FF SQUAD ARENA — FIREBASE & LOCAL STORAGE ENGINE
 * Connected to Firebase Project: ff-squad-arena-bd (Owner: rifatsifat1010@gmail.com)
 * Features:
 *  - Real-time Cloud Sync with Firestore / Realtime Database
 *  - Automatic LocalStorage Fallback Layer for offline/fast caching
 *  - 12 Squads / 48 Players tournament schema (No UID, Pure IGN)
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
    entryFeeBDT: 100,
    prizePoolBDT: 1000,
    totalMatches: 3,
    rules: 'Mobile only. Official FFWS Points system. 4 players per squad.'
  },
  // 12 Squad Slots (No UID, IGN only)
  teams: [
    {
      id: 'team-1',
      slot: 1,
      teamName: '亗TEAM VIPER亗',
      captainName: 'Tanvir Ahmed',
      captainWhatsApp: '01711223344',
      isBooked: true,
      players: [
        { name: '亗TANVIR亗', isLeader: true },
        { name: 'VIPER_SHADOW', isLeader: false },
        { name: 'VIPER_NINJA', isLeader: false },
        { name: 'VIPER_BOT', isLeader: false }
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
        { name: 'MAFIA_RAKIB', isLeader: true },
        { name: 'MAFIA_BOSS', isLeader: false },
        { name: 'MAFIA_SNIPER', isLeader: false },
        { name: 'MAFIA_GOD', isLeader: false }
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
        { name: '7X_FAHIM', isLeader: true },
        { name: '7X_THUNDER', isLeader: false },
        { name: '7X_STORM', isLeader: false },
        { name: '7X_BLAZE', isLeader: false }
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
        { name: 'DEVIL_ALAMIN', isLeader: true },
        { name: 'DEVIL_RUSHER', isLeader: false },
        { name: 'DEVIL_KILLER', isLeader: false },
        { name: 'DEVIL_FIRE', isLeader: false }
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
        { name: 'TITAN_SHAKIB', isLeader: true },
        { name: 'TITAN_SNIPER', isLeader: false },
        { name: 'TITAN_FLASH', isLeader: false },
        { name: 'TITAN_DEAD', isLeader: false }
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
        { name: 'KNIGHT_MEHEDI', isLeader: true },
        { name: 'KNIGHT_DRAGON', isLeader: false },
        { name: 'KNIGHT_CYBORG', isLeader: false },
        { name: 'KNIGHT_FROST', isLeader: false }
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
        { name: 'CYBER_NAYEEM', isLeader: true },
        { name: 'CYBER_ZERO', isLeader: false },
        { name: 'CYBER_VIPER', isLeader: false },
        { name: 'CYBER_APEX', isLeader: false }
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
        { name: 'SILENT_SOHAN', isLeader: true },
        { name: 'SILENT_GHOST', isLeader: false },
        { name: 'SILENT_SMOKE', isLeader: false },
        { name: 'SILENT_VENOM', isLeader: false }
      ]
    },
    // Slots 9, 10, 11, 12 Open
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
  // Dynamic Series Matches (Each with its own Map, Room ID, Password, and Results)
  matches: [
    {
      id: 'match-1',
      matchNumber: 1,
      map: 'Bermuda',
      time: '8:30 PM',
      roomId: 'FF-SQUAD-88219',
      roomPassword: 'rush2026',
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
      time: '9:15 PM',
      roomId: 'FF-SQUAD-99104',
      roomPassword: 'purg2026',
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
      time: '10:00 PM',
      roomId: 'FF-SQUAD-10394',
      roomPassword: 'kala2026',
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

        if (firebase.firestore) {
          this.firestoreDb = firebase.firestore();
          this.isFirebaseReady = true;

          this.firestoreDb.collection('tournaments').doc('current').onSnapshot(doc => {
            if (doc.exists) {
              const val = doc.data();
              this.data = val;
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
              this.notify(val);
            } else {
              this.firestoreDb.collection('tournaments').doc('current').set(this.data);
            }
          });
        }
      } catch (err) {
        console.warn('Firebase online connection fallback to LocalStorage:', err);
      }
    }
  }

  async sync(newData) {
    this.saveLocal(newData);
    if (this.isFirebaseReady && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('tournaments').doc('current').set(newData);
      } catch (e) {
        console.warn('Firebase write notice:', e);
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
