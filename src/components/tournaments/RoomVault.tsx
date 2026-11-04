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
} from 'lucide-react';

interface RoomVaultProps {
  tournament: Tournament;
}

export default function RoomVault({ tournament }: RoomVaultProps) {
  const { currentUser, isRegistered, getRoomCredentials } = useDemo();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Synchronous subscription hook
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
      <div id="room-vault" className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto text-gray-400">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-white">Time-Gated Room Vault is Locked</h4>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Free Fire Custom Room ID and Password are protected. Only verified registered players
          can access room credentials.
        </p>
        <div className="pt-2">
          <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/20 py-2 px-3 rounded-lg inline-block">
            Join this tournament to unlock credentials 15 minutes before match start.
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Registered or Admin, and credentials unlocked! (Within 15 mins or Admin)
  if (creds.is_unlocked) {
    return (
      <div
        id="room-vault"
        className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/50 space-y-5 shadow-xl shadow-emerald-950/30 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-white">Custom Room Vault Unlocked</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                {isAdmin
                  ? 'Admin Override View — Visible to Tournament Organizers'
                  : 'Time window active. Enter Free Fire and join room now.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Leak Verification Active</span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Room ID Box */}
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Free Fire Room ID</p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider mt-0.5">
                {creds.room_id || 'NOT_SET'}
              </p>
            </div>
            <button
              onClick={() => creds.room_id && copyToClipboard(creds.room_id, 'id')}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-emerald-500 hover:text-slate-950 text-gray-300 border border-gray-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Copy Room ID"
            >
              {copiedId ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Room Password Box */}
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Room Password</p>
              <p className="text-xl sm:text-2xl font-black text-orange-400 font-mono tracking-wider mt-0.5">
                {creds.room_password || 'NOT_SET'}
              </p>
            </div>
            <button
              onClick={() => creds.room_password && copyToClipboard(creds.room_password, 'pass')}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-orange-500 hover:text-slate-950 text-gray-300 border border-gray-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Copy Room Password"
            >
              {copiedPass ? (
                <>
                  <Check className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Pass</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 text-xs text-gray-300 space-y-1.5">
          <p className="font-bold text-gray-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Quick Joining Instructions:
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-gray-400 pl-1">
            <li>Open Garena Free Fire and click the Mode Selection menu.</li>
            <li>Tap <strong className="text-white">Custom</strong> at bottom right.</li>
            <li>Search using Room ID <code className="text-emerald-400 bg-gray-950 px-1 py-0.5 rounded font-mono">{creds.room_id}</code>.</li>
            <li>Enter Password <code className="text-orange-400 bg-gray-950 px-1 py-0.5 rounded font-mono">{creds.room_password}</code> and sit in your designated slot!</li>
          </ol>
        </div>
      </div>
    );
  }

  // Case 3: User IS registered, but match is >15 minutes away! (Show real-time countdown to unlock!)
  return (
    <div
      id="room-vault"
      className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4 text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-black text-white">
          Room Credentials Locked Until 15 Minutes Before Match
        </h4>
        <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1">
          You are successfully registered! To prevent unauthorized room password leakage, credentials
          will automatically unlock in your vault 15 minutes before match start.
        </p>
      </div>

      {/* Countdown Box */}
      <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 max-w-sm mx-auto">
        <p className="text-[11px] text-gray-400 uppercase font-semibold flex items-center justify-center gap-1 mb-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
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
            <span className="text-2xl font-black text-amber-400">{countdown.seconds}</span>
            <span className="block text-[10px] text-gray-400 uppercase">Secs</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1 font-semibold">
        <KeyRound className="w-3.5 h-3.5" />
        Keep this tab open. Credentials will decrypt automatically once the countdown expires.
      </p>
    </div>
  );
}
