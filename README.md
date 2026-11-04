# BD Battle Pro — Fresh Demo Build V1
> **Subtitle:** Powered by Sifr Esports  
> **Author & Lead Architect:** Sifat Bin Shahjahan  
> **Target Game:** Garena Free Fire & Free Fire MAX (Bangladesh Competitive Community)  
> **Primary Currency:** Bangladeshi Taka (৳ / BDT) Strictly  
> **Status:** Production-Ready Demo Build (Clean & Completely Separate Repository)  

---

## 1. Project Overview

**BD Battle Pro** is a modern, full-stack tournament operating platform tailored specifically for Bangladeshi Free Fire community tournament organizers and competitive players.

It eliminates traditional operational bottlenecks:
1. **Password Leakage & Slot Hijacking:** Solved via a **15-Minute Time-Gated Room Vault (`RoomVault`)** that releases credentials only to verified registered participants strictly within 15 minutes of match start.
2. **Double-Booking & Slot Chaos:** Solved via an **Atomic PostgreSQL Transaction & Slot Allocator** with row locks (`SELECT ... FOR UPDATE`), assigning specific 1–48 slots without race conditions.
3. **Manual Scoreboard Audits:** Built with an **IGN-First Identity Model** that mirrors Free Fire post-game end screens.
4. **Transparent Ledger Settlements:** Instant demo BDT (৳) balances with an immutable transaction ledger.

---

## 2. Technology Stack

- **Framework:** Next.js 15+ App Router
- **Runtime:** Node.js v22+
- **Frontend Engine:** React 19
- **Type Safety:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS (Dark Obsidian Esports Theme `#090D16` / `#111827`)
- **Icons:** Lucide React
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) & RPC functions
- **Deployment Compatibility:** Vercel Production Build verified

---

## 3. Design System & Aesthetics

- **Esports Dark Obsidian Theme:**
  - Background Canvas: `#090D16`
  - Card Surface: `#111827`
  - Elevated Surface: `#1F2937`
  - Card Borders: `#1F2937` / `#374151`
  - Primary Emerald Accent: `#10B981` (Prize pools, registration confirmations, active indicators)
  - Secondary Orange Accent: `#F97316` (Per-kill bounties, hot matches, live banners)
- **Typography:**
  - English / Latin: `Plus Jakarta Sans`
  - Bengali / Numbers: `Hind Siliguri`
- **Mobile-First Responsive Layout:**
  - Fixed mobile bottom navigation (`MobileNav.tsx`)
  - Dynamic viewport height (`100dvh`)
  - High-touch tournament cards and slot seating grids

---

## 4. Architectural Overview

```mermaid
flowchart TD
    subgraph Client["Player & Admin Client (Next.js 15)"]
        UI1[Home Lobby & Tournament Listing]
        UI2[Tournament Details & 48-Slot Grid]
        UI3[15-Minute Room Vault]
        UI4[Admin Command Center]
    end

    subgraph StateEngine["Demo Simulator & API Layer"]
        CTX[DemoContext Reactive Engine]
        API1[/api/tournaments - Public Listing without Room Passwords]
        API2[/api/tournaments/:id/join - Atomic Slot Validation]
        API3[/api/tournaments/:id/room - 15m Time Gate Authorization]
    end

    subgraph Database["Supabase PostgreSQL (Independent Schema)"]
        T1[(profiles - IGN & UID)]
        T2[(tournaments - Match Type, Map, Rules)]
        T3[(participants - Slot 1..48 Seating)]
        T4[(demo_transactions - BDT Ledger)]
        T5[(match_results - Kills & Prizes)]
        RPC[join_tournament FOR UPDATE RPC]
    end

    UI1 --> CTX
    UI2 --> API2 --> RPC
    UI3 --> API3
    UI4 --> API1
    CTX --> Database
```

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- Node.js 18.18+ or 20+ (Node v22 recommended)
- npm 9+ or 10+

### Step 1: Install Dependencies
```powershell
Set-Location "D:\skill\bd-battle-pro"
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```powershell
Copy-Item .env.example .env.local
```

Default configuration for zero-config Demo Mode:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEFAULT_CURRENCY=BDT
```

### Step 3: Run Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run Type Check & Production Build
```powershell
npx tsc --noEmit
npm run lint
npm run build
```

---

## 6. Pre-Configured Demo Accounts & Testing Personas

BD Battle Pro comes pre-configured with 3 testing personas accessible via the top **Demo Mode Switcher Bar**:

| Persona | Role | Free Fire IGN | FF UID | Balance | Purpose |
|:---|:---|:---|:---|:---|:---|
| **Tanvir Ahmed** | Pro Player | `亗TANVIR亗` | `2948201948` | `৳650` | Pre-registered in Tournament #1 (which starts in 10 mins). Tests instant Room Vault unlock! |
| **Rakib Hassan** | Challenger Player | `RAKIB_OP` | `3184920491` | `৳300` | Unregistered in Tournament #2. Tests live slot deduction, duplicate check, and 15m countdown lock! |
| **Sifat Bin Shahjahan** | Organizer Admin | `SIFR_FOUNDER` | `1000000001` | `৳50,000` | Full Organizer access to `/admin` to create matches, set room credentials, view UIDs, and publish results. |

---

## 7. Supabase Database Migration (Fresh Project Setup)

To connect BD Battle Pro to a real Supabase project:
1. Create a brand new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261104_init_bd_battle_pro.sql` and run the entire script.
4. Copy your project URL and anon key from **Project Settings → API**.
5. Paste them into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
   NEXT_PUBLIC_DEMO_MODE=false
   ```

---

## 8. Vercel Deployment Guide

1. Push this separate project to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "feat: initial release of BD Battle Pro v1 demo"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bd-battle-pro.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_DEMO_MODE=true`
   - `NEXT_PUBLIC_DEFAULT_CURRENCY=BDT`
4. Click **Deploy**. Vercel will automatically run `npm run build` with zero errors!
