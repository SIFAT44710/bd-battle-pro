'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import JoinModal from '@/components/tournaments/JoinModal';
import { BDT } from '@/components/common/BDT';
import { Tournament, TournamentType } from '@/types/tournament';
import {
  Swords,
  Trophy,
  Flame,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Users,
  Crown,
  Zap,
  Volume2,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const { tournaments } = useDemo();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | TournamentType>('All');

  // Filter tournaments by tab
  const filteredTournaments = tournaments.filter((t) => {
    if (activeTab === 'All') return true;
    return t.match_type === activeTab;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* 1. TOP NOTICE / MARQUEE TICKER (RRR Esports Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#101522] to-blue-950/60 border border-[#1E2536] flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-[#FF2438] border border-red-500/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 truncate">
              📢 <strong className="text-white">BD BATTLE PRO-তে স্বাগতম!</strong> ফ্রি ফায়ার ডেইলি কাস্টম টুর্নামেন্ট ও রুম ম্যাচ চলছে। ১০০% অটোমেটিক সিকিউর রুম ভল্ট ও দ্রুত বিকাশ/নগদ পেআউট!
            </p>
          </div>
          <Link
            href="/tournaments"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151D2F] hover:bg-[#1E2A44] text-[#00A3FF] hover:text-white text-xs font-black shrink-0 transition-colors border border-[#00A3FF]/30"
          >
            <span>ম্যাচ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. SIMPLE, DIRECT HERO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0C101B] via-[#0F1424] to-[#0A0D16] border border-[#1E2536] p-6 sm:p-10 shadow-2xl">
          {/* Subtle Glow Backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/15 text-[#FF2438] border border-red-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Premier Esports Tournament Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                Garena Free Fire <br />
                <span className="bg-gradient-to-r from-white via-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
                  Daily Tournament Arena
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                কাস্টম রুমে অংশ নিন, সঠিক স্লটে জয়েন করুন এবং বুয়াহ নিয়ে জিতে নিন আকর্ষণীয় ক্যাশ প্রাইজ। কোনো ঝামেলা নেই — ১৫ মিনিট আগে অটোমেটিক রুম আইডি ও পাসওয়ার্ড ডেলিভারি।
              </p>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link
                  href="/tournaments"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Swords className="w-4 h-4" />
                  <span>সবগুলো ম্যাচ দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/admin"
                  className="px-5 py-3.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-extrabold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
                  <span>এডমিন প্যানেল প্রিভিউ</span>
                </Link>
              </div>
            </div>

            {/* Official Logo Badge */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-3 bg-gradient-to-r from-[#FF2438] to-[#00A3FF] rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-700" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-[#080B12] border-2 border-[#1E2536] p-3 flex items-center justify-center shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="BD Battle Pro Logo"
                  width={150}
                  height={150}
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,36,56,0.6)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GAME CATEGORIES CARDS (Exact RRR Esports Pattern) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
          <div className="flex items-center gap-2 text-white font-black text-lg sm:text-xl">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>ম্যাচ ক্যাটাগরি (Match Formats)</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">ক্লিক করে ম্যাচ দেখুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category 1: Free Match */}
          <Link
            href="/tournaments"
            className="group p-5 rounded-2xl bg-gradient-to-b from-[#101524] to-[#0A0D15] border border-[#1E2536] hover:border-emerald-500/50 transition-all shadow-lg hover:-translate-y-1 block space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black">
                🎁
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                0 BDT ENTRY
              </span>
            </div>
            <div>
              <h3 className="font-black text-base text-white group-hover:text-emerald-400 transition-colors">
                FREE MATCH
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                ফ্রি এন্ট্রি ম্যাচ • প্র্যাকটিস করুন ও ক্যাশ রিওয়ার্ড জিতে নিন
              </p>
            </div>
            <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>View Free Matches</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Category 2: Classic Battle Royale */}
          <Link
            href="/tournaments"
            className="group p-5 rounded-2xl bg-gradient-to-b from-[#101524] to-[#0A0D15] border border-[#1E2536] hover:border-[#FF2438]/50 transition-all shadow-lg hover:-translate-y-1 block space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 text-[#FF2438] flex items-center justify-center font-black">
                🏆
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-red-950/70 text-[#FF2438] border border-red-500/30">
                48 SLOTS FULL MAP
              </span>
            </div>
            <div>
              <h3 className="font-black text-base text-white group-hover:text-[#FF2438] transition-colors">
                CLASSIC MATCH
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Bermuda & Purgatory • সোলো ও স্কোয়াড ফুল ব্যাটেল রয়্যাল
              </p>
            </div>
            <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-xs text-[#FF2438] font-bold">
              <span>View Classic Matches</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Category 3: Clash Squad */}
          <Link
            href="/tournaments"
            className="group p-5 rounded-2xl bg-gradient-to-b from-[#101524] to-[#0A0D15] border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all shadow-lg hover:-translate-y-1 block space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-[#00A3FF] flex items-center justify-center font-black">
                ⚔️
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-950/70 text-[#00A3FF] border border-blue-500/30">
                4 vs 4 BLITZ
              </span>
            </div>
            <div>
              <h3 className="font-black text-base text-white group-hover:text-[#00A3FF] transition-colors">
                CLASH SQUAD
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                7-রাউন্ড ফাস্ট অ্যাকশন • Kalahari Blitz • Winner Takes All
              </p>
            </div>
            <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-xs text-[#00A3FF] font-bold">
              <span>View Clash Squad</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Category 4: Lone Wolf & Duo */}
          <Link
            href="/tournaments"
            className="group p-5 rounded-2xl bg-gradient-to-b from-[#101524] to-[#0A0D15] border border-[#1E2536] hover:border-amber-500/50 transition-all shadow-lg hover:-translate-y-1 block space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
                🎯
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-950/70 text-amber-400 border border-amber-500/30">
                DUO & 1v1
              </span>
            </div>
            <div>
              <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">
                LONE WOLF / DUO
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Alpine & Nexterra • হাই স্কিলড হেডশট শোডাউন ও কিল বাউন্টি
              </p>
            </div>
            <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>View Duo Matches</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. ACTIVE TOURNAMENTS LIST WITH CLEAN FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF2438] font-black text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Live Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              চলতি ও আসন্ন টুর্নামেন্টসমূহ (Active Tournaments)
            </h2>
          </div>

          {/* Simple Clean Format Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F19] border border-[#1E2536] self-start sm:self-auto overflow-x-auto max-w-full">
            {(['All', 'Squad', 'Duo', 'Solo', 'Clash Squad'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                {tab === 'All' ? 'সব ম্যাচ (All)' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tournament Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.slice(0, 6).map((tourney) => (
            <TournamentCard
              key={tourney.id}
              tournament={tourney}
              onJoinClick={(t) => setSelectedTournament(t)}
            />
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1422] hover:bg-[#161E30] text-gray-200 font-bold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all shadow-md"
          >
            <span>সবগুলো {tournaments.length}টি টুর্নামেন্ট ব্রাউজ করুন</span>
            <ArrowRight className="w-4 h-4 text-[#00A3FF]" />
          </Link>
        </div>
      </section>

      {/* 5. COMMERCIAL TURNKEY DEMO / BUYER SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111728] via-[#0E1322] to-[#0A0D16] border-2 border-[#00A3FF]/30 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Turnkey Esports Platform Solution</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              আপনিও কি এরকম একটি Esports Tournament ওয়েবসাইট বানাতে চান?
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              এটি <strong>Team Sifr / BD Battle Pro</strong>-এর অফিশিয়াল লাইভ ডেমো প্ল্যাটফর্ম। আপনারা যদি নিজের ব্র্যান্ডের জন্য ফুল-ফাংশনাল টুর্নামেন্ট ওয়েবসাইট কেনেন, তাহলে হুবহু এই ধরনের ওয়েবসাইট এবং ফুল অ্যাডমিন ড্যাশবোর্ড পাবেন।
            </p>
          </div>

          {/* 4 Core Platform Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#FF2438] flex items-center justify-center font-black">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-white">১৫-মিনিট রুম ভল্ট</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                পাসওয়ার্ড লিক বন্ধ করতে ম্যাচ শুরুর ১৫ মিনিট আগে শুধুমাত্র রেজিস্টার্ড প্লেয়ারদের জন্য অটো আনলক।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-[#00A3FF] flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-white">অটো স্লট ম্যানেজমেন্ট</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                ১ থেকে ৪৮ পর্যন্ত ডুপ্লিকেট-মুক্ত ইউনিক স্লট অ্যাসাইনমেন্ট ও ওভার-সাবস্ক্রিপশন প্রিভেনশন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <BDT amount={500} />
              </div>
              <h3 className="font-black text-sm text-white">SifrPay বিকাশ/নগদ</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                TrxID অটো ভেরিফিকেশন, স্বয়ংক্রিয় ওয়ালেট ব্যালেন্স আপডেট এবং উইথড্র লেজার ট্র্যাকিং।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080B12] border border-[#1E2536] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-white">কমপ্লিট এডমিন প্যানেল</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                ম্যাচ ক্রিয়েশন, প্লেয়ারদের ইন-গেম নাম/UID ভেরিফিকেশন এবং ওয়ান-ক্লিক প্রাইজ রেজাল্ট পাবলিশ।
              </p>
            </div>
          </div>

          {/* Action Callouts for Buyers */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/admin"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00A3FF] to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-950/60 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>লাইভ এডমিন প্যানেল ঘুরে দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/8801700000000?text=Hello%20Team%20Sifr,%20I%20want%20to%20buy/order%20an%20esports%20tournament%20website%20like%20BD%20Battle%20Pro."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>ওয়েবসাইট কিনতে যোগাযোগ করুন (WhatsApp)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Join Modal */}
      {selectedTournament && (
        <JoinModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
}