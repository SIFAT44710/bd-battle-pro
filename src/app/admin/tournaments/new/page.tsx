'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { TournamentType, TournamentMap } from '@/types/tournament';
import { Swords, PlusCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { createTournament } = useDemo();

  const [title, setTitle] = useState('');
  const [matchType, setMatchType] = useState<TournamentType>('Squad');
  const [map, setMap] = useState<TournamentMap>('Bermuda');
  const [entryFee, setEntryFee] = useState<number>(50);
  const [prizePool, setPrizePool] = useState<number>(2000);
  const [perKill, setPerKill] = useState<number>(15);
  const [firstPrize, setFirstPrize] = useState<number>(1000);
  const [secondPrize, setSecondPrize] = useState<number>(500);
  const [thirdPrize, setThirdPrize] = useState<number>(250);
  const [maxSlots, setMaxSlots] = useState<number>(48);
  const [matchTime, setMatchTime] = useState<string>('2026-11-04T22:00');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [rules, setRules] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTypeChange = (type: TournamentType) => {
    setMatchType(type);
    if (type === 'Clash Squad') {
      setMaxSlots(16);
      setPerKill(0);
    } else {
      setMaxSlots(48);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      createTournament({
        title,
        game: 'Free Fire',
        match_type: matchType,
        map,
        entry_fee: Number(entryFee),
        prize_pool: Number(prizePool),
        per_kill: Number(perKill),
        prize_distribution: {
          first: Number(firstPrize),
          second: Number(secondPrize),
          third: Number(thirdPrize),
          per_kill: Number(perKill),
        },
        max_slots: Number(maxSlots),
        status: 'upcoming',
        match_time: new Date(matchTime).toISOString(),
        room_id: roomId.trim() || null,
        room_password: roomPassword.trim() || null,
        rules: rules.trim() || 'Standard Garena Free Fire competitive esports rules apply.',
        banner_url: bannerUrl.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/tournaments');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/tournaments"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-gray-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Create New Tournament</h2>
            <p className="text-xs text-gray-400">
              Configure Free Fire match details, prize structures, and time-gated room credentials.
            </p>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Tournament successfully published to player lobby! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Tournament Title */}
          <div>
            <label className="block font-bold text-gray-300 mb-1.5">
              Tournament Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Free Fire Squad Rush — Bermuda Season 5"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Mode & Map Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 mb-1.5">Match Format</label>
              <select
                value={matchType}
                onChange={(e) => handleTypeChange(e.target.value as TournamentType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Squad">Squad (48 Slots)</option>
                <option value="Solo">Solo (48 Slots)</option>
                <option value="Duo">Duo (48 Slots)</option>
                <option value="Clash Squad">Clash Squad (16 Slots)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1.5">Map</label>
              <select
                value={map}
                onChange={(e) => setMap(e.target.value as TournamentMap)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Alpine">Alpine</option>
                <option value="Nexterra">Nexterra</option>
              </select>
            </div>
          </div>

          {/* Entry Fee & Prize Pool in BDT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-950 border border-gray-800">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Entry Fee (BDT ৳)</label>
              <input
                type="number"
                min="0"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Total Prize Pool (BDT ৳)</label>
              <input
                type="number"
                min="0"
                value={prizePool}
                onChange={(e) => setPrizePool(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-emerald-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Per Kill Bounty (BDT ৳)</label>
              <input
                type="number"
                min="0"
                value={perKill}
                onChange={(e) => setPerKill(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-orange-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Prize Distribution (1st, 2nd, 3rd) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">1st Place (৳)</label>
              <input
                type="number"
                min="0"
                value={firstPrize}
                onChange={(e) => setFirstPrize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">2nd Place (৳)</label>
              <input
                type="number"
                min="0"
                value={secondPrize}
                onChange={(e) => setSecondPrize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">3rd Place (৳)</label>
              <input
                type="number"
                min="0"
                value={thirdPrize}
                onChange={(e) => setThirdPrize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
              />
            </div>
          </div>

          {/* Max Slots & Match Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 mb-1.5">Max Player Slots</label>
              <input
                type="number"
                min="4"
                max="100"
                value={maxSlots}
                onChange={(e) => setMaxSlots(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1.5">
                Match Start Time (BST) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block font-bold text-gray-300 mb-1.5">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
            />
          </div>

          {/* Room ID and Password */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                Custom Room Credentials (Time-Gated Vault)
              </h4>
              <p className="text-[11px] text-gray-400">
                You can set this now or update it closer to match time. Will only unlock for registered players 15 minutes before start.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. FF-ROOM-9921"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Room Password</label>
                <input
                  type="text"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="e.g. battle2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-gray-700 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block font-bold text-gray-300 mb-1.5">Match Rules & Guidelines</label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. No emulators allowed. Screen recording required for top 3 squads."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Link
              href="/admin/tournaments"
              className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Tournament'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
