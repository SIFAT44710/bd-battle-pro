'use client';

import React, { useState } from 'react';
import { Tournament } from '@/types/tournament';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import {
  X,
  Swords,
  Trophy,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Gamepad2,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';

interface JoinModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function JoinModal({ tournament, onClose }: JoinModalProps) {
  const { currentUser, joinTournament } = useDemo();

  const [ign, setIgn] = useState(currentUser?.ign || '');
  const [ffUid, setFfUid] = useState(currentUser?.ff_uid || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ slotNumber: number; newBalance: number } | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Login Required</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-300">
            Please log in or select a demo player account from the top banner to join this tournament.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <Link
              href="/auth/login"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentBalance = currentUser.demo_balance;
  const entryFee = tournament.entry_fee;
  const hasSufficientBalance = currentBalance >= entryFee;
  const balanceAfter = currentBalance - entryFee;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim() || !ffUid.trim()) {
      setError('Please provide your Free Fire In-Game Name and Numeric UID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await joinTournament(tournament.id, ign.trim(), ffUid.trim());
      if (res.success && res.slotNumber !== undefined) {
        setSuccessData({
          slotNumber: res.slotNumber,
          newBalance: res.newBalance || balanceAfter,
        });
      } else {
        setError(res.message);
      }
    } catch {
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Join Tournament</h3>
              <p className="text-xs text-gray-400">{tournament.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successData ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Registration Confirmed!</h4>
              <p className="text-xs text-gray-300 mt-1">
                You have been registered for{' '}
                <strong className="text-white">{tournament.title}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-gray-800 space-y-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Assigned Slot:</span>
                <span className="font-mono font-black text-base text-emerald-400">
                  Slot #{successData.slotNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Deducted Entry Fee:</span>
                <span className="font-bold text-white">{formatBDT(entryFee)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800">
                <span className="text-gray-400">New Demo Balance:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatBDT(successData.newBalance)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Your room credentials will unlock 15 minutes before match start in the Room Vault.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition-colors"
              >
                Close
              </button>
              <Link
                href={`/tournaments/${tournament.id}#room-vault`}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <KeyRound className="w-4 h-4" />
                <span>Go to Room Vault</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Match Info Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Match Format
                </span>
                <span className="font-bold text-white">
                  {tournament.match_type} • {tournament.map}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Match Time
                </span>
                <span className="font-bold text-white">
                  {formatMatchTime(tournament.match_time)}
                </span>
              </div>
            </div>

            {/* Free Fire In-Game Identity */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  Free Fire In-Game Name (IGN) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. 亗TANVIR亗"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Must match your in-game name exactly for scoreboard recognition.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Free Fire Numeric UID <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  placeholder="e.g. 2948201948"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Balance Breakdown Box */}
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  Current Demo Balance:
                </span>
                <span className="font-bold text-white font-mono">{formatBDT(currentBalance)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Tournament Entry Fee:</span>
                <span className="font-bold text-red-400 font-mono">
                  - {formatBDT(entryFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-800">
                <span className="font-bold text-gray-300">Remaining Balance:</span>
                <span
                  className={`font-black font-mono ${
                    hasSufficientBalance ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatBDT(Math.max(0, balanceAfter))}
                </span>
              </div>

              {!hasSufficientBalance && (
                <p className="text-[11px] text-red-400 font-semibold pt-1">
                  ⚠️ Insufficient demo balance to join this match.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasSufficientBalance || loading}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  hasSufficientBalance && !loading
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{loading ? 'Registering...' : `Pay ${formatBDT(entryFee)} & Join`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
