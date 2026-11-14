import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
  authDomain: "ff-squad-arena-bd.firebaseapp.com",
  projectId: "ff-squad-arena-bd",
  storageBucket: "ff-squad-arena-bd.firebasestorage.app",
  messagingSenderId: "604500327184",
  appId: "1:604500327184:web:2eae6bfddea7ed2ae74395"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function getDefaultDemoData() {
  const createEmptySlots = () => Array.from({ length: 12 }, (_, i) => ({
    slotNumber: i + 1,
    booked: false,
    status: "",
    squadName: "",
    player1: "",
    player2: "",
    player3: "",
    player4: "",
    contact: "",
    trxId: "",
    paymentMethod: ""
  }));

  return {
    title: "ARENA X — Official Free Fire Squad Championship",
    tournamentName: "Free Fire Daily Squad Championship",
    organizer: "Team Sifr Esports Hub",
    whatsappSupport: "01791357521",
    lastResetAt: new Date().toISOString(),
    paymentSettings: {
      bkashNumber: "01791357521",
      nagadNumber: "01791357521",
      rocketNumber: "01791357521",
      updatedAt: new Date().toISOString()
    },
    matches: [
      {
        id: "match-1",
        matchNumber: 1,
        title: "Match 1: Bermuda Squad Championship",
        map: "Bermuda",
        time: "08:30 PM",
        status: "upcoming",
        entryFee: 100,
        prizePool: 1000,
        roomId: "",
        roomPass: "",
        showIdPass: false,
        slots: createEmptySlots()
      },
      {
        id: "match-2",
        matchNumber: 2,
        title: "Match 2: Purgatory Squad Rush",
        map: "Purgatory",
        time: "09:15 PM",
        status: "upcoming",
        entryFee: 100,
        prizePool: 1000,
        roomId: "",
        roomPass: "",
        showIdPass: false,
        slots: createEmptySlots()
      },
      {
        id: "match-3",
        matchNumber: 3,
        title: "Match 3: Kalahari Desert Clash",
        map: "Kalahari",
        time: "10:00 PM",
        status: "upcoming",
        entryFee: 100,
        prizePool: 1000,
        roomId: "",
        roomPass: "",
        showIdPass: false,
        slots: createEmptySlots()
      }
    ]
  };
}

async function resetDemo() {
  console.log("🔄 Resetting ARENA X Demo Firestore document to pristine default snapshot...");
  const defaultData = getDefaultDemoData();
  const docRef = doc(db, "tournaments", "ff-daily-squad");
  await setDoc(docRef, defaultData);
  console.log("✅ tournaments/ff-daily-squad reset successfully (3 matches, 0/12 booked, showIdPass: false).");

  try {
    await addDoc(collection(db, "resetLogs"), {
      type: "cli_manual_reset",
      triggeredAt: new Date().toISOString(),
      source: "scripts/reset-demo.js"
    });
    console.log("✅ Logged reset event to resetLogs collection.");
  } catch (err) {
    console.warn("⚠️ Warning: Could not write to resetLogs:", err.message);
  }

  process.exit(0);
}

resetDemo().catch(err => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
