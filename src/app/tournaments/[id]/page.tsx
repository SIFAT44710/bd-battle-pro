'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { formatMatchTime } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import RoomVault from '@/components/tournaments/RoomVault';
import ScoreboardVerification from '@/components/tournaments/ScoreboardVerification';
import SlotGrid from '@/components/tournaments/SlotGrid';
import JoinModal from '@/components/tournaments/JoinModal';
import { BDT } from '@/components/common/BDT';
import { MatchResult } from '@/types/tournament';
import {
  Trophy,
  Flame,
  Clock,
  MapPin,
  CheckCircle,
  KeyRound,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Crown,
  Medal,
  Award,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { tournaments, isRegistered, getUserSlot, matchResults } = useDemo();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const tournament = tournaments.find((t) => t.id === id);

  // Synchronous subscription hook
  const countdown = useCountdown(tournament ? tournament.match_time : '2026-11-04T20:00:00Z');

  if (!tournament) {
    notFound();
  }

  const joined = isRegistered(tournament.id);
  const userSlot = getUserSlot(tournament.id);
  const isFull = tournament.current_slots >= tournament.max_slots;
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';

  // Get completed match results
  const tournamentResults = matchResults
    .filter((r) => r.tournament_id === tournament.id)
    .sort((a, b) => a.rank - b.rank);

  const fallbackResults: MatchResult[] = [
    {
      id: `${tournament.id}-res-1`,
      tournament_id: tournament.id,
      rank: 1,
      ign: '亗TANVIR亗 (TEAM VORTEX)',
      kills: 14,
      prize_amount: (tournament.prize_distribution.first || 1000) + 14 * (tournament.per_kill || 15),
      published_at: tournament.match_time,
    },
    {
      id: `${tournament.id}-res-2`,
      tournament_id: tournament.id,
      rank: 2,
      ign: 'RAKIB_OP (RED EAGLES)',
      kills: 8,
      prize_amount: (tournament.prize_distribution.second || 500) + 8 * (tournament.per_kill || 15),
      published_at: tournament.match_time,
    },
    {
      id: `${tournament.id}-res-3`,
      tournament_id: tournament.id,
      rank: 3,
      ign: 'DHAKA KINGS',
      kills: 5,
      prize_amount: (tournament.prize_distribution.third || 250) + 5 * (tournament.per_kill || 15),
      published_at: tournament.match_time,
    },
  ];

  const podiumResults = tournamentResults.length >= 3 ? tournamentResults : fallbackResults;
  const firstPlace = podiumResults.find((r) => r.rank === 1) || podiumResults[0];
  const secondPlace = podiumResults.find((r) => r.rank === 2) || podiumResults[1];
  const thirdPlace = podiumResults.find((r) => r.rank === 3) || podiumResults[2];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-gray-800 shadow-2xl">
        <div
          className="h-64 sm:h-80 w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              tournament.banner_url ||
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
            })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/70 to-transparent" />
        </div>

        {/* Floating Content over Banner */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30">
                {tournament.match_type}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-900/90 text-white border border-gray-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {tournament.map}
              </span>
              {isLive ? (
                <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-[#FF2438] text-white animate-pulse shadow-md shadow-red-600/50">
                  LIVE NOW
                </span>
              ) : isCompleted ? (
                <span className="px-3 py-1 rounded-md text-xs font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-md shadow-emerald-950/40">
                  <CheckCircle className="w-3.5 h-3.5" />
                  COMPLETED • RESULTS PUBLISHED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-900/90 text-gray-300 border border-gray-700">
                  {countdown.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">{tournament.title}</h1>

            <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Match Time: {formatMatchTime(tournament.match_time)} (BST)</span>
            </p>
          </div>

          {/* Join / Status CTA on Banner */}
          <div>
            {joined ? (
              <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-sky-600/30">
                <CheckCircle className="w-5 h-5" />
                <span>You are Registered (Slot #{userSlot})</span>
              </div>
            ) : isCompleted ? (
              <div className="px-5 py-3 rounded-2xl bg-slate-900/90 text-emerald-400 font-black text-sm border border-emerald-500/30 flex items-center gap-2 shadow-lg">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Final Standings Settled</span>
              </div>
            ) : isFull ? (
              <div className="px-5 py-3 rounded-2xl bg-gray-800 text-gray-400 font-bold text-sm border border-gray-700">
                All Slots Full ({tournament.max_slots}/{tournament.max_slots})
              </div>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/40 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <Crown className="w-5 h-5 text-amber-300" />
                <span>
                  Join Tournament (Fee: <BDT amount={tournament.entry_fee} />)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPLETED MATCH: TOP 3 WINNERS PODIUM */}
      {isCompleted && (
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#101726] via-[#0D121F] to-[#0A0E17] border-2 border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Trophy className="w-3.5 h-3.5" />
                <span>Official Champions Podium</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Top 3 Winners & Payout Distribution
              </h2>
            </div>
            <div className="text-xs text-gray-400 bg-slate-950 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Cheat Referee Audited • Payouts Transferred</span>
            </div>
          </div>

          {/* 3D-Style Winner Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
            {/* 2nd Place (Silver - Left) */}
            {secondPlace && (
              <div className="order-2 md:order-1 p-5 rounded-2xl bg-gradient-to-t from-slate-900 to-slate-800/80 border border-slate-600/50 text-center space-y-3 relative shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/80 border-2 border-slate-300 flex items-center justify-center shadow-lg">
                  <Medal className="w-6 h-6 text-slate-200" />
                </div>
                <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-700 text-slate-200">
                  2nd Runner Up
                </div>
                <h4 className="text-base font-black text-white truncate">{secondPlace.ign}</h4>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>{secondPlace.kills} Kills</span>
                </div>
                <div className="pt-2 border-t border-slate-700/60">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Prize Paid</p>
                  <p className="text-lg font-black text-white font-mono mt-0.5">
                    <BDT amount={secondPlace.prize_amount} />
                  </p>
                </div>
              </div>
            )}

            {/* 1st Place (Gold - Center, Elevated) */}
            {firstPlace && (
              <div className="order-1 md:order-2 p-6 sm:p-7 rounded-2xl bg-gradient-to-t from-amber-950/40 via-slate-900 to-amber-900/30 border-2 border-amber-500 shadow-2xl shadow-amber-950/60 text-center space-y-3.5 relative md:-translate-y-3">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>BOOYAH CHAMPION</span>
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/30">
                  <Trophy className="w-8 h-8 text-slate-950 fill-slate-950" />
                </div>
                <h4 className="text-lg font-black text-amber-200 truncate">{firstPlace.ign}</h4>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-bold bg-amber-950/40 py-1 px-3 rounded-full border border-amber-500/30 w-fit mx-auto">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>{firstPlace.kills} Kills (Kill Bounty Winner)</span>
                </div>
                <div className="pt-2 border-t border-amber-500/40">
                  <p className="text-[11px] text-amber-400 uppercase font-black">Total Payout Settled</p>
                  <p className="text-2xl font-black text-white font-mono mt-0.5">
                    <BDT amount={firstPlace.prize_amount} />
                  </p>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze - Right) */}
            {thirdPlace && (
              <div className="order-3 p-5 rounded-2xl bg-gradient-to-t from-slate-900 to-amber-950/20 border border-amber-800/50 text-center space-y-3 relative shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-900/70 border-2 border-amber-600 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800/50">
                  3rd Runner Up
                </div>
                <h4 className="text-base font-black text-white truncate">{thirdPlace.ign}</h4>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-200 font-bold">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>{thirdPlace.kills} Kills</span>
                </div>
                <div className="pt-2 border-t border-amber-900/40">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Prize Paid</p>
                  <p className="text-lg font-black text-white font-mono mt-0.5">
                    <BDT amount={thirdPlace.prize_amount} />
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Grid: Details Left, Room Vault & OCR Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Prize Pool Breakdown Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Prize Distribution & Financial Structure
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-full" />
                <p className="text-[10px] text-amber-400 uppercase font-black flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  1st Place (Booyah)
                </p>
                <p className="text-lg font-black text-white mt-1">
                  <BDT amount={tournament.prize_distribution.first || 0} />
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-bold">2nd Place</p>
                <p className="text-lg font-black text-white mt-1">
                  <BDT amount={tournament.prize_distribution.second || 0} />
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-bold">3rd Place</p>
                <p className="text-lg font-black text-white mt-1">
                  <BDT amount={tournament.prize_distribution.third || 0} />
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40">
                <p className="text-[10px] text-red-400 uppercase font-black flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 text-red-400" />
                  Per Kill
                </p>
                <p className="text-lg font-black text-white mt-1 font-mono">
                  {tournament.per_kill > 0 ? <BDT amount={tournament.per_kill} /> : 'None'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/80">
              <span>Total Guaranteed Pool:</span>
              <span className="font-mono font-black text-base text-[#00A3FF]">
                <BDT amount={tournament.prize_pool} />
              </span>
            </div>
          </div>

          {/* Time-Gated Room Vault Component */}
          <div className="space-y-2" id="room-vault">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#FF2438]" />
              Custom Room Vault (15-Minute Security Gate)
            </h3>
            <RoomVault tournament={tournament} />
          </div>

          {/* AI Scoreboard OCR Verification Widget */}
          <div className="space-y-2">
            <ScoreboardVerification tournament={tournament} />
          </div>

          {/* Slot Grid Component */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800">
            <SlotGrid tournamentId={tournament.id} maxSlots={tournament.max_slots} />
          </div>

          {/* Rules & Anti-Cheat */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Tournament Rules & Fair Play Policy
            </h3>

            <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2 whitespace-pre-line bg-gray-950/70 p-4 rounded-xl border border-gray-800 font-sans">
              {tournament.rules ||
                `1. Mobile devices only. Any player found on emulator or modified APK will be disqualified and banned.
2. In-Game Name (IGN) must match your BD Battle Pro registered profile.
3. Teaming up with opponents is strictly prohibited.
4. Room ID & Password unlock 15 minutes before match start.
5. In case of tie, kills will be used as first tiebreaker.`}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Match supervised by BD Battle Pro Anti-Cheat referee team. Organizers reserve the
                right to audit post-match scorecards.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Info Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-5 sticky top-20">
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Match Overview
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Game</span>
                <span className="font-bold text-white">Garena Free Fire</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Mode</span>
                <span className="font-bold text-white">{tournament.match_type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Map</span>
                <span className="font-bold text-white">{tournament.map}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Entry Fee</span>
                <span className="font-bold text-white font-mono">
                  {tournament.entry_fee === 0 ? 'FREE' : <BDT amount={tournament.entry_fee} />}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Prize Pool</span>
                <span className="font-bold text-[#00A3FF] font-mono">
                  <BDT amount={tournament.prize_pool} />
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Per Kill Bounty</span>
                <span className="font-bold text-red-400 font-mono">
                  {tournament.per_kill > 0 ? <BDT amount={tournament.per_kill} /> : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Available Slots</span>
                <span className="font-bold text-white">
                  {tournament.max_slots - tournament.current_slots} of {tournament.max_slots} Free
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              {joined ? (
                <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-500/40 text-center text-xs text-sky-400 font-bold">
                  ✓ Registered in Slot #{userSlot}
                </div>
              ) : isCompleted ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-center text-xs text-emerald-400 font-bold">
                  ✓ Match Completed • Results Published
                </div>
              ) : isFull ? (
                <div className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-center text-xs text-gray-400 font-bold">
                  No Available Slots
                </div>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>
                    Join Match (<BDT amount={tournament.entry_fee} />)
                  </span>
                </button>
              )}
            </div>

            {/* Current Active Persona Tip */}
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p className="font-bold text-gray-300">Testing Tip:</p>
              <p>
                Switch to <strong className="text-red-400">Rakib</strong> via the top banner
                to test registering for an open match, or switch to{' '}
                <strong className="text-sky-400">Tanvir</strong> to test room unlock & AI OCR!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinModal tournament={tournament} onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}