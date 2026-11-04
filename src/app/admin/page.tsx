'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import {
  Users,
  Swords,
  Trophy,
  Clock,
  KeyRound,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { tournaments, participants, matchResults, updateTournament } = useDemo();

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  // Metrics
  const upcomingCount = tournaments.filter((t) => t.status === 'upcoming').length;
  const liveCount = tournaments.filter((t) => t.status === 'live').length;
  const completedCount = tournaments.filter((t) => t.status === 'completed').length;
  const totalSlotsFilled = participants.length;

  const totalPrizeDistributed = matchResults.reduce((acc, r) => acc + r.prize_amount, 0);

  const startEditRoom = (tournamentId: string, currentRoom?: string | null, currentPass?: string | null) => {
    setEditingRoomId(tournamentId);
    setRoomIdInput(currentRoom || '');
    setRoomPassInput(currentPass || '');
  };

  const saveRoomCredentials = (tournamentId: string) => {
    updateTournament(tournamentId, {
      room_id: roomIdInput.trim(),
      room_password: roomPassInput.trim(),
    });
    setEditingRoomId(null);
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Total Registrations
          </p>
          <p className="text-2xl font-black text-white font-mono">{totalSlotsFilled}</p>
          <p className="text-[10px] text-gray-400">Players across all rooms</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-blue-400" />
            Active Tournaments
          </p>
          <p className="text-2xl font-black text-white font-mono">{upcomingCount + liveCount}</p>
          <p className="text-[10px] text-gray-400">{upcomingCount} Upcoming • {liveCount} Live</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
            Completed Matches
          </p>
          <p className="text-2xl font-black text-white font-mono">{completedCount}</p>
          <p className="text-[10px] text-gray-400">Audited & settled</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Settled Prizes
          </p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatBDT(totalPrizeDistributed)}
          </p>
          <p className="text-[10px] text-gray-400">Demo payouts logged</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            Room Vault Security
          </p>
          <p className="text-xl font-black text-orange-400 font-mono">15m Window</p>
          <p className="text-[10px] text-emerald-400 font-medium">Automatic Lock Active</p>
        </div>
      </div>

      {/* Quick Match Room Credentials Controller */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              Live Custom Room Credentials Manager
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Set or update Free Fire Room ID and Password. Credentials release automatically to players 15 minutes before launch.
            </p>
          </div>

          <Link
            href="/admin/tournaments/new"
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Match</span>
          </Link>
        </div>

        <div className="space-y-3">
          {tournaments.map((t) => {
            const isEditing = editingRoomId === t.id;

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gray-800 text-gray-300">
                      {t.match_type} • {t.map}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-950/50">
                      {t.current_slots}/{t.max_slots} Slots
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    Match Time: {formatMatchTime(t.match_time)}
                  </p>
                </div>

                {/* Edit Form or Display */}
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={roomIdInput}
                      onChange={(e) => setRoomIdInput(e.target.value)}
                      placeholder="Room ID"
                      className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-xs w-32 focus:border-emerald-500 outline-none"
                    />
                    <input
                      type="text"
                      value={roomPassInput}
                      onChange={(e) => setRoomPassInput(e.target.value)}
                      placeholder="Password"
                      className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-xs w-28 focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={() => saveRoomCredentials(t.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingRoomId(null)}
                      className="px-2.5 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-xs text-white">
                        ID: <span className="font-bold text-emerald-400">{t.room_id || 'Not Set'}</span>
                      </p>
                      <p className="font-mono text-[11px] text-gray-400">
                        Pass: <span className="text-orange-400">{t.room_password || 'Not Set'}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => startEditRoom(t.id, t.room_id, t.room_password)}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 transition-colors"
                    >
                      Edit Room
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
