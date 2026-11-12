import { getTournamentData } from './whatsapp-bot/services/firestore.js';

export const DEMO_MATCHES = [
  {
    id: "match-1",
    matchNumber: 1,
    title: "Match 1: Bermuda Pro Championship",
    map: "Bermuda",
    time: "07:30 PM",
    entryFee: 100,
    prizePool: 1000,
    status: "completed",
    roomId: "8492014",
    roomPass: "7788",
    showIdPass: true,
    pointsTablePublishedAt: new Date(Date.now() - 3600000).toISOString(),
    slots: [
      { slotNumber: 1, booked: true, status: "CONFIRMED", squadName: "DARK VORTEX", player1: "Vortex_Lead", player2: "Vortex_Rusher", player3: "Vortex_Assault", player4: "Vortex_Sniper", contact: "01791357521", trxId: "DKA1VORTEX", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 2, booked: true, status: "CONFIRMED", squadName: "71 ESPL", player1: "71_Lead", player2: "71_Rusher", player3: "71_Assault", player4: "71_Sniper", contact: "01811223344", trxId: "DKA2ESPL71", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 3, booked: true, status: "CONFIRMED", squadName: "DEADLY VIPERS", player1: "Viper_Alpha", player2: "Viper_Beta", player3: "Viper_Gamma", player4: "Viper_Delta", contact: "01911223344", trxId: "DKA3VIPERS", paymentMethod: "nagad", feePaid: 100 },
      { slotNumber: 4, booked: true, status: "CONFIRMED", squadName: "TEAM SILENT", player1: "Silent_1", player2: "Silent_2", player3: "Silent_3", player4: "Silent_4", contact: "01722334455", trxId: "DKA4SILENT", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 5, booked: true, status: "CONFIRMED", squadName: "RED CYBER", player1: "Cyber_Rex", player2: "Cyber_Fox", player3: "Cyber_Neo", player4: "Cyber_Zod", contact: "01633445566", trxId: "DKA5CYBERR", paymentMethod: "rocket", feePaid: 100 },
      { slotNumber: 6, booked: true, status: "CONFIRMED", squadName: "BENGAL TIGERS", player1: "Tiger_King", player2: "Tiger_Roar", player3: "Tiger_Claw", player4: "Tiger_Fang", contact: "01744556677", trxId: "DKA6TIGERS", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 7, booked: true, status: "CONFIRMED", squadName: "CYCLONE ESPORTS", player1: "Cyclone_A", player2: "Cyclone_B", player3: "Cyclone_C", player4: "Cyclone_D", contact: "01855667788", trxId: "DKA7CYCLON", paymentMethod: "nagad", feePaid: 100 },
      { slotNumber: 8, booked: true, status: "CONFIRMED", squadName: "BLOODLINE 11", player1: "Blood_X", player2: "Blood_Y", player3: "Blood_Z", player4: "Blood_W", contact: "01966778899", trxId: "DKA8BLOODL", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 9, booked: true, status: "CONFIRMED", squadName: "VIPER KNIGHTS", player1: "Knight_1", player2: "Knight_2", player3: "Knight_3", player4: "Knight_4", contact: "01777889900", trxId: "DKA9KNIGHT", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 10, booked: true, status: "CONFIRMED", squadName: "SHADOW HUNTERS", player1: "Shadow_A", player2: "Shadow_B", player3: "Shadow_C", player4: "Shadow_D", contact: "01888990011", trxId: "DKA0SHADOW", paymentMethod: "rocket", feePaid: 100 },
      { slotNumber: 11, booked: true, status: "CONFIRMED", squadName: "TITAN WARRIORS", player1: "Titan_One", player2: "Titan_Two", player3: "Titan_Three", player4: "Titan_Four", contact: "01999001122", trxId: "DKA1TITANW", paymentMethod: "nagad", feePaid: 100 },
      { slotNumber: 12, booked: true, status: "CONFIRMED", squadName: "GHOST REAPERS", player1: "Reaper_1", player2: "Reaper_2", player3: "Reaper_3", player4: "Reaper_4", contact: "01700112233", trxId: "DKA2REAPER", paymentMethod: "bkash", feePaid: 100 }
    ],
    pointsTable: [
      { rank: 1, slotNumber: 1, squadName: "DARK VORTEX", placementPoints: 12, killPoints: 11, totalPoints: 23, prizeWon: 500, kills: { Vortex_Lead: 5, Vortex_Sniper: 3, Vortex_Assault: 2, Vortex_Rusher: 1 } },
      { rank: 2, slotNumber: 2, squadName: "71 ESPL", placementPoints: 9, killPoints: 8, totalPoints: 17, prizeWon: 300, kills: { "71_Lead": 4, "71_Sniper": 2, "71_Assault": 1, "71_Rusher": 1 } },
      { rank: 3, slotNumber: 3, squadName: "DEADLY VIPERS", placementPoints: 8, killPoints: 7, totalPoints: 15, prizeWon: 200, kills: { Viper_Alpha: 3, Viper_Beta: 2, Viper_Gamma: 1, Viper_Delta: 1 } },
      { rank: 4, slotNumber: 4, squadName: "TEAM SILENT", placementPoints: 7, killPoints: 5, totalPoints: 12, prizeWon: 0, kills: { Silent_1: 2, Silent_2: 2, Silent_3: 1, Silent_4: 0 } },
      { rank: 5, slotNumber: 5, squadName: "RED CYBER", placementPoints: 6, killPoints: 4, totalPoints: 10, prizeWon: 0, kills: { Cyber_Rex: 2, Cyber_Fox: 1, Cyber_Neo: 1, Cyber_Zod: 0 } },
      { rank: 6, slotNumber: 6, squadName: "BENGAL TIGERS", placementPoints: 5, killPoints: 4, totalPoints: 9, prizeWon: 0, kills: { Tiger_King: 2, Tiger_Roar: 1, Tiger_Claw: 1, Tiger_Fang: 0 } },
      { rank: 7, slotNumber: 7, squadName: "CYCLONE ESPORTS", placementPoints: 4, killPoints: 3, totalPoints: 7, prizeWon: 0, kills: { Cyclone_A: 2, Cyclone_B: 1, Cyclone_C: 0, Cyclone_D: 0 } },
      { rank: 8, slotNumber: 8, squadName: "BLOODLINE 11", placementPoints: 3, killPoints: 3, totalPoints: 6, prizeWon: 0, kills: { Blood_X: 1, Blood_Y: 1, Blood_Z: 1, Blood_W: 0 } },
      { rank: 9, slotNumber: 9, squadName: "VIPER KNIGHTS", placementPoints: 2, killPoints: 2, totalPoints: 4, prizeWon: 0, kills: { Knight_1: 1, Knight_2: 1, Knight_3: 0, Knight_4: 0 } },
      { rank: 10, slotNumber: 10, squadName: "SHADOW HUNTERS", placementPoints: 1, killPoints: 2, totalPoints: 3, prizeWon: 0, kills: { Shadow_A: 1, Shadow_B: 1, Shadow_C: 0, Shadow_D: 0 } },
      { rank: 11, slotNumber: 11, squadName: "TITAN WARRIORS", placementPoints: 0, killPoints: 2, totalPoints: 2, prizeWon: 0, kills: { Titan_One: 1, Titan_Two: 1, Titan_Three: 0, Titan_Four: 0 } },
      { rank: 12, slotNumber: 12, squadName: "GHOST REAPERS", placementPoints: 0, killPoints: 1, totalPoints: 1, prizeWon: 0, kills: { Reaper_1: 1, Reaper_2: 0, Reaper_3: 0, Reaper_4: 0 } }
    ]
  },
  {
    id: "match-2",
    matchNumber: 2,
    title: "Match 2: Purgatory Squad Rush",
    map: "Purgatory",
    time: "08:30 PM",
    entryFee: 100,
    prizePool: 1000,
    status: "upcoming",
    roomId: "9182374",
    roomPass: "3344",
    showIdPass: false,
    slots: [
      { slotNumber: 1, booked: true, status: "CONFIRMED", squadName: "ROYAL BANGLA", player1: "RB_Boss", player2: "RB_Sniper", player3: "RB_Rusher", player4: "RB_Support", contact: "01711223344", trxId: "DKA21ROYAL", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 2, booked: true, status: "CONFIRMED", squadName: "DHAKA GLADIATORS", player1: "DG_Lead", player2: "DG_Rusher", player3: "DG_Assault", player4: "DG_Sniper", contact: "01822334455", trxId: "DKA22DHAKA", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 3, booked: true, status: "CONFIRMED", squadName: "CHITTAGONG KINGS", player1: "CK_Rider", player2: "CK_Storm", player3: "CK_Thunder", player4: "CK_Strike", contact: "01933445566", trxId: "DKA23CTG", paymentMethod: "nagad", feePaid: 100 },
      { slotNumber: 4, booked: true, status: "CONFIRMED", squadName: "SYLHET THUNDER", player1: "ST_Alpha", player2: "ST_Bravo", player3: "ST_Charlie", player4: "ST_Delta", contact: "01644556677", trxId: "DKA24SYLHET", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 5, booked: true, status: "CONFIRMED", squadName: "RAJSHAHI ROYALS", player1: "RR_King", player2: "RR_Knight", player3: "RR_Bishop", player4: "RR_Pawn", contact: "01755667788", trxId: "DKA25RAJ", paymentMethod: "rocket", feePaid: 100 },
      { slotNumber: 6, booked: true, status: "CONFIRMED", squadName: "KHULNA TITANS", player1: "KT_Hammer", player2: "KT_Axe", player3: "KT_Blade", player4: "KT_Spear", contact: "01866778899", trxId: "DKA26KHULNA", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 7, booked: true, status: "CONFIRMED", squadName: "BARISAL BULLS", player1: "BB_Horn", player2: "BB_Charge", player3: "BB_Rage", player4: "BB_Fury", contact: "01977889900", trxId: "DKA27BARISAL", paymentMethod: "nagad", feePaid: 100 },
      { slotNumber: 8, booked: true, status: "CONFIRMED", squadName: "COMILLA VICTORS", player1: "CV_Win", player2: "CV_Glory", player3: "CV_Honor", player4: "CV_Pride", contact: "01788990011", trxId: "DKA28COMILLA", paymentMethod: "bkash", feePaid: 100 },
      { slotNumber: 9, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 10, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 11, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 12, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" }
    ]
  },
  {
    id: "match-3",
    matchNumber: 3,
    title: "Match 3: Kalahari Desert Clash",
    map: "Kalahari",
    time: "09:15 PM",
    entryFee: 50,
    prizePool: 500,
    status: "upcoming",
    roomId: "4589123",
    roomPass: "9900",
    showIdPass: false,
    slots: [
      { slotNumber: 1, booked: true, status: "CONFIRMED", squadName: "DESERT EAGLES", player1: "DE_Hawk", player2: "DE_Falcon", player3: "DE_Raven", player4: "DE_Osprey", contact: "01733445566", trxId: "DKA31EAGLE", paymentMethod: "bkash", feePaid: 50 },
      { slotNumber: 2, booked: true, status: "CONFIRMED", squadName: "SAND STORM", player1: "SS_Dune", player2: "SS_Gust", player3: "SS_Breeze", player4: "SS_Gale", contact: "01844556677", trxId: "DKA32SAND", paymentMethod: "nagad", feePaid: 50 },
      { slotNumber: 3, booked: true, status: "CONFIRMED", squadName: "OASIS RANGERS", player1: "OR_Water", player2: "OR_Palm", player3: "OR_Mirage", player4: "OR_Sun", contact: "01955667788", trxId: "DKA33OASIS", paymentMethod: "bkash", feePaid: 50 },
      { slotNumber: 4, booked: true, status: "CONFIRMED", squadName: "SCORPION CLAN", player1: "SC_Sting", player2: "SC_Poison", player3: "SC_Venom", player4: "SC_Toxic", contact: "01666778899", trxId: "DKA34SCORP", paymentMethod: "rocket", feePaid: 50 },
      { slotNumber: 5, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 6, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 7, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 8, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 9, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 10, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 11, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 12, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" }
    ]
  },
  {
    id: "match-4",
    matchNumber: 4,
    title: "Match 4: Daily Scrims Practice (Auto-Verify Test)",
    map: "Bermuda",
    time: "10:00 PM",
    entryFee: 10,
    prizePool: 100,
    status: "upcoming",
    roomId: "7823901",
    roomPass: "1122",
    showIdPass: false,
    slots: [
      { slotNumber: 1, booked: true, status: "CONFIRMED", squadName: "CYBER DEMONS", player1: "CD_Rex", player2: "CD_Ghost", player3: "CD_Sniper", player4: "CD_Shadow", contact: "01799887766", trxId: "DKA41DEMON", paymentMethod: "bkash", feePaid: 10 },
      { slotNumber: 2, booked: true, status: "CONFIRMED", squadName: "71 APEX", player1: "Apex_One", player2: "Apex_Two", player3: "Apex_Three", player4: "Apex_Four", contact: "01899887766", trxId: "DKA42APEX71", paymentMethod: "bkash", feePaid: 10 },
      { slotNumber: 3, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 4, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 5, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 6, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 7, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 8, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 9, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 10, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 11, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" },
      { slotNumber: 12, booked: false, squadName: "", player1: "", player2: "", player3: "", player4: "", contact: "" }
    ]
  }
];

export async function runCleanDemoSeed() {
  console.log("🌱 INITIATING CLEAN DEMO SEED FOR MASTER SALES SITE...");
  const { data, update } = await getTournamentData();
  
  await update({
    title: "ARENA X — Official Free Fire Squad Championship",
    organizer: "Team Sifr Esports Hub",
    whatsappSupport: "01791357521",
    lastResetAt: new Date().toISOString(),
    matches: DEMO_MATCHES
  });

  console.log("✅ 4 PROFESSIONAL DEMO MATCHES SEEDED SUCCESSFULLY!");
  console.log("   • Match 1: Bermuda Pro Championship (Completed, 12/12 with Points Table)");
  console.log("   • Match 2: Purgatory Squad Rush (Upcoming, Entry: ৳100, 8/12, 4 slots free)");
  console.log("   • Match 3: Kalahari Desert Clash (Upcoming, Entry: ৳50, 4/12, 8 slots free)");
  console.log("   • Match 4: Daily Scrims Practice (Auto-Verify Test) (Upcoming, Entry: ৳10, 2/12, 10 slots free)");
}

if (process.argv[1].endsWith('clean-demo-seed.js')) {
  runCleanDemoSeed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
