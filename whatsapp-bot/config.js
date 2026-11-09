import dotenv from 'dotenv';
dotenv.config();

export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json',
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
    tournamentDocId: process.env.TOURNAMENT_DOC_ID || 'ff-daily-squad',
    // Universal client config for turnkey zero-friction startup
    clientConfig: {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "ff-squad-arena-bd.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "ff-squad-arena-bd",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "ff-squad-arena-bd.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "604500327184",
      appId: process.env.FIREBASE_APP_ID || "1:604500327184:web:2eae6bfddea7ed2ae74395"
    }
  },
  tournament: {
    defaultEntryFee: Number(process.env.DEFAULT_ENTRY_FEE || 100),
    websiteUrl: process.env.WEBSITE_URL || 'https://ff-squad-arena-bd.web.app/player'
  },
  bot: {
    debug: process.env.DEBUG_LOGS === 'true'
  }
};
