# Sifr Esports / AppKinbo — B2B Sales, Pricing & Monetization Master Plan

**Product:** White-Label Free Fire Tournament Platform + SifrPay 1-Sec Auto-MFS Gateway  
**Live Demo Showcase:** https://bd-battle-pro.vercel.app/  
**Target Market:** Bangladeshi Free Fire Guild Leaders, YouTubers, Facebook Gaming Streamers, WhatsApp/Telegram Custom Room Organizers.

---

## 1. Core Sales Positioning (Why Buyers Pay ৳35,000)

### The 3 Fatal Flaws of Cheap (৳2,000 - ৳5,000) Kodular/Firebase Apps
1. **Hacking & Balance Theft:** Cheap apps use client-side Firebase without row-level security. Players easily use Lucky Patcher or Mod APKs to fake ৳50,000 balance and request real bKash withdrawals.
2. **Manual bKash Matching Hell:** Organizers waste 6-8 hours daily manually verifying 200+ small transactions (৳20 - ৳50) from SMS inbox.
3. **Manual Scoreboard & Kill Counting:** Manually inspecting 48 screenshots, calculating kills, and handling player disputes destroys operational efficiency.

### Sifr Esports 5 Unfair Advantages (USPs)
1. **SifrPay 1-Sec Auto-Deposit (0% Gateway Fee):** Runs on buyer's personal/agent bKash/Nagad/Rocket SIM via `sifr-pay.apk`. 100% automated TrxID verification without 2% merchant fees.
2. **PostgreSQL Atomic Server-Side Wallet:** Deposit, winning, and bonus balances are strictly separated and server-locked. Zero client-side tampering possible.
3. **Gemini Vision AI Scoreboard Scanner:** Instant OCR of match screenshots matching player in-game names (IGN) to kills, rank, and auto-calculating payouts.
4. **Time-Gated Room Vault:** Room ID & Password auto-unlock exactly 15 minutes before match start exclusively for registered players in that slot.
5. **Dual Delivery (Web PWA + Android APK):** Instant web browser registration with 100dvh mobile UX + installable Android APK.

---

## 2. 3-Tier Psychological Pricing Matrix

| Feature / Capability | 1. Starter Decoy (Warning) | 2. Professional Business (Best Seller) | 3. Enterprise Auto-Empire (VIP) |
|---|---|---|---|
| **One-Time Price** | ৳2,000 – ৳5,000 (Market Standard) | **৳35,000** (Booking: ৳5,000) | **৳85,000+** (Large Guilds/Streamers) |
| **Delivery Surface** | Basic Android APK only | **Android APK + Lightning Web PWA** | Custom APK + Web + Play Store Guide |
| **Payment Verification** | Manual (SMS matching) | **SifrPay 1-Sec Auto bKash/Nagad/Rocket** | Multi-SIM SifrPay Load Balancing |
| **Wallet Security** | Client-Side (100% Hackable) | **PostgreSQL Atomic Server-Side Lock** | Dedicated Cloud + Anti-Fraud Ledger |
| **Game Modes** | Solo matches only | **Full BR (Solo/Duo/Squad) + CS 4v4 + 1v1** | All Modes + Custom Tournament Brackets |
| **Room Credentials** | Leaked via group chat | **15-Min Time-Gated Room Vault** | Auto Room Vault + Push Notifications |
| **Result Verification** | Manual hand calculation | **Admin 1-Click Points + Screenshot Audit** | **Gemini Vision AI OCR Auto Scanner** |
| **Staff & RBAC** | None (Shared password) | **Mobile-Friendly Full Admin Panel** | Multi-Moderator RBAC (No Wallet Access) |

---

## 3. Buyer ROI Math (Sales Closing Weapon)

### Single Match Economics (48 Slots Full Map):
- **Entry Fee:** ৳25 / slot
- **Total Collection:** 48 × ৳25 = **৳1,200**
- **Prize Payout:** 1st ৳300 + 2nd ৳150 + 3rd ৳100 + 40 Kills @ ৳10 = **৳950**
- **Organizer Net Profit:** ৳1,200 - ৳950 = **৳250 / match (21% Net Margin)**

### Daily & Monthly Projections:
- **8 Matches Daily:** 8 × ৳250 = **৳2,000 Net Profit / Day**
- **Monthly Net Profit (30 Days):** 30 × ৳2,000 = **৳60,000+ / Month**
- **Break-Even Period:** ৳35,000 / ৳2,000 = **17.5 Days** (Full investment recovered in under 3 weeks!)

---

## 4. 3-Step Installment Closing Model (Zero-Risk for Buyers)

1. **Step 1 — Booking & Live Setup (৳5,000):** Buyer pays ৳5,000. Within 15 minutes, their branded web link and APK with logo & custom colors are delivered for live testing.
2. **Step 2 — Custom Domain & SifrPay Gateway Handover (৳15,000):** Buyer tests the admin panel and pays ৳15,000 upon connecting their custom `.com` domain and activating `sifr-pay.apk` on their SIM.
3. **Step 3 — Final Installment (৳15,000 — After 15 Days):** Buyer launches tournaments, earns profits, and pays the remaining balance from business cash flow.

---

## 5. Payment Security (SBS Super-Admin Kill-Switch) & MRR

### 5.1 SBS Super-Admin Kill-Switch (`/sbs`)
- Managed centrally from Sifat's master control panel.
- If a tenant defaults on the final installment or monthly maintenance fee, a single toggle sets `tenant.status = 'suspended'`.
- Immediately locks the tenant's website, admin panel, and APK with the message:  
  *“Platform Temporarily Suspended — Please Clear Pending Dues with Sifr Administration.”*
- Restores instantly upon payment confirmation.

### 5.2 Monthly Recurring Revenue (MRR)
- **Maintenance Fee:** ৳1,500 – ৳2,000 / month per active client (Server, Database & SifrPay AI maintenance).
- **Projections:**
  - 5 new clients/month: 5 × ৳35,000 = **৳1,75,000 / month upfront**
  - 30 active clients at month 6: 30 × ৳2,000 = **৳60,000 / month pure passive MRR**

---

## 6. 15-Minute Turnkey Tenant Deployment SOP

1. **Minute 1–3 (Tenant Provisioning):** Open `/sbs`, input buyer's Brand Name, Slug, Logo URL, and Brand Colors.
2. **Minute 4–7 (Domain Pointing):** Connect buyer's custom domain in Vercel and set tenant environment variable.
3. **Minute 8–11 (SifrPay Daemon Setup):** Install `sifr-pay.apk` on buyer's bKash/Nagad phone, configure Merchant ID & Secret Key, enable SMS read permission.
4. **Minute 12–15 (Handover):** Send WhatsApp message with Player Web Link, APK download link, and Admin credentials.

---

## 7. WhatsApp Sales Closing Script (Ready to Copy-Paste)

> "আসসালামু আলাইকুম ভাই! আপনি কি এখনো হোয়াটসঅ্যাপে হাতে বিকাশ TrxID মিলিয়ে আর কিল গুনে কাস্টম রুম চালাচ্ছেন?
>
> আমাদের **Sifr Esports Auto-Platform** দিয়ে আপনি নিজের নামে ও লোগোতে সম্পূর্ণ অটোমেটেড Free Fire টুর্নামেন্ট ওয়েবসাইট + Android APK পাবেন—যেখানে:
> 
> ১. আপনার নিজের পার্সোনাল বা এজেন্ট বিকাশ/নগদেই ১ সেকেন্ডে অটো পেমেন্ট ভেরিফাই হবে (কোনো মার্চেন্ট ফি নেই)।  
> ২. ম্যাচের ১৫ মিনিট আগে শুধু রেজিস্টার্ড প্লেয়াররা Auto Room ID & Password পাবে।  
> ৩. হ্যাকাররা Mod APK দিয়ে ১ টাকাও এডিট করতে পারবে না (PostgreSQL সার্ভার-লকড)।  
> 
> 👉 এখনই নিজের হাতে আমাদের লাইভ ডেমো ও অ্যাডমিন প্যানেল চালিয়ে দেখুন: https://bd-battle-pro.vercel.app/  
> *(ওপরে Tanvir প্লেয়ার এবং Sifat অ্যাডমিন বাটনে ক্লিক করে দুই ভিউই টেস্ট করতে পারবেন!)*
> 
> শুরুতে পুরো টাকা দিতে হবে না—মাত্র **৳৫,০০০ বুকিং** দিয়ে আজই আপনার ব্র্যান্ডের নামে অ্যাপ ও অ্যাডমিন প্যানেল নিজের ফোনে বুঝে নিন। বাকি টাকা আপনার টুর্নামেন্ট চালু হওয়ার পর কিস্তিতে পরিশোধ করার সুযোগ আছে। 
> 
> আপনার ব্র্যান্ড বা গিল্ডের নাম কী দেবেন ভাই?"
