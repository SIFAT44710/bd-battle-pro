'use client';

import React, { useState } from 'react';
import { Tournament } from '@/types/tournament';
import { useDemo } from '@/context/DemoContext';
import { useCountdown } from '@/hooks/useCountdown';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  KeyRound,
  Gamepad2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface RoomVaultProps {
  tournament: Tournament;
}

export default function RoomVault({ tournament }: RoomVaultProps) {
  const { currentUser, isRegistered, getUserSlot, getRoomCredentials } = useDemo();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [simulateUnlock, setSimulateUnlock] = useState(false);

  const countdown = useCountdown(tournament.match_time);
  const joined = isRegistered(tournament.id);
  const userSlot = getUserSlot(tournament.id);
  const isAdmin = currentUser?.role === 'admin';
  const creds = getRoomCredentials(tournament.id);

  // Time-gated condition: 15-min window, countdown reaches 0, live status, or simulate toggle
  const isTimerZero = countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  const isTimeUnlocked = countdown.isWithin15m || countdown.isStarted || isTimerZero || tournament.status === 'live';
  
  // Final unlock state: Must be registered or admin, AND either time is ready, creds unlocked, or demo simulate is ON
  const isUnlocked = (isTimeUnlocked || creds.is_unlocked || simulateUnlock) && (joined || isAdmin);

  const copyToClipboard = async (text: string, type: 'id' | 'pass') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      }
    } catch {}
  };

  const roomIdToDisplay = tournament.room_id || '88492019';
  const roomPassToDisplay = tournament.room_password || 'BBP2026';
  const assignedSlot = userSlot || 1;

  // Case 1: User is not logged in or not registered (and not admin)
  if (!currentUser || (!joined && !isAdmin)) {
    return (
      <div id="room-vault" className="p-6 rounded-2xl bg-[#0B0F19] border border-[#1E2536] text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto text-[#FF2438]">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-black text-white uppercase tracking-wider">
            Time-Gated Room Vault is Locked
          </h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
            Free Fire Custom Room ID and Password are encrypted. Only verified registered participants can decrypt room credentials.
          </p>
        </div>
        <div className="pt-1">
          <p className="text-[11px] text-[#00A3FF] font-black bg-blue-950/40 border border-[#00A3FF]/30 py-2 px-3.5 rounded-lg inline-block">
            Register for this tournament to unlock credentials 15 minutes before match start.
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Registered/Admin AND Unlocked
  if (isUnlocked) {
    return (
      <div
        id="room-vault"
        className="p-6 rounded-3xl bg-gradient-to-b from-red-950/30 via-[#0C101A] to-[#080B12] border-2 border-[#FF2438]/60 space-y-5 shadow-2xl shadow-red-950/50 relative overflow-hidden"
      >
        {/* Header with Simulate Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-[#FF2438] shadow-lg shadow-red-950/50">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-black text-white">Custom Room Vault Decrypted</h4>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-[#FF2438] to-[#00A3FF] text-white flex items-center gap-1 shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {isAdmin
                  ? 'Admin Headquarters View — Credentials live to participants'
                  : 'Credentials unlocked. Launch Free Fire and join your room!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo Simulation Toggle Button */}
            <button
              onClick={() => setSimulateUnlock(!simulateUnlock)}
              className="px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1E2536] border border-[#1E2536] text-[11px] font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Toggle between Locked and Unlocked demo preview"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>Simulate 15-Min Unlock: <strong className={simulateUnlock ? 'text-emerald-400' : 'text-gray-400'}>{simulateUnlock ? 'ON' : 'OFF'}</strong></span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 bg-[#07090F] px-3 py-1.5 rounded-lg border border-[#1E2536]">
              <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
              <span>Anti-Leak Active</span>
            </div>
          </div>
        </div>

        {/* Assigned Slot Number Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#101524] to-blue-950/40 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FF2438] to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md">
              Slot #{assignedSlot}
            </span>
            <span className="text-xs font-bold text-white">
              Assigned Participant Slot: <strong className="text-[#00A3FF] font-mono">Slot {assignedSlot}</strong>
            </span>
          </div>
          <span className="text-[11px] text-gray-400 hidden sm:inline">Sit strictly in Slot #{assignedSlot} in-game</span>
        </div>

        {/* Credentials Grid: Room ID & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Room ID Box */}
          <div className="p-4 rounded-2xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Free Fire Room ID</p>
              <p className="text-2xl font-black text-white font-mono tracking-wider mt-0.5">
                {roomIdToDisplay}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(roomIdToDisplay, 'id')}
              className="px-3.5 py-2 rounded-xl bg-[#121622] hover:bg-[#FF2438] hover:text-white text-gray-200 border border-[#1E2536] transition-all flex items-center gap-1.5 text-xs font-black shadow-md cursor-pointer"
              title="Copy Room ID"
            >
              {copiedId ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#00A3FF]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Room Password Box */}
          <div className="p-4 rounded-2xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Room Password</p>
              <p className="text-2xl font-black text-[#FF2438] font-mono tracking-wider mt-0.5">
                {roomPassToDisplay}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(roomPassToDisplay, 'pass')}
              className="px-3.5 py-2 rounded-xl bg-[#121622] hover:bg-[#00A3FF] hover:text-white text-gray-200 border border-[#1E2536] transition-all flex items-center gap-1.5 text-xs font-black shadow-md cursor-pointer"
              title="Copy Room Password"
            >
              {copiedPass ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#FF2438]" />
                  <span>Copy Pass</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Launch Free Fire Quick Reminder */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1220] to-[#0A0D16] border border-[#1E2536] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 border border-[#00A3FF]/30 flex items-center justify-center text-[#00A3FF]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Ready for Combat? Launch Free Fire Now</p>
              <p className="text-[11px] text-gray-400">
                Mode Menu → Custom → Search ID <span className="font-mono text-white font-bold">{roomIdToDisplay}</span> → Password <span className="font-mono text-[#FF2438] font-bold">{roomPassToDisplay}</span> → Sit in Slot #{assignedSlot}
              </p>
            </div>
          </div>

          <a
            href="https://play.google.com/store/apps/details?id=com.dts.freefireth"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2438] to-red-600 hover:from-red-500 hover:to-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-950/60 whitespace-nowrap self-end sm:self-auto"
          >
            <span>Launch Free Fire</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Case 3: Registered, but match is >15 minutes away and simulate is off
  return (
    <div
      id="room-vault"
      className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/20 via-[#0C101A] to-[#080B12] border border-[#00A3FF]/30 space-y-4 text-center shadow-2xl relative"
    >
      {/* Top Demo Toggle Bar */}
      <div className="flex items-center justify-between border-b border-[#1E2536] pb-3 text-left">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#00A3FF]" />
          <span className="text-xs font-bold text-gray-300">15-Minute Security Gate</span>
        </div>
        <button
          onClick={() => setSimulateUnlock(true)}
          className="px-3 py-1 rounded-lg bg-[#121622] hover:bg-[#1E2536] border border-[#1E2536] text-[11px] font-bold text-[#00A3FF] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Instantly preview the decrypted room credentials"
        >
          <Sliders className="w-3.5 h-3.5 text-[#00A3FF]" />
          <span>Simulate 15-Min Unlock (Demo)</span>
        </button>
      </div>

      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-[#00A3FF]/30 flex items-center justify-center mx-auto text-[#00A3FF]">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-black text-white">
          Room Credentials Locked Until 15 Minutes Before Match
        </h4>
        <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1">
          Registration confirmed in <strong className="text-[#00A3FF]">Slot #{assignedSlot}</strong>! Room credentials decrypt automatically 15 minutes before match start.
        </p>
      </div>

      {/* Countdown Box */}
      <div className="p-4 rounded-2xl bg-[#07090F] border border-[#1E2536] max-w-sm mx-auto shadow-inner">
        <p className="text-[11px] text-gray-400 uppercase font-black tracking-wider flex items-center justify-center gap-1 mb-2">
          <Clock className="w-3.5 h-3.5 text-[#00A3FF]" />
          Time Until Room Unlock
        </p>
        <div className="flex items-center justify-center gap-3 font-mono">
          <div className="text-center">
            <span className="text-2xl font-black text-white">{countdown.hours}</span>
            <span className="block text-[10px] text-gray-400 uppercase">Hours</span>
          </div>
          <span className="text-xl font-bold text-gray-600">:</span>
          <div className="text-center">
            <span className="text-2xl font-black text-white">{countdown.minutes}</span>
            <span className="block text-[10px] text-gray-400 uppercase">Mins</span>
          </div>
          <span className="text-xl font-bold text-gray-600">:</span>
          <div className="text-center">
            <span className="text-2xl font-black text-[#FF2438]">{countdown.seconds}</span>
            <span className="block text-[10px] text-gray-400 uppercase">Secs</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#00A3FF] flex items-center justify-center gap-1 font-bold">
        <KeyRound className="w-3.5 h-3.5 text-[#FF2438]" />
        Credentials decrypt automatically here when countdown reaches 15:00 or 00:00.
      </p>
    </div>
  );
}
