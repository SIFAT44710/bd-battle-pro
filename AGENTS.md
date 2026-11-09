# Sifat Bin Shahjahan's Master Directives — FF Squad Arena

## Project Overview
- **Name:** FF Squad Arena (Lightweight Free Fire 12-Squad Tournament Engine)
- **Product:** Ultra-Lightweight Pure HTML + CSS + Vanilla JS + Firebase Esports Platform
- **Target Audience:** Free Fire Guild Leaders, WhatsApp Group Organizers, Facebook Group Admins & Messenger Community Match Referees in Bangladesh.
- **Architectural Scope:** 100% Free Fire Squad Tournaments (12 Teams / 48 Players) with zero Next.js or node_modules bloat.

## Core Directives & Rules
1. **Communication Standard:** Friendly, casual, high-conviction Banglish for conversation; professional, clean English for code, commits, and technical docs.
2. **Currency:** ALWAYS BDT (৳ / Taka). NEVER USD ($). Standard placeholders: `৳১,০০০` or `৳১০০/squad`.
3. **OS / Shell:** Windows 11, PowerShell. Chaining with `;` only, NEVER `&&`.
4. **Architecture:** Pure Static HTML5 + CSS3 + Vanilla JavaScript + Firebase (Realtime Database / Firestore CDN) with LocalStorage auto-fallback. Zero build tools or heavy dependencies required.
5. **Esports Rules:** Official FFWS Points System (#1=12, #2=9, #3=8, #4=7, #5=6, #6=5, #7=4, #8=3, #9=2, #10=1, #11-12=0 + 1 pt/kill) with tie-breaker logic.
6. **Social Sharing:** 1-Click formatted text export for Facebook and WhatsApp groups.

## Autonomous WhatsApp Bot & AI Points Table Architecture (Updated 2026-11-09)
- **WhatsApp Autonomous Bot (`whatsapp-bot/`):**
  - Powered by `@whiskeysockets/baileys` (v6) with multi-file auth persistence (`auth_info_baileys/`).
  - Google Gemini Multimodal Vision & NLP (`gemini-3.5-flash` primary failover to `gemini-3.8-flash` & `gemini-flash-latest`) parses bKash/Nagad/Rocket screenshot OCR and Banglish natural language booking requests.
  - Dual-Driver Firestore Integration (`services/firestore.js`): Uses Firebase Admin SDK if service account is provided; falls back automatically to Firebase Client SDK for zero-friction setup.
  - Atomic slot locking on Firestore document `tournaments/ff-daily-squad`.
  - Duplicate TrxID detection prevents replay fraud.
  - 15-minute in-memory conversational session machine (`services/session.js`).
- **Web Platform Integration:**
  - `player.html`: "AI WhatsApp Booking" fast button with prefilled match details + WhatsApp screenshot fast-track inside payment modal.
  - `admin.html`: "Broadcast to Players" button generating formatted WhatsApp announcement and 1-Click direct links to each registered squad leader + WhatsApp Bot status card in Admin HQ settings.
- **Build & Deploy:**
  - `npm run bot`: Launches WhatsApp autonomous agent.
  - `npm run bot:test`: Runs live test suite against Firestore & Gemini API.
  - `npm run build`: Compiles through `protect-build.js` for obfuscation & mobile hardening.
  - `npm run deploy`: Deploys to Firebase Hosting (`ff-squad-arena-bd.web.app`).
- `index.html`: Live Lobby, 12-Slot Seating, Room ID/Pass Vault & Live Points Table (Overall & Match Tabs).
- `register.html`: Captain 4-Player Squad Registration Form (IGN + UID).
- `admin.html`: Organizer Command Center (Direct Team Entry, Series Match Score Input & 1-Click WhatsApp Report).
- `css/style.css`: Pure responsive dark-mode styling (#0A0E17 canvas, #FF2438, #00A3FF, #10B981).
- `js/points-engine.js`: Official FFWS points calculator & WhatsApp text report generator.
- `js/firebase-config.js`: Firebase Realtime DB sync engine with automatic LocalStorage fallback.
- `js/app.js`: Reactive UI rendering & event handlers.
