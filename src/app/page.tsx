'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import JoinModal from '@/components/tournaments/JoinModal';
import { Tournament } from '@/types/tournament';
import {
  User,
  ShieldCheck,
  Volume2,
  Tv,
  MessageCircle,
  PhoneCall,
  Send,
  ExternalLink,
  Flame,
  Crown,
  Trophy,
  ArrowRight,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export default function HomePage() {
  const { tournaments } = useDemo();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Quick WhatsApp Message State
  const [senderName, setSenderName] = useState('');
  const [guildName, setGuildName] = useState('');
  const [customMsg, setCustomMsg] = useState('');

  // Sifat's real contact number
  const phoneNumber = '01791357521';
  const phoneIntl = '8801791357521';

  // Match counts for category cards
  const freeCount = tournaments.filter((t) => t.entry_fee === 0).length;
  const classicCount = tournaments.filter((t) => t.match_type === 'Squad' || t.match_type === 'Solo').length;
  const csCount = tournaments.filter((t) => t.match_type === 'Clash Squad').length;
  const loneWolfCount = tournaments.filter((t) => t.match_type === 'Duo').length;

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `আসসালামু আলাইকুম সিফাত ভাই! 
আমার নাম: ${senderName || 'নাম দেওয়া হয়নি'}
গিল্ড/ব্র্যান্ড: ${guildName || 'নতুন অর্গানাইজার'}
মেসেজ: ${customMsg || 'আমি আপনার Free Fire টুর্নামেন্ট ওয়েবসাইট ও অ্যাপ কিনতে যোগাযোগ করছি।'}`;

    window.open(`https://wa.me/${phoneIntl}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. TOP NOTICE / TICKER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-red-950/70 via-[#101524] to-blue-950/70 border border-[#1E2536] flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FF2438]/20 text-[#FF2438] border border-[#FF2438]/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-200 truncate">
              📢 <strong className="text-white">BD BATTLE PRO</strong> — গেরিনা ফ্রি ফায়ার ডেইলি টুর্নামেন্ট প্ল্যাটফর্ম। ১৫ মিনিট আগে অটোমেটিক রুম ভল্ট!
            </p>
          </div>
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151D2F] hover:bg-[#1E2A44] text-[#00A3FF] hover:text-white text-xs font-bold shrink-0 transition-colors border border-[#00A3FF]/30"
          >
            <span>ইউজার প্যানেল</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. HERO SECTION — GARENA FREE FIRE DAILY TOURNAMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0A0E17] border border-[#1E2536] p-5 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/15 text-[#FF2438] border border-red-500/30">
                <Crown className="w-3 h-3 text-amber-400" />
                Official Esports Platform Showcase
              </span>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                গেরিনা ফ্রি ফায়ার <br />
                <span className="bg-gradient-to-r from-white via-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
                  ডেইলি টুর্নামেন্ট
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 font-medium">
                ডেইলি কাস্টম ম্যাচ • ১৫ মিনিট আগে অটোমেটিক রুম ভল্ট • ইনস্ট্যান্ট বিকাশ ও নগদ পেআউট
              </p>

              {/* User Requested 2 Primary Action Buttons: ইউজার প্যানেল দেখুন & অ্যাডমিন প্যানেল দেখুন */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link
                  href="/account"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <User className="w-4 h-4" />
                  <span>ইউজার প্যানেল দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/admin"
                  className="px-5 py-3.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-gray-200 font-extrabold text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
                  <span>অ্যাডমিন প্যানেল দেখুন</span>
                </Link>
              </div>
            </div>

            {/* Official Logo Banner Badge */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-[#07090F] border-2 border-[#1E2536] p-2 flex items-center justify-center shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="BD Battle Pro Logo"
                  width={150}
                  height={150}
                  className="object-contain drop-shadow-[0_0_12px_rgba(255,36,56,0.6)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION DIVIDER: FREE FIRE MATCHES (RRR Esports Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF2438]" />
            <span>Free Fire Matches</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

        {/* 4 Category Cards (Direct RRR Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: FREE MATCH */}
          <Link
            href="/tournaments?fee=free"
            className="relative block w-full rounded-xl overflow-hidden border border-[#1E2536] hover:border-emerald-500/60 transition-all duration-300 hover:scale-[1.01] shadow-xl group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url(https://admin.rrresports.com/uploads/19092025021654654_banner.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />

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

      {/* 4. SIFAT'S OFFICIAL CONTACT & DIRECT ORDER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0F1424] via-[#0C101A] to-[#080B12] border-2 border-[#FF2438]/40 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2536] pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-red-500/15 text-[#FF2438] border border-red-500/30">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>সরাসরি যোগাযোগ ও অর্ডার</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
                টুর্নামেন্ট ওয়েবসাইট ও অ্যাপ বানাতে যোগাযোগ করুন
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                নিজের গিল্ড বা ব্র্যান্ডের নামে রেডিমেড প্ল্যাটফর্ম পেতে সরাসরি কল বা হোয়াটসঅ্যাপে মেসেজ দিন।
              </p>
            </div>

            {/* Direct Call & WhatsApp Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={`tel:${phoneNumber}`}
                className="px-4 py-2.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-white font-black text-xs sm:text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#00A3FF]" />
                <span>কল করুন: {phoneNumber}</span>
              </a>

              <a
                href={`https://wa.me/${phoneIntl}?text=${encodeURIComponent('আসসালামু আলাইকুম সিফাত ভাই! আমি Free Fire টুর্নামেন্ট ওয়েবসাইট সম্পর্কে কথা বলতে চাই।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>WhatsApp: {phoneNumber}</span>
              </a>
            </div>
          </div>

          {/* Quick Message Box to WhatsApp */}
          <form onSubmit={handleSendWhatsApp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">আপনার নাম</label>
              <input
                type="text"
                placeholder="যেমন: তানভীর আহমেদ"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FF2438]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">গিল্ড বা অর্গানাইজেশনের নাম</label>
              <input
                type="text"
                placeholder="যেমন: BBP Esports"
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FF2438]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">আপনার মেসেজ / রিকোয়ারমেন্ট</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: আমি ৳৩৫,০০০ প্যাকেজটি নিতে চাই..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FF2438]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পাঠান</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 5. ACTIVE TOURNAMENTS LIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-[#1E2536]" />
          <h3 className="text-xl sm:text-2xl text-center font-black mx-4 text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Active Tournaments</span>
          </h3>
          <hr className="flex-grow border-t border-[#1E2536]" />
        </div>

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
