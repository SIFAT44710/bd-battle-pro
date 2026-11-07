/**
 * FF SQUAD ARENA — FIREBASE & LOCAL STORAGE ENGINE
 * Features:
 *  - Works 100% out-of-the-box using LocalStorage fallback
 *  - Real-time sync ready when Firebase config keys are plugged in
 *  - Supports Free Fire 12-Squad tournament schema
 */

const LOCAL_STORAGE_KEY = 'ff_squad_arena_data_v1';

// Default Demo Tournament Schema
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
  // Dynamic Series Matches (e.g. 3 Matches: Bermuda, Purgatory, Kalahari)
  matches: [
    {
      id: 'match-1',
      matchNumber: 1,
      map: 'Bermuda',
      status: 'completed',
      results: {
        'team-1': { rank: 1, kills: 11 }, // Booyah! 12 + 11 = 23 pts
        'team-2': { rank: 2, kills: 7 },  // 9 + 7 = 16 pts
        'team-3': { rank: 3, kills: 4 },  // 8 + 4 = 12 pts
        'team-4': { rank: 4, kills: 5 },  // 7 + 5 = 12 pts
        'team-5': { rank: 5, kills: 2 },  // 6 + 2 = 8 pts
        'team-6': { rank: 6, kills: 3 },  // 5 + 3 = 8 pts
        'team-7': { rank: 7, kills: 1 },  // 4 + 1 = 5 pts
        'team-8': { rank: 8, kills: 2 }   // 3 + 2 = 5 pts
      }
    },
    {
      id: 'match-2',
      matchNumber: 2,
      map: 'Purgatory',
      status: 'completed',
      results: {
        'team-2': { rank: 1, kills: 9 },  // Booyah! 12 + 9 = 21 pts
        'team-3': { rank: 2, kills: 6 },  // 9 + 6 = 15 pts
        'team-1': { rank: 3, kills: 8 },  // 8 + 8 = 16 pts
        'team-5': { rank: 4, kills: 4 },  // 7 + 4 = 11 pts
        'team-4': { rank: 5, kills: 3 },  // 6 + 3 = 9 pts
        'team-8': { rank: 6, kills: 4 },  // 5 + 4 = 9 pts
        'team-6': { rank: 7, kills: 2 },  // 4 + 2 = 6 pts
        'team-7': { rank: 8, kills: 0 }   // 3 + 0 = 3 pts
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
// FIREBASE CONFIGURATION (PLUG IN YOUR KEYS HERE OR LOAD DYNAMICALLY)
// ==============================================================================
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
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
    // If Firebase CDN is loaded and config has valid projectId
    if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID") {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        this.db = firebase.database ? firebase.database() : null;
        this.isFirebaseReady = true;
        console.log('🔥 Firebase initialized successfully!');

        // Listen for live updates
        if (this.db) {
          this.db.ref('squad_tournament').on('value', snapshot => {
            const val = snapshot.val();
            if (val) {
              this.data = val;
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
              this.notify(val);
            }
          });
        }
      } catch (err) {
        console.warn('Firebase init skipped, using LocalStorage engine.', err);
      }
    } else {
      console.log('⚡ LocalStorage Mode Active (Super-fast & Offline-ready). Firebase config can be connected anytime.');
    }
  }

  async sync(newData) {
    this.saveLocal(newData);
    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.ref('squad_tournament').set(newData);
      } catch (e) {
        console.error('Firebase sync failed', e);
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
