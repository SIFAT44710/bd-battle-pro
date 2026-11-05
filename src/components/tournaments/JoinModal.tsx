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
  Crown,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#0C101A] border border-[#1E2536] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Login Required</h3>
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
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white font-black rounded-xl text-sm shadow-lg shadow-red-950/60"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0C101A] border border-[#1E2536] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Header with Red-Blue accent border */}
        <div className="p-5 border-b border-[#1E2536] flex items-center justify-between bg-[#080B12]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[#FF2438]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Join Tournament</h3>
              <p className="text-xs text-gray-400">{tournament.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#121622] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successData ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600/30 to-blue-600/30 border-2 border-[#FF2438] flex items-center justify-center mx-auto text-[#FF2438] shadow-lg shadow-red-950/50">
              <CheckCircle2 className="w-8 h-8 text-[#FF2438]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Registration Confirmed!</h4>
              <p className="text-xs text-gray-300 mt-1">
                You are registered for{' '}
                <strong className="text-white">{tournament.title}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E2536] space-y-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Assigned Slot:</span>
                <span className="font-mono font-black text-base text-[#FF2438]">
                  Slot #{successData.slotNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Deducted Entry Fee:</span>
                <span className="font-bold text-white">{formatBDT(entryFee)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E2536]">
                <span className="text-gray-400">New Demo Balance:</span>
                <span className="font-bold text-[#00A3FF] font-mono">
                  {formatBDT(successData.newBalance)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Your room credentials will decrypt exactly 15 minutes before match start in the Room Vault.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#121622] hover:bg-[#182030] text-gray-300 text-xs font-bold transition-colors border border-[#1E2536]"
              >
                Close
              </button>
              <Link
                href={`/tournaments/${tournament.id}#room-vault`}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#00A3FF] hover:brightness-110 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-red-950/60"
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
              <div className="p-2.5 rounded-xl bg-[#080B12] border border-[#1E2536]">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Match Format
                </span>
                <span className="font-black text-white flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  {tournament.match_type} • {tournament.map}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080B12] border border-[#1E2536]">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">
                  Match Time
                </span>
                <span className="font-black text-white">
                  {formatMatchTime(tournament.match_time)}
                </span>
              </div>
            </div>

            {/* Free Fire In-Game Identity */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1 flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                  Free Fire In-Game Name (IGN) <span className="text-[#FF2438]">*</span>
                </label>
                <input
                  type="text"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. 亗TANVIR亗"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-[#1E2536] text-white text-sm focus:outline-none focus:border-[#FF2438] transition-colors font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Must match your in-game name exactly for scoreboard recognition.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1">
                  Free Fire Numeric UID <span className="text-[#00A3FF]">*</span>
                </label>
                <input
                  type="text"
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  placeholder="e.g. 2948201948"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-[#1E2536] text-white text-sm focus:outline-none focus:border-[#00A3FF] transition-colors font-mono"
                />
              </div>
            </div>

            {/* Balance Breakdown Box */}
            <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1E2536] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-[#00A3FF]" />
                  Current Demo Balance:
                </span>
                <span className="font-bold text-white font-mono">{formatBDT(currentBalance)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Tournament Entry Fee:</span>
                <span className="font-bold text-[#FF2438] font-mono">
                  - {formatBDT(entryFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#1E2536]">
                <span className="font-bold text-gray-200">Remaining Balance:</span>
                <span
                  className={`font-black font-mono ${
                    hasSufficientBalance ? 'text-[#00A3FF]' : 'text-red-400'
                  }`}
                >
                  {formatBDT(Math.max(0, balanceAfter))}
                </span>
              </div>

              {!hasSufficientBalance && (
                <p className="text-[11px] text-red-400 font-bold pt-1">
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
                    ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-950/60 hover:scale-[1.02]'
                    : 'bg-[#151D2F] text-gray-500 cursor-not-allowed'
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
