'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import JoinModal from '@/components/tournaments/JoinModal';
import EarningsCalculator from '@/components/home/EarningsCalculator';
import { BDT } from '@/components/common/BDT';
import { Tournament } from '@/types/tournament';
import { formatMatchTime } from '@/lib/utils';
import {
  Swords,
  Trophy,
  Flame,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Users,
  Target,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { tournaments, matchResults } = useDemo();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Group tournaments
  const liveTournaments = tournaments.filter((t) => t.status === 'live');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');

  // Spotlight tournament: starts soonest
  const spotlightTournament = upcomingTournaments[0] || tournaments[0];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION WITH OFFICIAL BBP LOGO */}
      <section className="relative pt-8 pb-16 overflow-hidden border-b border-[#1E2536]">
        {/* Glow backdrop circles based on logo colors (Red & Blue) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-5 w-[450px] h-[350px] bg-[#00A3FF]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-5 w-[400px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Center Logo Showcase */}
            <div className="relative inline-block mx-auto mb-2 group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#FF2438] via-transparent to-[#00A3FF] rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition duration-1000"></div>
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#090C14] border-2 border-[#1E2536] p-2 flex items-center justify-center shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="BD Battle Pro Official Logo"
                  width={112}
                  height={112}
                  className="object-contain drop-shadow-[0_0_20px_rgba(255,36,56,0.65)] hover:scale-105 transition-transform"
                  priority
                />
              </div>
            </div>

            {/* Live Indicator Pill */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1320] border border-[#1E2536] text-xs font-bold text-gray-300 shadow-xl shadow-red-950/20">
                <span className="w-2 h-2 rounded-full bg-[#FF2438] animate-ping" />
                <span className="text-[#FF2438] font-black uppercase tracking-wider">1 MATCH LIVE</span>
                <span className="text-gray-600">•</span>
                <span className="text-[#00A3FF]">{upcomingTournaments.length} Upcoming Tournaments Today</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] uppercase">
              BANGLADESH&apos;S PREMIER <br />
              <span className="bg-gradient-to-r from-white via-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
                FREE FIRE ESPORTS
              </span>{' '}
              ARENA
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-medium max-w-2xl mx-auto">
              Compete in high-stakes Free Fire tournaments. Powered by time-gated room vaults, guaranteed slot reservations, and instant transparent BDT (৳) prize distributions.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/tournaments"
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-sm tracking-wide shadow-2xl shadow-red-950/80 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 border border-red-400/40"
              >
                <Swords className="w-4 h-4" />
                <span>Browse Tournaments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/admin"
                className="px-7 py-4 rounded-xl bg-[#0F1422] hover:bg-[#161D30] text-gray-200 font-extrabold text-sm border border-[#1E2536] hover:border-[#00A3FF]/50 transition-all flex items-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
                <span>Organizer Headquarters</span>
              </Link>
            </div>

            {/* Fast Stats Row with BBP Dual-Tone Accents */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#1E2536] text-left">
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E2536]">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center gap-1">
                  <Zap className="w-5 h-5 text-[#FF2438]" />
                  <BDT amount={8900} suffix="+" />
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Prize Pool Today</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E2536]">
                <p className="text-2xl sm:text-3xl font-black text-[#00A3FF] font-mono flex items-center gap-1">
                  <KeyRound className="w-5 h-5 text-[#00A3FF]" />
                  15 Mins
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Room Vault Unlock</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E2536]">
                <p className="text-2xl sm:text-3xl font-black text-[#FF2438] font-mono flex items-center gap-1">
                  <Users className="w-5 h-5 text-[#FF2438]" />
                  48 Slots
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Anti-Oversubscribe</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E2536]">
                <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono flex items-center gap-1">
                  <Crown className="w-5 h-5 text-amber-400" />
                  100%
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Verified Gamer IGN</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPOTLIGHT TOURNAMENT (Starts in 10 minutes - Room Vault Ready!) */}
      {spotlightTournament && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/30 via-[#0B0E17] to-blue-950/30 border-2 border-red-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 blur-[110px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-black bg-gradient-to-r from-[#FF2438] to-red-600 text-white uppercase flex items-center gap-1.5 shadow-md shadow-red-950/60">
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    Spotlight Match
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40">
                    Vault Unlocks in 10m
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {spotlightTournament.title}
                </h2>

                <p className="text-sm text-gray-300">
                  Custom Free Fire {spotlightTournament.match_type} on {spotlightTournament.map}.
                  Entry fee <BDT amount={spotlightTournament.entry_fee} /> with{' '}
                  <strong className="text-[#FF2438]">
                    <BDT amount={spotlightTournament.prize_pool} />
                  </strong>{' '}
                  total prize pool and <BDT amount={spotlightTournament.per_kill} /> per kill reward.
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 pt-1">
                  <span>
                    Format: <strong className="text-white">{spotlightTournament.match_type}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Slots:{' '}
                    <strong className="text-[#00A3FF]">
                      {spotlightTournament.current_slots}/{spotlightTournament.max_slots} Filled
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <Link
                  href={`/tournaments/${spotlightTournament.id}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#121622] hover:bg-[#182030] text-white font-bold text-sm border border-[#1E2536] text-center transition-colors"
                >
                  View Details & Slots
                </Link>
                <Link
                  href={`/tournaments/${spotlightTournament.id}#room-vault`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#00A3FF] hover:brightness-110 text-white font-black text-sm text-center shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Access Room Vault</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. UPCOMING TOURNAMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF2438] font-black text-xs uppercase tracking-wider">
              <Swords className="w-4 h-4" />
              <span>Competitive Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Active & Upcoming Tournaments
            </h2>
          </div>

          <Link
            href="/tournaments"
            className="text-xs font-black text-[#00A3FF] hover:text-blue-300 flex items-center gap-1 group"
          >
            <span>View All Tournaments ({tournaments.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTournaments.slice(0, 3).map((tourney) => (
            <TournamentCard
              key={tourney.id}
              tournament={tourney}
              onJoinClick={(t) => setSelectedTournament(t)}
            />
          ))}
        </div>
      </section>

      {/* 4. LIVE MATCHES (IF ANY) */}
      {liveTournaments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF2438] animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Live Matches In Progress</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTournaments.map((tourney) => (
              <TournamentCard key={tourney.id} tournament={tourney} />
            ))}
          </div>
        </section>
      )}

      {/* 5. INTERACTIVE KILL & BOOYAH EARNINGS CALCULATOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EarningsCalculator />
      </div>

      {/* 6. RECENT RESULTS & HALL OF FAME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#00A3FF] font-black text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Hall of Fame</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Recent Match Results & Winners
            </h2>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0D15] border border-[#1E2536] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2536] pb-3 text-xs text-gray-400 font-bold uppercase">
            <span>Tournament #12: Grand Nexterra Squad Championship</span>
            <span className="text-[#FF2438] font-black flex items-center gap-1">
              Prizes Distributed: <BDT amount={2760} />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchResults.slice(0, 3).map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  res.rank === 1
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/30'
                    : res.rank === 2
                    ? 'bg-[#121622] border-gray-600'
                    : 'bg-[#0F131C] border-[#1E2536]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg font-black text-sm flex items-center justify-center ${
                      res.rank === 1
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md'
                        : res.rank === 2
                        ? 'bg-gray-300 text-slate-950'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    #{res.rank}
                  </div>
                  <div>
                    <p className="font-black text-sm text-white flex items-center gap-1.5">
                      {res.ign}
                      {res.rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                    </p>
                    <p className="text-xs text-[#00A3FF] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#FF2438]" />
                      {res.kills} Kills
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Prize Won</p>
                  <p className="font-mono font-black text-sm text-[#FF2438]">
                    <BDT amount={res.prize_amount} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PLATFORM PILLARS & ANTI-SCAM ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Built for Bangladeshi Esports Organizers
          </h2>
          <p className="text-sm text-gray-400">
            How BD Battle Pro eliminates traditional tournament fraud, password leaks, and payment delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3 border-t-2 border-t-[#FF2438]">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF2438]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Time-Gated Room Vault</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No more sharing room passwords in open WhatsApp groups. Credentials are encrypted and unlocked strictly 15 minutes before match launch only for registered participants.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3 border-t-2 border-t-[#00A3FF]">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#00A3FF]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Atomic Slot Allocation</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every player receives a designated slot number (1 to 48) backed by PostgreSQL atomic transactions. Completely prevents double-booking and slot hijacking.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3 border-t-2 border-t-amber-400">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">IGN-First Identity</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Matches Free Fire post-game scoreboards directly using In-Game Names. Ready for automated kill-tallying and instant prize ledger distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Join Modal if triggered */}
      {selectedTournament && (
        <JoinModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
}
