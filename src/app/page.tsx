'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import JoinModal from '@/components/tournaments/JoinModal';
import { Tournament } from '@/types/tournament';
import { formatBDT } from '@/lib/utils';
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
} from 'lucide-react';

export default function HomePage() {
  const { tournaments, matchResults } = useDemo();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Group tournaments
  const liveTournaments = tournaments.filter((t) => t.status === 'live');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');

  // Spotlight tournament: the one starting soonest (starts in ~10 mins!)
  const spotlightTournament = upcomingTournaments[0] || tournaments[0];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-gray-800/80">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-semibold text-gray-300 shadow-lg shadow-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">1 MATCH LIVE</span>
              <span className="text-gray-500">•</span>
              <span>{upcomingTournaments.length} Upcoming Tournaments Today</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              BANGLADESH&apos;S PREMIER <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                FREE FIRE ESPORTS
              </span>{' '}
              PLATFORM
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-medium">
              Join competitive Free Fire squad, solo, and clash squad tournaments. Experience
              time-gated room vaults, guaranteed slot seating, and transparent BDT (৳) prize
              distributions with zero manual chaos.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/tournaments"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>Explore Tournaments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/admin"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-200 font-bold text-sm border border-gray-700 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Organizer Dashboard</span>
              </Link>
            </div>

            {/* Fast Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-gray-800/80 text-left">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-gray-800/80">
                <p className="text-xl sm:text-2xl font-black text-white font-mono">৳8,900+</p>
                <p className="text-xs text-gray-400 font-medium">Prize Pools Today</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-gray-800/80">
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">15 Mins</p>
                <p className="text-xs text-gray-400 font-medium">Room Vault Timer</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-gray-800/80">
                <p className="text-xl sm:text-2xl font-black text-orange-400 font-mono">48 Slots</p>
                <p className="text-xs text-gray-400 font-medium">Anti-Oversubscribe</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-gray-800/80">
                <p className="text-xl sm:text-2xl font-black text-teal-400 font-mono">100%</p>
                <p className="text-xs text-gray-400 font-medium">Verified Free Fire IGN</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPOTLIGHT TOURNAMENT (Starts in 10 minutes - Room Vault Ready!) */}
      {spotlightTournament && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-black bg-emerald-500 text-slate-950 uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Spotlight Match
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Room Vault Opens Soon
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {spotlightTournament.title}
                </h2>

                <p className="text-sm text-gray-300">
                  Custom Free Fire {spotlightTournament.match_type} on {spotlightTournament.map}.
                  Entry fee {formatBDT(spotlightTournament.entry_fee)} with{' '}
                  <strong className="text-emerald-400">
                    {formatBDT(spotlightTournament.prize_pool)}
                  </strong>{' '}
                  total prize pool and {formatBDT(spotlightTournament.per_kill)} per kill bonus.
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 pt-1">
                  <span>
                    Format:{' '}
                    <strong className="text-white">{spotlightTournament.match_type}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Slots:{' '}
                    <strong className="text-white">
                      {spotlightTournament.current_slots}/{spotlightTournament.max_slots} Filled
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <Link
                  href={`/tournaments/${spotlightTournament.id}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-gray-700 text-center transition-colors"
                >
                  View Details & Slots
                </Link>
                <Link
                  href={`/tournaments/${spotlightTournament.id}#room-vault`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm text-center shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
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
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Swords className="w-4 h-4" />
              <span>Competitive Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Active & Upcoming Tournaments
            </h2>
          </div>

          <Link
            href="/tournaments"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
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
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Live Matches In Progress</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTournaments.map((tourney) => (
              <TournamentCard key={tourney.id} tournament={tourney} />
            ))}
          </div>
        </section>
      )}

      {/* 5. RECENT RESULTS & HALL OF FAME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Hall of Fame</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Recent Match Results & Winners
            </h2>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-xs text-gray-400 font-bold uppercase">
            <span>Tournament #12: Grand Nexterra Squad Championship</span>
            <span className="text-emerald-400">Prizes Distributed: ৳2,760</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchResults.slice(0, 3).map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  res.rank === 1
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/20'
                    : res.rank === 2
                    ? 'bg-slate-800/60 border-gray-600'
                    : 'bg-slate-900 border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg font-black text-sm flex items-center justify-center ${
                      res.rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : res.rank === 2
                        ? 'bg-gray-400 text-slate-950'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    #{res.rank}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-white">{res.ign}</p>
                    <p className="text-xs text-orange-400 font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {res.kills} Kills
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Prize Won</p>
                  <p className="font-mono font-black text-sm text-emerald-400">
                    {formatBDT(res.prize_amount)}
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
            How BD Battle Pro eliminates traditional tournament fraud, password leaks, and payment
            delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">Time-Gated Room Vault</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No more sharing room passwords in open WhatsApp groups. Credentials are encrypted and
              unlocked only 15 minutes before the match strictly for registered participants.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">Atomic Slot Allocation</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every player receives a designated slot number (1 to 48) backed by PostgreSQL
              transactions. Prevents double-booking and slot hijacking in custom rooms.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">IGN-First Identity</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Matches Free Fire post-game scoreboards directly using In-Game Names. Ready for
              automated kill-tallying and instant prize ledger distribution.
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
