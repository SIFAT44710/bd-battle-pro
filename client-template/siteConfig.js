/**
 * =========================================================================
 * ARENA X — MASTER CLIENT CONFIGURATION (siteConfig.js)
 * =========================================================================
 * নতুন ক্লায়েন্ট/বায়ারের জন্য সাইট রেডি করতে শুধুমাত্র নিচের ভ্যালুগুলো
 * পরিবর্তন করলেই সম্পূর্ণ সাইট (লোগো, নাম, পেমেন্ট, ফায়ারবেস ও এডমিন লগইন)
 * ৫ মিনিটের মধ্যে রেডি হয়ে যাবে।
 */

export const siteConfig = {
  // 1. ব্র্যান্ড ও টুর্নামেন্ট ইনফো
  branding: {
    tournamentName: "Free Fire Daily Squad Championship",
    shortName: "ARENA X",
    tagline: "বাংলাদেশের বিশ্বস্ত ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম",
    logoText: "X", // লোগোর ভেতরের অক্ষর
    themeAccentColor: "#FF5722", // প্রাইমারি অরেঞ্জ অ্যাকসেন্ট
  },

  // 2. ক্লায়েন্ট/অর্গানাইজার সাপোর্ট ও যোগাযোগ
  contact: {
    whatsappNumber: "01791357521", // 88 ছাড়া ১১ ডিজিট
    whatsappLink: "https://wa.me/8801791357521",
    supportEmail: "support@arenax.com",
  },

  // 3. পেমেন্ট গেটওয়ে নম্বর সেটিংস (Send Money)
  payments: {
    bkashNumber: "01791357521",
    nagadNumber: "01791357521",
    rocketNumber: "01791357521",
    defaultEntryFee: 100, // টাকা (BDT)
    instructions: "Send Money করে ফিরতি SMS থেকে প্রাপ্ত TrxID প্রদান করুন।",
  },

  // 4. সিকিউরড অ্যাডমিন অ্যাক্সেস (Google Sign-In Whitelist)
  // শুধুমাত্র এই জিমেইল(গুলো) দিয়ে লগইন করলে এডমিন প্যানেল আনলক হবে
  security: {
    adminAuthorizedEmails: [
      "sifatbinshahjahan@gmail.com",
      "owner@gmail.com"
      // নতুন ওনারের জিমেইল এখানে যুক্ত করুন
    ],
    requireAuthForAdmin: true // ক্লায়েন্ট প্রোডাকশনে true রাখবেন
  },

  // 5. ক্লায়েন্টের নিজস্ব Firebase প্রজেক্ট কনফিগারেশন
  // ক্লায়েন্টের Firebase Console (https://console.firebase.google.com) থেকে কপি করে বসাবেন
  firebase: {
    apiKey: "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
    authDomain: "ff-squad-arena-bd.firebaseapp.com",
    projectId: "ff-squad-arena-bd",
    storageBucket: "ff-squad-arena-bd.firebasestorage.app",
    messagingSenderId: "604500327184",
    appId: "1:604500327184:web:2eae6bfddea7ed2ae74395"
  }
};

if (typeof window !== "undefined") {
  window.siteConfig = siteConfig;
}
