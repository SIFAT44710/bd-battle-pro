'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime, getMatchCountdown, CountdownState } from '@/lib/utils';
import {
  Trophy,
  Swords,
  Clock,
  KeyRound,
  MapPin,
  ChevronRight,
  Crown,
} from 'lucide-react';

export default function MyTournamentsPage() {
  const { currentUser, participants, tournaments } = useDemo();
  const [countdowns, setCountdowns] = useState<Record<string, CountdownState>>({});

  useEffect(() => {
    const updateAll = () => {
      const now = Date.now();
      const updated: Record<string, CountdownState> = {};
      tournaments.forEach((t) => {
        updated[t.id] = getMatchCountdown(t.match_time, now);
      });
      setCountdowns(updated);
    };

    updateAll();
    const interval = setInterval(updateAll, 1000);
    return () => clearInterval(interval);
  }, [tournaments]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-400">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Login Required</h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
          Please login or select a demo player account from the top banner to view your joined matches.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Find all participants for this user
  const userParticipants = participants.filter((p) => p.user_id === currentUser.id);

  // Match with tournament data
  const joinedMatches = userParticipants
    .map((p) => {
      const tourney = tournaments.find((t) => t.id === p.tournament_id);
      return tourney ? { participant: p, tournament: tourney } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#00A3FF] font-bold text-xs uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Player Tournament Registry</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">My Registered Tournaments</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Track your active Free Fire tournament registrations, designated slot numbers, and time-gated room credentials.
        </p>
      </div>

      {joinedMatches.length > 0 ? (
        <div className="space-y-4">
          {joinedMatches.map(({ participant, tournament }) => {
            const countdown = countdowns[tournament.id];
            const isLive = tournament.status === 'live';
            const isCompleted = tournament.status === 'completed';

            return (
              <div
                key={participant.id}
                className="p-5 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/30">
                      Slot #{participant.slot_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-gray-800 text-white">
                      {tournament.match_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-900 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {tournament.map}
                    </span>
                    {isLive ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#FF2438] text-white animate-pulse">
                        LIVE NOW
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-gray-800 text-gray-300">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-900 text-gray-300">
                        {countdown ? countdown.label : 'Upcoming'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white">{tournament.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatMatchTime(tournament.match_time)}
                    </span>
                    <span>•</span>
                    <span>
                      Prize Pool: <strong className="text-[#00A3FF]">{formatBDT(tournament.prize_pool)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Per Kill: <strong className="text-red-400">{formatBDT(tournament.per_kill)}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <Link
                    href={`/tournaments/${tournament.id}#room-vault`}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>View Room Vault</span>
                  </Link>

                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                    title="Match Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-gray-800 space-y-4">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
            <Swords className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">No Tournaments Joined Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              You haven&apos;t registered for any active Free Fire matches yet. Pick an upcoming tournament and grab your slot!
            </p>
          </div>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Browse Upcoming Tournaments</span>
          </Link>
        </div>
      )}
    </div>
  );
}
