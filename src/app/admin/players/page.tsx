'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { formatMatchTime } from '@/lib/utils';
import { Users, Gamepad2, Search } from 'lucide-react';

function PlayersContent() {
  const searchParams = useSearchParams();
  const initialTournamentId = searchParams?.get('tournamentId');

  const { tournaments, participants } = useDemo();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    initialTournamentId || tournaments[0]?.id || ''
  );
  const [searchFilter, setSearchFilter] = useState('');

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId);

  const tournamentParticipants = participants
    .filter((p) => p.tournament_id === selectedTournamentId)
    .filter((p) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return p.ign.toLowerCase().includes(q) || p.ff_uid.includes(q);
    })
    .sort((a, b) => a.slot_number - b.slot_number);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Registered Players & Slot Manager</h2>
        <p className="text-xs text-gray-400">
          View player Free Fire IGNs, UIDs, and assigned room slots for custom matches.
        </p>
      </div>

      {/* Filter and Select Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-bold text-gray-400 mb-1">Select Tournament:</label>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.current_slots}/{t.max_slots} Slots)
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-bold text-gray-400 mb-1">Search Player:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search IGN or UID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 text-xs">
          <div>
            <h3 className="font-extrabold text-white text-sm">
              {currentTournament?.title || 'Selected Tournament'}
            </h3>
            <p className="text-gray-400 mt-0.5">
              Format: <strong className="text-white">{currentTournament?.match_type}</strong> • Map:{' '}
              <strong className="text-emerald-400">{currentTournament?.map}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono font-black text-sm text-emerald-400">
              {tournamentParticipants.length} / {currentTournament?.max_slots || 48}
            </span>
            <span className="text-gray-400 block text-[11px]">Slots Occupied</span>
          </div>
        </div>

        {tournamentParticipants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Slot #</th>
                  <th className="py-2.5 px-3">Free Fire IGN</th>
                  <th className="py-2.5 px-3">Numeric UID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {tournamentParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-black text-emerald-400">
                      #{p.slot_number}
                    </td>
                    <td className="py-3 px-3 font-bold text-white font-sans flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p.ign}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{p.ff_uid}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-[11px] font-sans">
                      {formatMatchTime(p.registered_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 space-y-2 text-gray-400 text-xs">
            <Users className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-white font-bold">No players registered for this tournament yet.</p>
            <p>Players can register via the public tournament lobby.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPlayersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading player slots...</div>}>
      <PlayersContent />
    </Suspense>
  );
}
