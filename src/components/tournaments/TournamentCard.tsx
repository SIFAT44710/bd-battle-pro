'use client';

import React from 'react';
import Link from 'next/link';
import { Tournament } from '@/types/tournament';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import { useDemo } from '@/context/DemoContext';
import { useCountdown } from '@/hooks/useCountdown';
import {
  Trophy,
  Flame,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle,
  KeyRound,
} from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onJoinClick?: (tournament: Tournament) => void;
}

export default function TournamentCard({ tournament, onJoinClick }: TournamentCardProps) {
  const { isRegistered, getUserSlot } = useDemo();
  const joined = isRegistered(tournament.id);
  const userSlot = getUserSlot(tournament.id);

  // Synchronous subscription hook using useSyncExternalStore
  const countdown = useCountdown(tournament.match_time);

  const fillPercentage = Math.min(
    100,
    Math.round((tournament.current_slots / tournament.max_slots) * 100)
  );

  const isFull = tournament.current_slots >= tournament.max_slots;
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {/* Top Banner / Tags */}
      <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
        {/* Background Image / Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${
              tournament.banner_url ||
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent" />

        {/* Status Badges Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-900/90 text-white border border-gray-700/80 backdrop-blur-md">
              {tournament.match_type}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-900/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {tournament.map}
            </span>
          </div>

          <div>
            {isLive ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-red-600 text-white flex items-center gap-1 animate-pulse shadow-lg shadow-red-600/40">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                LIVE NOW
              </span>
            ) : isCompleted ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-800 text-gray-300 border border-gray-700">
                COMPLETED
              </span>
            ) : countdown.isWithin15m ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-orange-600 text-white flex items-center gap-1 animate-pulse shadow-lg shadow-orange-600/40">
                <KeyRound className="w-3 h-3" />
                ROOM OPEN
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-900/90 text-gray-300 border border-gray-700/80 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {countdown.label}
              </span>
            )}
          </div>
        </div>

        {/* Registered Indicator */}
        {joined && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
              <CheckCircle className="w-3.5 h-3.5" />
              Joined (Slot #{userSlot})
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {tournament.title}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Match Time: {formatMatchTime(tournament.match_time)}</span>
          </div>
        </div>

        {/* Prize Pool & Entry Fee Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-gray-800 text-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Prize Pool</p>
            <p className="text-sm sm:text-base font-black text-emerald-400 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              {formatBDT(tournament.prize_pool)}
            </p>
          </div>

          <div className="border-x border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Entry Fee</p>
            <p className="text-sm sm:text-base font-black text-white">
              {tournament.entry_fee === 0 ? 'FREE' : formatBDT(tournament.entry_fee)}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Per Kill</p>
            <p className="text-sm sm:text-base font-black text-orange-400 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {tournament.per_kill > 0 ? formatBDT(tournament.per_kill) : '—'}
            </p>
          </div>
        </div>

        {/* Slot Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              Slots Filled
            </span>
            <span className="font-bold text-gray-200">
              {tournament.current_slots}/{tournament.max_slots}{' '}
              <span className="text-gray-400 font-normal">
                ({tournament.max_slots - tournament.current_slots} left)
              </span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                fillPercentage >= 90
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            href={`/tournaments/${tournament.id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 font-bold text-xs sm:text-sm text-center border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Details & Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {joined ? (
            <Link
              href={`/tournaments/${tournament.id}#room-vault`}
              className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-500/40 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>Room Vault</span>
            </Link>
          ) : isCompleted ? (
            <Link
              href={`/tournaments/${tournament.id}`}
              className="py-2.5 px-4 rounded-xl bg-gray-800 text-gray-400 font-bold text-xs sm:text-sm border border-gray-700"
            >
              Results
            </Link>
          ) : isFull ? (
            <button
              disabled
              className="py-2.5 px-4 rounded-xl bg-gray-800/50 text-gray-400 font-bold text-xs sm:text-sm border border-gray-800 cursor-not-allowed"
            >
              Full
            </button>
          ) : (
            <button
              onClick={() => onJoinClick && onJoinClick(tournament)}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1"
            >
              <span>Join Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
