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
  Crown,
} from 'lucide-react';

interface RoomVaultProps {
  tournament: Tournament;
}

export default function RoomVault({ tournament }: RoomVaultProps) {
  const { currentUser, isRegistered, getRoomCredentials } = useDemo();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const countdown = useCountdown(tournament.match_time);

  const joined = isRegistered(tournament.id);
  const isAdmin = currentUser?.role === 'admin';
  const creds = getRoomCredentials(tournament.id);

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
    } catch {
      // Fallback
    }
  };

  // Case 1: User is not logged in or not registered (and not admin)
  if (!currentUser || (!joined && !isAdmin)) {
    return (
      <div id="room-vault" className="p-6 rounded-2xl bg-[#0B0F19] border border-[#1E2536] text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto text-[#FF2438]">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-black text-white uppercase tracking-wider">Time-Gated Room Vault is Locked</h4>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Free Fire Custom Room ID and Password are encrypted. Only verified registered participants
          can decrypt room credentials.
        </p>
        <div className="pt-2">
          <p className="text-[11px] text-[#00A3FF] font-black bg-blue-950/40 border border-[#00A3FF]/30 py-2 px-3.5 rounded-lg inline-block">
            Join this tournament to unlock credentials 15 minutes before match start.
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Registered or Admin, and credentials unlocked!
  if (creds.is_unlocked) {
    return (
      <div
        id="room-vault"
        className="p-6 rounded-2xl bg-gradient-to-b from-red-950/30 via-[#0C101A] to-[#080B12] border-2 border-[#FF2438]/50 space-y-5 shadow-2xl shadow-red-950/40 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[#FF2438]">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white">Custom Room Vault Decrypted</h4>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-[#FF2438] to-[#00A3FF] text-white flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" />
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {isAdmin
                  ? 'Admin Headquarters View — Visible to Tournament Organizers'
                  : 'Vault unlocked. Enter Free Fire and join custom room now.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#07090F] px-3 py-1.5 rounded-lg border border-[#1E2536]">
            <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
            <span>Anti-Leak Verification Active</span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Room ID Box */}
          <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Free Fire Room ID</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider mt-0.5">
                {creds.room_id || 'NOT_SET'}
              </p>
            </div>
            <button
              onClick={() => creds.room_id && copyToClipboard(creds.room_id, 'id')}
              className="p-2.5 rounded-lg bg-[#121622] hover:bg-[#FF2438] hover:text-white text-gray-200 border border-[#1E2536] transition-colors flex items-center gap-1.5 text-xs font-black"
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
          <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Room Password</p>
              <p className="text-xl sm:text-2xl font-black text-[#FF2438] font-mono tracking-wider mt-0.5">
                {creds.room_password || 'NOT_SET'}
              </p>
            </div>
            <button
              onClick={() => creds.room_password && copyToClipboard(creds.room_password, 'pass')}
              className="p-2.5 rounded-lg bg-[#121622] hover:bg-[#00A3FF] hover:text-white text-gray-200 border border-[#1E2536] transition-colors flex items-center gap-1.5 text-xs font-black"
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

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] text-xs text-gray-300 space-y-1.5">
          <p className="font-black text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Quick Joining Instructions:
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-gray-400 pl-1">
            <li>Open Garena Free Fire and click the Mode Selection menu.</li>
            <li>Tap <strong className="text-white">Custom</strong> at bottom right.</li>
            <li>Search using Room ID <code className="text-[#00A3FF] bg-[#121622] px-1.5 py-0.5 rounded font-mono font-bold">{creds.room_id}</code>.</li>
            <li>Enter Password <code className="text-[#FF2438] bg-[#121622] px-1.5 py-0.5 rounded font-mono font-bold">{creds.room_password}</code> and sit in your designated slot!</li>
          </ol>
        </div>
      </div>
    );
  }

  // Case 3: User IS registered, but match is >15 minutes away
  return (
    <div
      id="room-vault"
      className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/20 via-[#0C101A] to-[#080B12] border border-[#00A3FF]/30 space-y-4 text-center shadow-2xl"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-[#00A3FF]/30 flex items-center justify-center mx-auto text-[#00A3FF]">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-black text-white">
          Room Credentials Locked Until 15 Minutes Before Match
        </h4>
        <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1">
          Registration confirmed! To prevent unauthorized room password leakage, credentials
          will automatically decrypt in your vault exactly 15 minutes before match start.
        </p>
      </div>

      {/* Countdown Box */}
      <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] max-w-sm mx-auto shadow-inner">
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
        Keep this tab open. Credentials will decrypt automatically once the countdown reaches 15:00.
      </p>
    </div>
  );
}
