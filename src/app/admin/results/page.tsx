'use client';

import React, { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import { BDT } from '@/components/common/BDT';
import { Trophy, CheckCircle2, Award } from 'lucide-react';

export default function AdminResultsPage() {
  const { tournaments, publishResults, matchResults, participants } = useDemo();

  // Active or upcoming tournaments eligible to have results published
  const activeTournaments = tournaments.filter((t) => t.status !== 'cancelled');

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    activeTournaments[0]?.id || ''
  );

  // Form states for top 3
  const [rank1Ign, setRank1Ign] = useState('亗TANVIR亗 (TEAM VORTEX)');
  const [rank1Kills, setRank1Kills] = useState<number>(12);
  const [rank1Prize, setRank1Prize] = useState<number>(1200);

  const [rank2Ign, setRank2Ign] = useState('RAKIB_OP (RED EAGLES)');
  const [rank2Kills, setRank2Kills] = useState<number>(8);
  const [rank2Prize, setRank2Prize] = useState<number>(600);

  const [rank3Ign, setRank3Ign] = useState('DHAKA KINGS');
  const [rank3Kills, setRank3Kills] = useState<number>(5);
  const [rank3Prize, setRank3Prize] = useState<number>(300);

  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournamentId) return;

    const tourneyParticipants = participants.filter((p) => p.tournament_id === selectedTournamentId);

    const findUserId = (ignQuery: string) => {
      const match = tourneyParticipants.find(
        (p) => ignQuery.toLowerCase().includes(p.ign.toLowerCase()) || p.ign.toLowerCase().includes(ignQuery.toLowerCase())
      );
      return match ? match.user_id : undefined;
    };

    publishResults(selectedTournamentId, [
      {
        tournament_id: selectedTournamentId,
        rank: 1,
        ign: rank1Ign.trim(),
        kills: Number(rank1Kills),
        prize_amount: Number(rank1Prize),
        user_id: findUserId(rank1Ign),
      },
      {
        tournament_id: selectedTournamentId,
        rank: 2,
        ign: rank2Ign.trim(),
        kills: Number(rank2Kills),
        prize_amount: Number(rank2Prize),
        user_id: findUserId(rank2Ign),
      },
      {
        tournament_id: selectedTournamentId,
        rank: 3,
        ign: rank3Ign.trim(),
        kills: Number(rank3Kills),
        prize_amount: Number(rank3Prize),
        user_id: findUserId(rank3Ign),
      },
    ]);

    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-white">Publish Tournament Match Results</h2>
        <p className="text-xs text-gray-400">
          Enter verified placement ranks and kills from the Free Fire match end-screen to credit player demo wallets.
        </p>
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Official results published! Tournament marked as completed and prize ledger credited.
          </span>
        </div>
      )}

      {/* Publish Form */}
      <form onSubmit={handlePublish} className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5">
            Select Tournament to Finalize
          </label>
          <select
            value={selectedTournamentId}
            onChange={(e) => {
              setSelectedTournamentId(e.target.value);
              const tourney = tournaments.find((t) => t.id === e.target.value);
              if (tourney) {
                setRank1Prize(tourney.prize_distribution.first || 1000);
                setRank2Prize(tourney.prize_distribution.second || 500);
                setRank3Prize(tourney.prize_distribution.third || 250);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500"
          >
            {activeTournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status.toUpperCase()} • Prize: {formatBDT(t.prize_pool)})
              </option>
            ))}
          </select>
        </div>

        {/* Podium Placement Inputs */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
            Final Standings & Prize Distribution
          </h4>

          {/* Rank 1 */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>Rank 1 (Booyah Champion)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] text-gray-400 mb-1">Winner IGN / Squad</label>
                <input
                  type="text"
                  value={rank1Ign}
                  onChange={(e) => setRank1Ign(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Squad Kills</label>
                <input
                  type="number"
                  min="0"
                  value={rank1Kills}
                  onChange={(e) => setRank1Kills(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">1st Prize (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  value={rank1Prize}
                  onChange={(e) => setRank1Prize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-emerald-400 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Rank 2 */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-xs">
              <Award className="w-4 h-4 text-gray-400" />
              <span>Rank 2 (Runner-Up)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] text-gray-400 mb-1">Runner-up IGN</label>
                <input
                  type="text"
                  value={rank2Ign}
                  onChange={(e) => setRank2Ign(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Squad Kills</label>
                <input
                  type="number"
                  min="0"
                  value={rank2Kills}
                  onChange={(e) => setRank2Kills(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">2nd Prize (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  value={rank2Prize}
                  onChange={(e) => setRank2Prize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-emerald-400 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>Rank 3 (Third Place)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] text-gray-400 mb-1">Third Place IGN</label>
                <input
                  type="text"
                  value={rank3Ign}
                  onChange={(e) => setRank3Ign(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Squad Kills</label>
                <input
                  type="number"
                  min="0"
                  value={rank3Kills}
                  onChange={(e) => setRank3Kills(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">3rd Prize (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  value={rank3Prize}
                  onChange={(e) => setRank3Prize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-gray-700 text-emerald-400 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          <span>Finalize Match & Distribute Prizes</span>
        </button>
      </form>

      {/* Published Results Archive */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-400" />
          Published Match Archive ({matchResults.length} records)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matchResults.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                  #{r.rank}
                </span>
                <div>
                  <p className="font-bold text-white truncate max-w-[140px]">{r.ign}</p>
                  <p className="text-[10px] text-orange-400 font-semibold">{r.kills} Kills</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-black text-emerald-400"><BDT amount={r.prize_amount} /></p>
                <p className="text-[9px] text-gray-400">{formatMatchTime(r.published_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
