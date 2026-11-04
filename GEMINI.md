# BD Battle Pro — Architecture & Directives

Author: Sifat Bin Shahjahan  
Brand: BD Battle Pro (Powered by Sifr Esports)  
Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL  
Currency: BDT (৳ / Taka) strictly  
Design: Dark Obsidian Theme (#090D16, #111827, Emerald #10B981, Orange #F97316)  

## Key Conventions & Gotchas
- Currency placeholder: ৳ (BDT) only. Never use USD ($).
- Command chaining in PowerShell: Use `;` (semicolon).
- Time-Gated Room Credentials: 15 minutes before match start.
- Demo Mode: No real financial transactions or MFS TrxIDs in demo mode.
- Clean separation: Server-side validation for all joins and room credential access.
