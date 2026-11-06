'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import JoinModal from '@/components/tournaments/JoinModal';
import { Tournament, TournamentType } from '@/types/tournament';
import {
  Swords,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Tv,
  MessageCircle,
  Smartphone,
  ExternalLink,
  Flame,
  Crown,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { tournaments } = useDemo();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Match counts for category cards
  const freeCount = tournaments.filter((t) => t.entry_fee === 0).length;
  const classicCount = tournaments.filter((t) => t.match_type === 'Squad' || t.match_type === 'Solo').length;
  const csCount = tournaments.filter((t) => t.match_type === 'Clash Squad').length;
  const loneWolfCount = tournaments.filter((t) => t.match_type === 'Duo').length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. TOP NOTICE / TICKER (Exact RRR Esports Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-red-950/70 via-[#101524] to-blue-950/70 border border-[#1E2536] flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FF2438]/20 text-[#FF2438] border border-[#FF2438]/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 truncate">
              📢 <strong className="text-white">BD BATTLE PRO</strong>-তে স্বাগতম! ফ্রি ফায়ার ডেইলি কাস্টম টুর্নামেন্ট চলছে। ১৫ মিনিট আগে অটোমেটিক রুম ভল্ট ডেলিভারি!
            </p>
          </div>
          <Link
            href="/tournaments"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151D2F] hover:bg-[#1E2A44] text-[#00A3FF] hover:text-white text-xs font-bold shrink-0 transition-colors border border-[#00A3FF]/30"
          >
            <span>ম্যাচ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. CLEAN TOP HERO BANNER (RRR Esports Carousel Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0A0E17] border border-[#1E2536] p-5 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/15 text-[#FF2438] border border-red-500/30">
                <Crown className="w-3 h-3 text-amber-400" />
                Bangladesh Premier Esports Arena
              </span>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                BD BATTLE PRO <br />
                <span className="bg-gradient-to-r from-white via-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
                  ESPORTS TOURNAMENTS
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 font-medium">
                ডেইলি ফ্রি ফায়ার কাস্টম ম্যাচ • সিকিউর রুম ভল্ট • ইনস্ট্যান্ট বিকাশ ও নগদ পেআউট
              </p>

              {/* Direct Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <Link
                  href="/tournaments"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Swords className="w-4 h-4" />
                  <span>সবগুলো ম্যাচ খেলুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/admin"
                  className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-extrabold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
                  <span>এডমিন ডেমো দেখুন</span>
                </Link>
              </div>
            </div>

            {/* Official Logo Banner Badge */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#07090F] border-2 border-[#1E2536] p-2 flex items-center justify-center shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="BD Battle Pro Logo"
                  width={140}
                  height={140}
                  className="object-contain drop-shadow-[0_0_12px_rgba(255,36,56,0.6)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION DIVIDER: FREE FIRE MATCHES (Exact RRR Esports) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF2438]" />
            <span>Free Fire Matches</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

        {/* 4 CATEGORY CARDS (RRR Esports Exact Card Pattern) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: FREE MATCH */}
          <Link
            href="/tournaments"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-emerald-500/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group"
          >
            {/* Background Image with Dark Tint */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/19092025021654654_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />

            {/* Inner Content (Avatar + Title + Count) */}
            <div className="relative flex items-center space-x-4 p-4 sm:p-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex justify-center items-center overflow-hidden rounded-full border-2 border-emerald-500/50 shadow-xl shrink-0 bg-black/60">
                <img
                  src="https://admin.rrresports.com/uploads/16112025205512912.png"
                  alt="Free Match"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center text-white">
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-400 transition-colors text-left uppercase tracking-wide">
                  FREE MATCH
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-emerald-400 text-left mt-0.5">
                  {freeCount > 0 ? `${freeCount} Matches Found` : 'Free Entry Available'}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: CLASSIC MATCH */}
          <Link
            href="/tournaments?type=Squad"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-[#FF2438]/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/17102025191635884_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />

            <div className="relative flex items-center space-x-4 p-4 sm:p-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex justify-center items-center overflow-hidden rounded-full border-2 border-red-500/50 shadow-xl shrink-0 bg-black/60">
                <img
                  src="https://admin.rrresports.com/uploads/16112025205525920.png"
                  alt="Classic Match"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center text-white">
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-[#FF2438] transition-colors text-left uppercase tracking-wide">
                  CLASSIC MATCH
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-red-400 text-left mt-0.5">
                  {classicCount > 0 ? `${classicCount} Matches Found` : 'Full Map Battle'}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: CLASH SQUAD */}
          <Link
            href="/tournaments?type=Clash+Squad"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-[#00A3FF]/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/1710202519233668_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />

            <div className="relative flex items-center space-x-4 p-4 sm:p-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex justify-center items-center overflow-hidden rounded-full border-2 border-blue-500/50 shadow-xl shrink-0 bg-black/60">
                <img
                  src="https://admin.rrresports.com/uploads/1611202520553639.png"
                  alt="Clash Squad"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center text-white">
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-[#00A3FF] transition-colors text-left uppercase tracking-wide">
                  CLASH SQUAD
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#00A3FF] text-left mt-0.5">
                  {csCount > 0 ? `${csCount} Matches Found` : '4v4 Fast Blitz'}
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: LONE WOLF */}
          <Link
            href="/tournaments?type=Duo"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-amber-500/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/17102025192724450_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />

            <div className="relative flex items-center space-x-4 p-4 sm:p-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex justify-center items-center overflow-hidden rounded-full border-2 border-amber-500/50 shadow-xl shrink-0 bg-black/60">
                <img
                  src="https://admin.rrresports.com/uploads/1611202520554731.png"
                  alt="Lone Wolf"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center text-white">
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors text-left uppercase tracking-wide">
                  LONE WOLF / DUO
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-amber-400 text-left mt-0.5">
                  {loneWolfCount > 0 ? `${loneWolfCount} Matches Found` : 'Aim Showdown'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. SECTION DIVIDER: LUDU MATCHES (Exact RRR Esports) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Ludu Matches</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tournaments"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-amber-400/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group md:col-span-2"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/19092025015624248_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/50" />

            <div className="relative flex items-center space-x-4 p-4 sm:p-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex justify-center items-center overflow-hidden rounded-full border-2 border-amber-400/50 shadow-xl shrink-0 bg-black/60">
                <img
                  src="https://admin.rrresports.com/uploads/19092025021919965.png"
                  alt="Ludu Match"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-center text-white">
                <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors text-left uppercase tracking-wide">
                  LUDU MATCH
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-amber-400 text-left mt-0.5">
                  1 Match Scheduled • 1v1 Quick Ludo King Arena
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. ACTIVE TOURNAMENTS LIST (Clean & Direct) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#00A3FF]" />
            <span>Active Tournaments</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

        {/* 3 Featured Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.slice(0, 3).map((tourney) => (
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1422] hover:bg-[#161E30] text-gray-200 font-bold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all shadow-md"
          >
            <span>সবগুলো {tournaments.length}টি টুর্নামেন্ট দেখুন</span>
            <ArrowRight className="w-4 h-4 text-[#00A3FF]" />
          </Link>
        </div>
      </section>

      {/* 6. SEE LIVE MATCH HERE (Exact RRR Esports Pattern) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span>See Live Match Here</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

        {/* Live Stream / Match Link Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0C101A] border border-[#1E2536] text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600/20 text-[#FF2438] border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Official Live Stream</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-white">
            Free Fire Daily Room Matches Live Cast
          </h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            আমাদের অফিশিয়াল চ্যানেলে প্রতি ম্যাচের লাইভ কাস্ট ও রুম ব্রডকাস্ট দেখা যায়।
          </p>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>Watch Live on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 7. APP & SUPPORT LINKS (Exact RRR Esports 2 Buttons) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-4">
          <a
            href="/assets/app_link.png"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F1424] hover:bg-[#161D32] border border-[#1E2536] hover:border-[#00A3FF]/50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <Smartphone className="w-5 h-5 text-[#00A3FF]" />
            <div className="text-left">
              <span className="text-[10px] text-gray-400 block font-normal leading-tight">Android Player App</span>
              <span className="font-black text-sm">Download App</span>
            </div>
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0088CC]/20 hover:bg-[#0088CC]/30 border border-[#0088CC]/40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5 text-[#00A3FF]" />
            <div className="text-left">
              <span className="text-[10px] text-blue-300 block font-normal leading-tight">24/7 Player Support</span>
              <span className="font-black text-sm">Telegram Support</span>
            </div>
          </a>
        </div>
      </div>

      {/* 8. TURNKEY DEMO & BUYER CALLOUT (Clean, Direct, 1-Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C101A] via-[#101626] to-[#0A0E18] border-2 border-[#00A3FF]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Official Turnkey Esports Solution</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              এই ধরনের ওয়েবসাইট নিজের নামে কিনতে চান?
            </h3>
            <p className="text-xs text-gray-300">
              রেডি ফ্রি ফায়ার টুর্নামেন্ট ওয়েবসাইট + অটো বিকাশ/নগদ পেমেন্ট + ফুল অ্যাডমিন প্যানেল।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full md:w-auto">
            <Link
              href="/pricing"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>প্যাকেজ ও প্রাইসিং (৳৩৫,০০০)</span>
            </Link>

            <Link
              href="/admin"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-extrabold text-xs border border-[#1E2536] hover:border-[#00A3FF]/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>এডমিন ডেমো</span>
            </Link>

            <a
              href="https://wa.me/8801700000000?text=Hello%20Team%20Sifr,%20I%20want%20to%20buy%20an%20esports%20tournament%20website%20like%20BD%20Battle%20Pro."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
              <span>WhatsApp অর্ডার</span>
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
