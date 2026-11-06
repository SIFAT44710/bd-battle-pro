'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BDT } from '@/components/common/BDT';
import {
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  Globe,
  Lock,
  Calculator,
  MessageCircle,
  CalendarCheck,
  TrendingUp,
  Cpu,
  Flame,
} from 'lucide-react';

export default function PricingPage() {
  // Interactive ROI Calculator State
  const [matchesPerDay, setMatchesPerDay] = useState(8);
  const [entryFee, setEntryFee] = useState(25);

  // Economic calculations based on 48 slots
  const slots = 48;
  const matchCollection = slots * entryFee;
  // Standard prize distribution (approx 79% of pool)
  const prizePool = Math.round(matchCollection * 0.79);
  const netPerMatch = matchCollection - prizePool;
  const dailyProfit = netPerMatch * matchesPerDay;
  const monthlyProfit = dailyProfit * 30;
  const daysToBreakEven = Math.max(1, Math.ceil(35000 / dailyProfit));

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম Team Sifr! আমি আপনাদের Free Fire Tournament Platform (৳৩৫,০০০ প্রফেশনাল বিজনেস প্যাকেজ) অর্ডার করতে চাই। শুরুতে ৳৫,০০০ বুকিং দিয়ে আমার ব্র্যান্ডের নামে ডেমো APK ও ওয়েবসাইট দেখতে চাই।`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 pb-24">
      {/* 1. HERO HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/15 text-[#FF2438] border border-red-500/30">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Sifr Esports • Turnkey B2B Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
          নিজের নামে Free Fire <br />
          <span className="bg-gradient-to-r from-white via-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
            টুর্নামেন্ট ওয়েবসাইট ও অ্যাপ কিনুন
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
          কোনো কোডিং ছাড়া মাত্র ১৫ মিনিটে লাইভ ডেলিভারি। আপনার নিজের বিকাশ/নগদে ১ সেকেন্ডে অটো-পেমেন্ট, 
          অটো রুম ভল্ট এবং হ্যাক-প্রুফ সার্ভার-সাইড ওয়ালেট। মাসে <strong className="text-emerald-400 font-black"><BDT amount={60000} />+</strong> নিশ্চিত মুনাফা!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>হোয়াটসঅ্যাপে অর্ডার করুন (বুকিং মাত্র ৳৫,০০০)</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/admin"
            className="px-5 py-3.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-bold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
            <span>লাইভ এডমিন ডেমো টেস্ট করুন</span>
          </Link>
        </div>
      </div>

      {/* 2. THREE-TIER PRICING MATRIX */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ৩-টিয়ার প্যাকেজ ও প্রাইসিং
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            বাজারের সস্তা হ্যাকড অ্যাপের প্রতারণা এড়িয়ে প্রফেশনাল অটোমেটেড প্ল্যাটফর্ম বেছে নিন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Tier 1: Starter Decoy / Warning */}
          <div className="p-6 rounded-2xl bg-[#090C14] border border-red-900/40 flex flex-col justify-between space-y-6 relative opacity-85 hover:opacity-100 transition-opacity">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-red-950/60 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>সতর্কতামূলক (Decoy)</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">১. সস্তা সাধারণ অ্যাপ</h3>
                <p className="text-xs text-gray-400 mt-1">বাজারের Kodular / Firebase ভিত্তিক সাধারণ অ্যাপ</p>
              </div>

              <div className="py-2 border-y border-[#1E2536]">
                <div className="text-2xl font-black text-gray-300">
                  <BDT amount={2000} /> – <BDT amount={5000} />
                </div>
                <p className="text-[11px] text-red-400 font-bold mt-1">❌ হ্যাকিং ও ব্যালেন্স চুরির ঝুঁকি ১০০%</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-start gap-2 text-red-300">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>ক্লায়েন্ট-সাইড ব্যালেন্স (Mod APK দিয়ে হ্যাক সম্ভব)</span>
                </li>
                <li className="flex items-start gap-2 text-red-300">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>ম্যানুয়াল বিকাশ মেলানোর যন্ত্রণা (সারাদিন নষ্ট)</span>
                </li>
                <li className="flex items-start gap-2 text-red-300">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>ম্যাচ শেষে ৪৮ জনের কিল হাতে গুনতে হয়</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <XCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                  <span>কোনো ওয়েব ভার্সন নেই (শুধু লো-কোয়ালিটি APK)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <XCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                  <span>রুম পাসওয়ার্ড পাবলিক গ্রুপে লিক হয়ে যায়</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-[11px] text-red-300 text-center font-bold">
              ⚠️ সতর্কবার্তা: এই ধরনের অ্যাপ নিয়ে কোনো অর্গানাইজার ব্যবসা টিকিয়ে রাখতে পারে না।
            </div>
          </div>

          {/* Tier 2: Professional Business (BEST SELLER) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#111827] via-[#0E1422] to-[#0A0E18] border-2 border-[#FF2438] shadow-2xl shadow-red-950/60 flex flex-col justify-between space-y-6 relative scale-[1.02] z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF2438] to-[#00A3FF] text-white shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>MOST POPULAR • BEST SELLER</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-[#FF2438]/20 text-[#FF2438] border border-[#FF2438]/40">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>প্রফেশনাল বিজনেস প্যাকেজ</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">২. Sifr Pro Platform</h3>
                <p className="text-xs text-gray-300 mt-1">পূর্ণাঙ্গ অটোমেটেড ওয়েবসাইট + অ্যান্ড্রয়েড APK</p>
              </div>

              <div className="py-2.5 border-y border-[#1E2536] space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    <BDT amount={35000} />
                  </span>
                  <span className="text-xs text-gray-400">এককালীন হ্যান্ডওভার</span>
                </div>
                <p className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  বুকিং মানি মাত্র <BDT amount={5000} /> (বাকি টাকা কিস্তিতে)
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>SifrPay ১-সেকেন্ড অটো বিকাশ/নগদ/রকেট</strong> (০% চার্জ, পার্সোনাল সিমে চলবে)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>PostgreSQL Server-Locked ওয়ালেট</strong> (হ্যাক করা শতভাগ অসম্ভব)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>১৫-মিনিট টাইম-গেটেড রুম ভল্ট</strong> (পাসওয়ার্ড লিক বন্ধ)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Web PWA + Android APK</strong> (যেকোনো ফোনে সুপারফাস্ট লোড)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>ফুল মোবাইল-ফ্রেন্ডলি এডমিন ড্যাশবোর্ড</strong> (মোবাইল থেকেই নিয়ন্ত্রণ)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>কাস্টম .com ডোমেইন</strong> ও ফ্রি লাইফটাইম SSL সার্টিফিকেট</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm text-center shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>৳৫,০০০ বুকিং দিয়ে শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Tier 3: Enterprise VIP */}
          <div className="p-6 rounded-2xl bg-[#090C14] border border-[#00A3FF]/40 flex flex-col justify-between space-y-6 relative hover:border-[#00A3FF]/70 transition-all">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40">
                <Zap className="w-3 h-3 text-[#00A3FF]" />
                <span>বড় গিল্ড ও ইউটিউবারদের জন্য</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">৩. এন্টারপ্রাইজ অটো-এম্পায়ার</h3>
                <p className="text-xs text-gray-400 mt-1">Gemini Vision AI + মাল্টি-সিম লোড ব্যালেন্সিং</p>
              </div>

              <div className="py-2.5 border-y border-[#1E2536] space-y-1">
                <div className="text-3xl font-black text-white">
                  <BDT amount={85000} />+
                </div>
                <p className="text-xs text-[#00A3FF] font-bold">ভিআইপি কাস্টম সল্যুশন</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                  <span><strong>প্রফেশনাল প্যাকেজের সব ফিচার অন্তর্ভুক্ত</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                  <span><strong>Gemini Vision AI OCR স্ক্যানার</strong> (ম্যাচ স্ক্রিনশট থেকে অটো কিল গণনা)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                  <span><strong>মাল্টি-সিম SifrPay লোড ব্যালেন্সার</strong> (একসাথে ৫টি বিকাশ/নগদ সিম)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                  <span><strong>Multi-Moderator RBAC</strong> (মডারেটররা ওয়ালেট অ্যাক্সেস ছাড়া ম্যাচ চালাবে)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A3FF] shrink-0 mt-0.5" />
                  <span><strong>Google Play Store পাবলিশিং গাইড</strong> ও ডেডিকেটেড ক্লাউড হোস্টিং</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/8801700000000?text=${encodeURIComponent('Hello Team Sifr! I am interested in the ৳85,000+ Enterprise VIP Esports Platform.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-bold text-xs border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>ভিআইপি কন্সাল্টেশন নিন</span>
              <ArrowRight className="w-4 h-4 text-[#00A3FF]" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BUYER ROI CALCULATOR */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0C101A] via-[#101626] to-[#0A0E18] border border-[#1E2536] shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2536] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#00A3FF] text-xs font-black uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>মুনাফার সরাসরি হিসাব (Buyer ROI Calculator)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              আপনি টুর্নামেন্ট চালিয়ে প্রতি মাসে কত আয় করবেন?
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            *৪৮-স্লট ফুল ম্যাপ সোলো/স্কোয়াড ম্যাচের গাণিতিক হিসাব
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Sliders */}
          <div className="space-y-6">
            {/* Matches per day */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>দিনে কয়টি ম্যাচ চালাবেন?</span>
                <span className="px-3 py-1 rounded-lg bg-red-500/20 text-[#FF2438] border border-red-500/30 text-base font-black">
                  {matchesPerDay} টি ম্যাচ / দিন
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={matchesPerDay}
                onChange={(e) => setMatchesPerDay(Number(e.target.value))}
                className="w-full accent-[#FF2438] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>২ টি (পার্ট-টাইম)</span>
                <span>৮ টি (স্ট্যান্ডার্ড)</span>
                <span>২০ টি (ফুল-টাইম গিল্ড)</span>
              </div>
            </div>

            {/* Entry Fee per slot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>প্রতি স্লট এন্ট্রি ফি (BDT):</span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-[#00A3FF] border border-blue-500/30 text-base font-black">
                  <BDT amount={entryFee} /> / প্লেয়ার
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full accent-[#00A3FF] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>৳১০ (বাজেট)</span>
                <span>৳২৫ (পপুলার)</span>
                <span>৳১০০ (হাই-স্টেকার্স)</span>
              </div>
            </div>

            {/* Economics Breakdown */}
            <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>প্রতি ম্যাচে মোট কালেকশন (৪৮ × <BDT amount={entryFee} />):</span>
                <span className="font-bold text-white"><BDT amount={matchCollection} /></span>
              </div>
              <div className="flex justify-between">
                <span>প্রতি ম্যাচে প্রাইজ পুল খরচ (~৭৯%):</span>
                <span className="font-bold text-red-400">- <BDT amount={prizePool} /></span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#1E2536] text-emerald-400 font-extrabold text-sm">
                <span>প্রতি ম্যাচে আপনার নিট লাভ (~২১%):</span>
                <span>+ <BDT amount={netPerMatch} /></span>
              </div>
            </div>
          </div>

          {/* ROI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2 text-center">
              <span className="text-[11px] text-gray-400 uppercase font-black">দৈনিক নিট লাভ</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                <BDT amount={dailyProfit} />
              </div>
              <p className="text-[11px] text-gray-500">({matchesPerDay} ম্যাচ × <BDT amount={netPerMatch} />)</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080B12] border-2 border-emerald-500/50 space-y-2 text-center shadow-lg shadow-emerald-950/40">
              <span className="text-[11px] text-emerald-400 uppercase font-black">মাসিক নিট মুনাফা (৩০ দিন)</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                <BDT amount={monthlyProfit} />
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold">আপনার পকেটে ক্যাশ লাভ!</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2 text-center sm:col-span-2">
              <span className="text-[11px] text-amber-400 uppercase font-black flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                অ্যাপের খরচ উসুল হতে সময় লাগবে:
              </span>
              <div className="text-2xl font-black text-white">
                মাত্র <span className="text-amber-400 underline">{daysToBreakEven} দিন</span>!
              </div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                অর্থাৎ মাত্র {daysToBreakEven} দিনের লাভের টাকায় আপনার সম্পূর্ণ ৳৩৫,০০০ অ্যাপের দাম উঠে আসবে। এরপরের আজীবন মুনাফা পুরোটাই আপনার!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE-STEP INSTALLMENT ROADMAP */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Risk Client Protection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ৩-ধাপের সহজ কিস্তি পেমেন্ট মডেল
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            একসাথে পুরো টাকা দিতে হবে না — আগে নিজের ফোনে ডেমো টেস্ট করুন, তারপর ধাপে ধাপে পেমেন্ট করুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#FF2438] border border-red-500/30 flex items-center justify-center font-black text-base">
              ১
            </div>
            <div className="text-lg font-black text-white">
              বুকিং ও লাইভ সেটআপ (<BDT amount={5000} />)
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              মাত্র ৳৫,০০০ বুকিং দিয়ে শুরু করুন। ১৫ মিনিটের মধ্যে আপনার ব্র্যান্ডের লোগো, নাম ও কালার দিয়ে লাইভ লিংক ও অ্যান্ড্রয়েড APK আপনার ফোনে বুঝিয়ে দেওয়া হবে।
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-[#00A3FF] border border-blue-500/30 flex items-center justify-center font-black text-base">
              ২
            </div>
            <div className="text-lg font-black text-white">
              ডোমেইন ও SifrPay গেটওয়ে (<BDT amount={15000} />)
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              আপনার ফোনে ডেমো দেখে সন্তুষ্ট হওয়ার পর আপনার কাস্টম ডোমেইন (.com) কানেক্ট করা হবে এবং আপনার বিকাশ/নগদ সিমে ১-সেকেন্ড অটো ভেরিফিকেশন চালু করে দেওয়া হবে।
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-emerald-500/40 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-base">
              ৩
            </div>
            <div className="text-lg font-black text-white">
              ফাইনাল কিস্তি (<BDT amount={15000} /> — ১৫ দিন পর)
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              টুর্নামেন্ট চালু করে ব্যবসা শুরু করুন। ১৫ দিন ম্যাচ চালিয়ে নিজের টুর্নামেন্টের লাভের টাকা থেকেই বাকি ১৫,০০০ টাকা ফাইনাল কিস্তি পরিশোধ করার সুযোগ!
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/60 via-[#101524] to-blue-950/60 border-2 border-[#FF2438]/50 shadow-2xl text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            আজই আপনার নিজের টুর্নামেন্ট ব্যবসা শুরু করুন!
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            ফ্রি ফায়ার গেমিং কমিউনিটি থেকে সম্মান ও ক্যারিয়ার-লেভেল ইনকাম গড়ে তুলুন। 
            আমরা দিচ্ছি ১০০% রেডি টুর্নামেন্ট ইঞ্জিন ও লাইভ টেক সাপোর্ট।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            <span>হোয়াটসঅ্যাপে ডেমো বুক করুন (বুকিং মাত্র ৳৫,০০০)</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0F1424] hover:bg-[#161D32] text-gray-300 font-bold text-sm border border-[#1E2536] transition-colors"
          >
            <span>লাইভ প্লেয়ার ইন্টারফেস দেখুন</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
