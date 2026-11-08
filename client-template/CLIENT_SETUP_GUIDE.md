# 🚀 ARENA X — Turnkey Client Setup & Deployment Guide

> **Official 5-Minute Quickstart Runbook for Tournament Organizers & Agency Clients**  
> *Developed by Team Sifr / Antigravity AI Engine*

---

## 📌 ১. ওভারভিউ (Overview)
**ARENA X Client Edition** হলো একটি রেডিমেড, হাই-স্পিড এবং প্রোডাকশন-গ্রেড ফ্রি ফায়ার টুর্নামেন্ট SaaS সলিউশন। এই টেমপ্লেটটি ব্যবহার করে কোনো জটিল কোডিং জ্ঞান ছাড়াই মাত্র ৫ মিনিটে যেকোনো অর্গানাইজারের জন্য সম্পূর্ণ নিজস্ব ব্র্যান্ডের টুর্নামেন্ট প্ল্যাটফর্ম লাইভ করা যায়।

### 🌟 মূল ফিচারসমূহ:
1. **১-ফাইল কনফিগারেশন (`siteConfig.js`):** শুধুমাত্র একটি ফাইলে নাম, নম্বর ও জিমেইল বসিয়ে সম্পূর্ণ ওয়েবসাইট কনফিগার করার সুবিধা।
2. **গুগল সাইন-ইন লকড এডমিন প্যানেল:** শুধুমাত্র অনুমোদিত ওনারের জিমেইল দিয়েই এডমিন প্যানেল আনলক হবে। অননুমোদিত কোনো ইউজার ঢুকতে পারবে না।
3. **পেমেন্ট অনুমোদন ও ট্রানজেকশন ট্র্যাকিং:** প্লেয়ারদের বুকিং `PENDING` হিসেবে জমা হয়, এডমিন TrxID যাচাই করে ১-ক্লিকে `✔ Confirm` করতে পারেন।
4. **ফোন নম্বর সিকিউরিটি রুম লক (Anti-Leak Vault):** ফ্রি ভিজিটরদের রুম আইডি ও পাসওয়ার্ড চুরি ঠেকাতে শুধুমাত্র কনফার্মড বুকিং নম্বর দিয়ে রুম আইডি আনলক হয়।
5. **স্বয়ংক্রিয় প্রফিট লেজার ও SMS ভেরিফিকেশন APK ইন্টিগ্রেশন।**

---

## ⚡ ২. মাত্র ৫ মিনিটে সেটআপ করার নিয়ম (5-Minute Quickstart)

### ধাপ ১: `siteConfig.js` ওপেন করুন
`client-template/siteConfig.js` ফাইলটি যেকোনো কোড এডিটর (VS Code / Notepad) দিয়ে খুলুন।

### ধাপ ২: ব্র্যান্ডিং ও তথ্য পরিবর্তন করুন
```javascript
export const siteConfig = {
  // ১. আপনার ব্র্যান্ডের নাম ও স্লোগান
  branding: {
    tournamentName: "BD Pro Gamers Championship", // আপনার টুর্নামেন্টের পূর্ণ নাম
    shortName: "BD PRO",                          // শর্ট নাম
    tagline: "বাংলাদেশের ১ নম্বর বিশ্বস্ত ফ্রি ফায়ার প্ল্যাটফর্ম",
    logoText: "P",                               // লোগোর ভিতরের অক্ষর
  },

  // ২. আপনার হোয়াটসঅ্যাপ যোগাযোগ নম্বর
  contact: {
    whatsappNumber: "017XXXXXXXX",              // ৮৮ ছাড়া ১১ ডিজিট
    whatsappLink: "https://wa.me/88017XXXXXXXX", // হোয়াটসঅ্যাপ লিংক
    supportEmail: "support@yourdomain.com",
  },

  // ৩. পেমেন্ট নম্বর (প্লেয়াররা যে নম্বরে এন্ট্রি ফি পাঠাবে)
  payments: {
    bkashNumber: "017XXXXXXXX",
    nagadNumber: "018XXXXXXXX",
    rocketNumber: "019XXXXXXXX",
    defaultEntryFee: 100, // টাকা (BDT)
  },

  // ৪. এডমিন অ্যাক্সেস (আপনার নিজস্ব জিমেইল এখানে দিন)
  security: {
    adminAuthorizedEmails: [
      "yourname@gmail.com" // ⚠️ এই জিমেইল দিয়ে গুগল সাইন ইন করলে এডমিন আনলক হবে
    ],
    requireAuthForAdmin: true
  },

  // ৫. ক্লায়েন্টের নিজস্ব Firebase কনফিগারেশন
  firebase: {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

---

## 🛡️ ৩. নিজস্ব Firebase প্রজেক্ট তৈরি ও কানেক্ট করার নিয়ম

১. ব্রাউজারে যান: [Firebase Console](https://console.firebase.google.com/)
২. **Add Project** ক্লিক করে নতুন প্রজেক্ট তৈরি করুন (Google Analytics বন্ধ রাখতে পারেন)।
৩. **Authentication** সেকশনে গিয়ে **Get Started** চাপুন এবং **Google Sign-In Provider** এনাবল (Enable) করুন।
৪. **Firestore Database** সেকশনে গিয়ে **Create Database** ক্লিক করুন এবং **Start in test mode** বা নিচের রুলসটি দিন:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
৫. **Project Settings (গিয়ার আইকন)** ➔ **General** ➔ নিচে নেমে **Web App (`</>`)** আইকনে ক্লিক করে রেজিস্টার করুন।
৬. স্ক্রিনে যে `firebaseConfig` অবজেক্টটি আসবে, তার ভ্যালুগুলো কপি করে `siteConfig.js`-এর `firebase` ব্লকে পেস্ট করে সেভ করুন।

---

## 🌐 ৪. ফ্রিতে লাইভ হোস্ট / ডেপ্লয় করার নিয়ম

### অপশন ক: Firebase Hosting (সবচেয়ে দ্রুত ও প্রফেশনাল)
```powershell
# Firebase CLI ইনস্টল না থাকলে
npm install -g firebase-tools

# ক্লায়েন্ট ফোল্ডারে টার্মিনাল ওপেন করে
cd client-template
firebase login
firebase init hosting
# Public directory হিসেবে '.' (বর্তমান ফোল্ডার) দিন এবং Single-page app: No দিন
firebase deploy --only hosting
```

### অপশন খ: Netlify / Vercel (ড্র্যাগ অ্যান্ড ড্রপ)
- [Netlify Drop](https://app.netlify.com/drop)-এ গিয়ে সম্পূর্ণ `client-template` ফোল্ডারটি ড্র্যাগ করে ছেড়ে দিলেই ৩০ সেকেন্ডে আপনার সাইট লাইভ হয়ে যাবে!

---

## 🎮 ৫. অর্গানাইজার ম্যাচ পরিচালনা নির্দেশিকা (Admin Workflow)

1. **নতুন ম্যাচ তৈরি (`New Match`):**
   - এডমিন প্যানেলে লগইন করে `+ New Match` বাটনে ক্লিক করুন।
   - ম্যাপ (Bermuda, Purgatory, Kalahari), সময়, এন্ট্রি ফি (টাকা) এবং প্রাইজপুল বসিয়ে সেভ করুন।
2. **প্লেয়ারদের পেমেন্ট অনুমোদন (`Confirm Payment`):**
   - প্লেয়াররা বিকাশ বা নগদে টাকা পাঠিয়ে বুকিং রিকোয়েস্ট সাবমিট করলে স্লটে `🟡 PENDING` ও TrxID দেখতে পাবেন।
   - টাকা অ্যাকাউন্টে জমা হয়েছে কিনা দেখে ১-ক্লিকে `✔ Confirm` চাপুন। স্লটটি `🟢 CONFIRMED` হয়ে যাবে।
3. **কাস্টম রুম আইডি ও পাসওয়ার্ড পাবলিশ:**
   - ম্যাচ শুরু হওয়ার ১০-১৫ মিনিট আগে কাস্টম রুম আইডি ও পাসওয়ার্ড বসিয়ে `Publish Room Credentials` সুইচ অন করুন।
   - শুধুমাত্র যেসব স্কোয়াডের পেমেন্ট কনফার্ম হয়েছে, তারা নিজেদের বুকিং মোবাইল নম্বর সাবমিট করে রুম আইডি ও পাসওয়ার্ড কপি করতে পারবে।
4. **প্রাইজ ডিস্ট্রিবিউশন:**
   - ম্যাচ শেষে উইনার স্কোয়াডের লিডারের দেওয়া বিকাশ/নগদ নম্বরে সরাসরি প্রাইজ সেন্ড মানি করে দিন।

---

## 📁 ফাইল স্ট্রাকচার
```text
client-template/
├── siteConfig.js             <-- 🌟 একমাত্র কনফিগারেশন ফাইল
├── index.html                <-- ব্র্যান্ডেড ল্যান্ডিং পেজ
├── player.html               <-- প্লেয়ার বুকিং ও রুম ভল্ট প্যানেল
├── admin.html                <-- গুগল সাইন-ইন লকড এডমিন HQ
├── apk/
│   ├── sifr-pay.apk          <-- অ্যান্ড্রয়েড SMS অটো-ভেরিফিকেশন গেটওয়ে অ্যাপ
│   └── sifr-pay-gateway.zip  <-- নিরাপদ হোস্টিং জিপ প্যাকেজ
└── CLIENT_SETUP_GUIDE.md     <-- এই সেটআপ গাইড
```

---

## 📱 ৬. SifrPay SMS Gateway APK সেটআপ
- **ডাউনলোড:** এডমিন প্যানেলের নিচে সরাসরি `Download Gateway APK` বাটন আছে অথবা `apk/sifr-pay.apk` ফাইলটি সরাসরি ফোনে নিয়ে ইনস্টল করা যাবে।
- **কার্যপদ্ধতি:** এডমিনের যে ফোনে বিকাশ/নগদ/রকেট সিম চালু রয়েছে, সেখানে অ্যাপটি ইনস্টল করে নোটিফিকেশন অ্যাক্সেস অন করে রাখবেন।
- **সুবিধা:** ব্যাকগ্রাউন্ডে ইনকামিং SMS শনাক্ত হয়ে TrxID ও পেমেন্ট অ্যামাউন্ট দ্রুত ভেরিফাই করতে সাহায্য করে।

---
**Technical Support & Assistance:**  
হোয়াটসঅ্যাপ: `+8801791357521` | টিম সিফর (Team Sifr)
