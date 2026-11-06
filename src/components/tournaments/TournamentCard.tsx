'use client';

import React from 'react';
import Link from 'next/link';
import { Tournament } from '@/types/tournament';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import { BDT } from '@/components/common/BDT';
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
  Crown,
} from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onJoinClick?: (tournament: Tournament) => void;
}

export default function TournamentCard({ tournament, onJoinClick }: TournamentCardProps) {
  const { isRegistered, getUserSlot } = useDemo();
  const joined = isRegistered(tournament.id);
  const userSlot = getUserSlot(tournament.id);

  const countdown = useCountdown(tournament.match_time);

  const fillPercentage = Math.min(
    100,
    Math.round((tournament.current_slots / tournament.max_slots) * 100)
  );

  const isFull = tournament.current_slots >= tournament.max_slots;
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-[#1E2536] hover:border-[#FF2438]/50 transition-all shadow-xl bg-[#0C101A]">
      {/* Top Banner / Tags */}
      <div className="relative h-36 w-full bg-[#080B12] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C101A] via-[#0C101A]/60 to-transparent" />

        {/* Status Badges Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#07090F]/90 text-white border border-[#1E2536] backdrop-blur-md flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              {tournament.match_type}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#07090F]/80 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center gap-1 backdrop-blur-md">
              <MapPin className="w-3 h-3 text-[#00A3FF]" />
              {tournament.map}
            </span>
          </div>

          <div>
            {isLive ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-[#FF2438] text-white flex items-center gap-1 animate-pulse shadow-lg shadow-red-600/40">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                LIVE NOW
              </span>
            ) : isCompleted ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-800 text-gray-300 border border-gray-700">
                COMPLETED
              </span>
            ) : countdown.isWithin15m ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-[#FF2438] to-[#00A3FF] text-white flex items-center gap-1 animate-pulse shadow-lg shadow-red-600/40">
                <KeyRound className="w-3 h-3" />
                VAULT OPEN
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#07090F]/90 text-gray-300 border border-[#1E2536] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00A3FF]" />
                {countdown.label}
              </span>
            )}
          </div>
        </div>

        {/* Registered Indicator */}
        {joined && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 rounded-md text-xs font-black bg-gradient-to-r from-[#FF2438] to-red-600 text-white flex items-center gap-1.5 shadow-md shadow-red-950/60 border border-red-400/40">
              <CheckCircle className="w-3.5 h-3.5" />
              Registered (Slot #{userSlot})
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-black text-base sm:text-lg text-white group-hover:text-[#FF2438] transition-colors line-clamp-1">
            {tournament.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span>Match: {formatMatchTime(tournament.match_time)}</span>
          </div>
        </div>

        {/* Prize Pool & Entry Fee Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#07090F] border border-[#1E2536] text-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Prize Pool</p>
            <div className="text-sm sm:text-base font-black text-[#FF2438] flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <BDT amount={tournament.prize_pool} />
            </div>
          </div>

          <div className="border-x border-[#1E2536]">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Entry Fee</p>
            <div className="text-sm sm:text-base font-black text-white">
              {tournament.entry_fee === 0 ? 'FREE' : <BDT amount={tournament.entry_fee} />}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Per Kill</p>
            <div className="text-sm sm:text-base font-black text-[#00A3FF] flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-[#FF2438]" />
              {tournament.per_kill > 0 ? <BDT amount={tournament.per_kill} /> : '—'}
            </div>
          </div>
        </div>

        {/* Slot Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5 text-[#00A3FF]" />
              Slots Booked
            </span>
            <span className="font-extrabold text-white">
              {tournament.current_slots}/{tournament.max_slots}{' '}
              <span className="text-gray-400 font-normal">
                ({tournament.max_slots - tournament.current_slots} left)
              </span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#151B2A] overflow-hidden p-[1px]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                fillPercentage >= 90
                  ? 'bg-gradient-to-r from-orange-500 to-[#FF2438]'
                  : 'bg-gradient-to-r from-[#00A3FF] to-[#FF2438]'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons based on match status */}
        <div className="pt-2">
          {isLive ? (
            <Link
              href={`/tournaments/${tournament.id}#room-vault`}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2438] via-rose-600 to-[#00A3FF] hover:brightness-110 text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 group/btn"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Watch Live / Room Vault</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          ) : isCompleted ? (
            <Link
              href={`/tournaments/${tournament.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#121622] hover:bg-[#182030] text-[#00A3FF] hover:text-white font-black text-xs sm:text-sm text-center border border-[#1E2536] hover:border-[#00A3FF]/40 transition-all flex items-center justify-center gap-2 group/btn"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Final Standings & Payouts</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#121622] hover:bg-[#182030] text-gray-200 font-bold text-xs sm:text-sm text-center border border-[#1E2536] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Details & Rules</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              {joined ? (
                <Link
                  href={`/tournaments/${tournament.id}#room-vault`}
                  className="py-2.5 px-4 rounded-xl bg-[#00A3FF]/20 hover:bg-[#00A3FF]/30 text-[#00A3FF] font-black text-xs sm:text-sm border border-[#00A3FF]/40 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <KeyRound className="w-4 h-4 text-[#00A3FF]" />
                  <span>Room Vault</span>
                </Link>
              ) : isFull ? (
                <button
                  disabled
                  className="py-2.5 px-4 rounded-xl bg-[#121622]/50 text-gray-500 font-bold text-xs sm:text-sm border border-[#1E2536] cursor-not-allowed"
                >
                  Full
                </button>
              ) : (
                <button
                  onClick={() => onJoinClick && onJoinClick(tournament)}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Join Now</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
