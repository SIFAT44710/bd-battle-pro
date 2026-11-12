/**
 * ARENA X — Universal White-Label & Client Delivery Configuration
 * Edit this file to re-brand the platform for any client in seconds.
 */
export const CLIENT_CONFIG = {
  // Mode flag: true for Master Sales Demo site, false for Client Production Delivery
  isDemoMode: true,

  // Branding Tokens
  brandName: "ARENA X",
  tagline: "Official Free Fire Esports Platform & Autonomous Tournament Engine",
  logoText: "ARENA X",
  logoUrl: "", // Optional image logo URL (e.g. "/assets/logo.png")
  primaryColor: "#FF5722",
  accentColor: "#1877f2",

  // Tournament Organizer MFS Payment Wallets (bKash, Nagad, Rocket)
  paymentNumbers: {
    bkash: "01791357521",
    nagad: "01791357521",
    rocket: "01791357521"
  },

  // WhatsApp Bot & Support Numbers (Format: 8801XXXXXXXXX)
  whatsappBotNumber: "8801791357521",
  supportWhatsapp: "8801791357521",
  supportEmail: "sifrarchitect@gmail.com",

  // Security: Allowed Hosting Domains for Obfuscated Build Domain-Lock
  allowedDomains: [
    "localhost",
    "127.0.0.1",
    "ff-squad-arena-bd.web.app",
    "ff-squad-arena-bd.firebaseapp.com"
  ],

  // Client Firebase Cloud Firestore Credentials
  firebaseConfig: {
    apiKey: "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
    authDomain: "ff-squad-arena-bd.firebaseapp.com",
    projectId: "ff-squad-arena-bd",
    storageBucket: "ff-squad-arena-bd.firebasestorage.app",
    messagingSenderId: "604500327184",
    appId: "1:604500327184:web:2eae6bfddea7ed2ae74395"
  },

  // Legal & Financial Disclaimer
  legalDisclaimer: "দাবিত্যাগ (Disclaimer): এই টুর্নামেন্টের সকল ম্যাচ পরিচালনা, এন্ট্রি ফি গ্রহণ, রুম আইডি প্রদান এবং প্রাইজমানি ও রিফান্ড সংক্রান্ত সম্পূর্ণ দায়ভার টুর্নামেন্ট অর্গানাইজার কর্তৃপক্ষের। সফটওয়্যার নির্মাতা প্রতিষ্ঠান (Team Sifr) কোনো আর্থিক লেনদেন বা ম্যাচের ফলাফলের সাথে জড়িত নয়।"
};
