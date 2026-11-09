# 🤖 ARENA X — Autonomous WhatsApp Tournament Booking Bot

An autonomous Node.js bot for Free Fire tournament organizers in Bangladesh. It connects WhatsApp with **Google Gemini 1.5 Flash Vision** and **Firebase Firestore** to automatically parse player payment screenshots or Banglish text messages, book the slot in real-time, and reply with instant WhatsApp confirmation.

---

## 🌟 Key Features

1. **Instant WhatsApp Integration (@whiskeysockets/baileys):**
   - Pure WebSocket Baileys client (No slow Chromium or Puppeteer required).
   - Generates QR code directly in the terminal for linking any personal or business WhatsApp number.
   - Multi-device support with automatic session resumption (`auth_info_baileys`).

2. **Multimodal Gemini 1.5 Flash AI Engine:**
   - **Payment Screenshots OCR:** Auto-reads bKash, Nagad, Rocket & Upay screenshots, extracting TrxID, amount (৳), time, and payment status.
   - **Banglish Natural Language Understanding:** Parses messy conversational texts (e.g. *"vai 9:15 pm match slot 4 te squad vortex book koren trx BL9204918"*).

3. **Real-time Firebase Firestore Auto-Booking:**
   - Directly checks slot availability on `tournaments/ff-daily-squad`.
   - Locks the slot with Squad Name, Leader IGN, WhatsApp Contact, and TrxID.
   - Dual-driver: Works out-of-the-box via Firebase Client SDK, or via `firebase-admin` with a `serviceAccountKey.json`.
   - **Anti-Fraud Shield:** Checks for duplicate TrxIDs to prevent multiple squads using the same transaction.

4. **Conversational Memory & State Machine:**
   - If a player sends a payment screenshot first without a squad name, the bot remembers the payment and politely asks for the squad name. Once provided, it finalizes the booking!

5. **Instant WhatsApp Confirmation:**
   - Sends a rich, formatted confirmation message with Match Name, Slot #, Squad Name, and instructions on unlocking Room ID & Password at [ARENA X Player Panel](https://ff-squad-arena-bd.web.app/player).

---

## ☁️ 100% Free 24/7 Cloud Deployment (No PC Needed / GitHub Linked)

আপনার বা আপনার টুর্নামেন্ট অর্গানাইজারদের কোনো পিসি ছাড়াই ২৪ ঘণ্টা ক্লাউডে বট চালু রাখার জন্য Render বা Koyeb-এর ফ্রি টায়ার ব্যবহার করুন:

### ১. Render.com এ ১-ক্লিক ডিপ্লয় (Free Tier):
1. [Render.com](https://render.com)-এ গিয়ে আপনার GitHub অ্যাকাউন্ট দিয়ে লগইন করুন (সম্পূর্ণ ফ্রি, কোনো ক্রেডিট কার্ড লাগে না)।
2. **"New +"** বাটনে ক্লিক করে **"Web Service"** সিলেক্ট করুন।
3. আপনার গিটহ্যাব রিপোজিটরি `SIFAT44710/bd-battle-pro` সিলেক্ট করুন।
4. রিপোজিটরির রুটে অলরেডি `render.yaml` কনফিগার করা আছে। শুধু নিচের মতো কনফিগ দিন:
   - **Root Directory:** `whatsapp-bot`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Create Web Service**-এ ক্লিক করুন।
6. ২ মিনিটের মধ্যে বট লাইভ হয়ে যাবে এবং Render আপনাকে একটি ফ্রি লাইভ ড্যাশবোর্ড URL দেবে (যেমন: `https://arena-x-bot.onrender.com`)।

### ২. মোবাইল দিয়ে সরাসরি পেয়ারিং (Pairing Code — নো পিসি, নো কিউআর):
1. আপনার ফোনের ব্রাউজার থেকে Render-এর লাইভ লিংকে ঢুকুন।
2. সেখানে **"📱 মোবাইল দিয়ে কানেক্ট করুন"** বক্সে আপনার WhatsApp নম্বর (যেমন: `01791357521`) দিয়ে **"পেয়ারিং কোড পান"** চাপুন।
3. স্ক্রিনে একটি ৮ ডিজিটের কোড (যেমন: `ABCD-1234`) ভেসে উঠবে।
4. আপনার ফোনের WhatsApp > **Settings** > **Linked Devices** > **Link with phone number instead**-এ গিয়ে কোডটি বসিয়ে দিন।
5. ব্যস! কোনো পিসি ছাড়াই আপনার মোবাইল থেকে ক্লাউড বট সার্বক্ষণিক কানেক্ট হয়ে যাবে!

### ৩. ২৪ ঘণ্টা নিরবচ্ছিন্ন সচল রাখার ট্রিক (Keep-Alive):
Render ফ্রি টায়ারে ১৫ মিনিট রিকোয়েস্ট না আসলে স্লিপে যায়। বটকে ২৪ ঘণ্টা জাগিয়ে রাখতে:
- [cron-job.org](https://cron-job.org) বা [uptimerobot.com](https://uptimerobot.com)-এ ফ্রি অ্যাকাউন্ট খুলুন।
- আপনার বটের হেলথ URL অ্যাড করুন: `https://your-bot-url.onrender.com/ping` (প্রতি ১০ মিনিট পরপর পিং পাঠাবে)।
- এটি আজীবন সম্পূর্ণ ফ্রিতে আপনার বটকে ২৪ ঘণ্টা ৩৬৫ দিন অনলাইনে রাখবে!

---

## 🚀 Quick Setup & Run (Local PC)

### 1. Install Dependencies
```powershell
cd D:\skill\arena-x-whatsapp-bot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Open `.env` and verify your credentials:
```env
GEMINI_API_KEY=AQ.Ab8RN6JPMJBewHtj4jRfbQnYxW8zYBLxbhmOOisisOS7eF2xHg
TOURNAMENT_DOC_ID=ff-daily-squad
DEFAULT_ENTRY_FEE=100
WEBSITE_URL=https://ff-squad-arena-bd.web.app/player
```

### 3. Start the Bot
```powershell
npm start
```

### 4. Link WhatsApp
- A QR code will appear in the terminal.
- Open WhatsApp on your phone -> **Settings** -> **Linked Devices** -> **Link a Device**.
- Scan the terminal QR code.
- Once connected, the bot is 100% active and listening for incoming messages!

---

## 💬 Example Player Conversations

### Scenario A: Player sends Banglish text with TrxID
**Player:** 
> *"vai 8:30 pm match slot 5 a squad Dark Vortex leader Sifat book koren trx BL9204918 fee 100 bkash korsi"*

**Bot Reply:**
> 🎮 **ARENA X TOURNAMENT CONFIRMATION** 🎮  
> ━━━━━━━━━━━━━━━━━━━━━━━  
> ✅ **আপনার স্কোয়াড সফলভাবে রেজিস্টার্ড হয়েছে!**  
> 🏆 **ম্যাচ:** Match 1: Bermuda Squad Championship  
> 🗺️ **ম্যাপ:** Bermuda  
> ⏰ **সময়:** Today 08:30 PM  
> 🎯 **স্লট নম্বর:** Slot #05  
> 🛡️ **স্কোয়াড:** Dark Vortex  
> 👑 **লিডার:** Sifat  
> 📱 **ভেরিফাইড নম্বর:** 01791357521  
> 💰 **পেমেন্ট:** ৳100 (BKASH - BL9204918)  
> ━━━━━━━━━━━━━━━━━━━━━━━  
> 🔑 **রুম আইডি ও পাসওয়ার্ড অ্যাক্সেস:**  
> ম্যাচ শুরুর ১৫ মিনিট আগে সরাসরি ওয়েবসাইটে গিয়ে আপনার এই হোয়াটসঅ্যাপ নম্বরটি ভেরিফাই করলেই কাস্টম রুম আইডি ও পাসওয়ার্ড আনলক হয়ে যাবে!  
> 🌐 **লাইভ ওয়েবসাইট:** https://ff-squad-arena-bd.web.app/player

---

### Scenario B: Player sends a bKash screenshot first
**Player:** *(Uploads bKash payment screenshot)*  
**Bot:** 
> *"✅ ধন্যবাদ! আপনার ৳100 পেমেন্ট সফলভাবে শনাক্ত হয়েছে (TrxID: 9K827419)।  
> 🎯 এবার অনুগ্রহ করে আপনার স্কোয়াড নাম এবং আপনি কত নম্বর স্লটে খেলতে চান তা লিখে পাঠান (যেমন: Squad Apex, Slot 3, Leader Tanvir)।"*

**Player:** 
> *"squad apex slot 3"*

**Bot:** *(Instantly books Slot #3 in Firestore and sends the official confirmation card!)*

---

### Scenario C: Slot Already Occupied
**Player:** 
> *"slot 1 book koren squad viper trxid BL9204918"*

**Bot:**
> *"⚠️ দুঃখিত! স্লট #1 ইতিমধ্যে অন্য দল বুক করে নিয়েছে।  
> খালি স্লটসমূহ: #2, #4, #6, #7, #8, #9, #10, #11, #12  
> অনুগ্রহ করে ওপরের যেকোনো একটি খালি স্লট নম্বর লিখে পাঠান (যেমন: Slot 2)।"*

---

## 📁 Project Architecture
```
arena-x-whatsapp-bot/
├── config.js               # Central configuration & defaults
├── index.js                # Bot entrypoint & startup banner
├── package.json            # Node.js ESM package configuration
├── .env                    # Real Gemini API Key & Firestore config
├── .env.example            # Environment template
├── services/
│   ├── firestore.js        # Firestore dual-driver (Admin SDK & Client SDK)
│   ├── gemini.js           # Gemini 1.5 Flash Vision & Text Parser
│   ├── session.js          # Player conversation state memory (15-min TTL)
│   └── whatsapp.js         # Baileys client, QR generator, message listener
└── README.md               # Production setup and architecture guide
```

---
**Built with ❤️ for Sifat Bin Shahjahan's ARENA X Esports Platform.**
