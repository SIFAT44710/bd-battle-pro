import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const TOURNAMENT_ID = "ff-daily-squad";

// Default pristine demo data snapshot
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

/**
 * Scheduled Demo Auto-Reset Function
 * Runs every 3 hours to restore tournaments/ff-daily-squad to default state
 */
export const autoResetDemoTournament = onSchedule("every 3 hours", async (event) => {
  const defaultData = getDefaultDemoData();
  const docRef = db.collection("tournaments").doc(TOURNAMENT_ID);
  
  await docRef.set(defaultData);

  // Write audit trail to resetLogs collection
  await db.collection("resetLogs").add({
    type: "scheduled_cloud_function",
    schedule: "every 3 hours",
    timestamp: FieldValue.serverTimestamp(),
    triggeredAt: new Date().toISOString(),
    tournamentId: TOURNAMENT_ID
  });

  console.log(`[Auto-Reset Complete]: tournaments/${TOURNAMENT_ID} reverted to pristine state at ${new Date().toISOString()}`);
});

/**
 * HTTP Webhook / On-Demand Reset Trigger
 */
export const triggerDemoResetHttp = onRequest({ cors: true }, async (req, res) => {
  try {
    const defaultData = getDefaultDemoData();
    const docRef = db.collection("tournaments").doc(TOURNAMENT_ID);
    
    await docRef.set(defaultData);

    await db.collection("resetLogs").add({
      type: "http_manual_trigger",
      timestamp: FieldValue.serverTimestamp(),
      triggeredAt: new Date().toISOString(),
      clientIp: req.ip || "unknown"
    });

    res.json({ success: true, message: "Demo tournament reset to default state successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
