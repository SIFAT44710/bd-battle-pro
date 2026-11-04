'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime } from '@/lib/utils';
import {
  PlusCircle,
  Trash2,
  Users,
  Clock,
  Eye,
  Check,
} from 'lucide-react';

export default function AdminTournamentsPage() {
  const { tournaments, updateTournament, cancelTournament } = useDemo();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  const startEditRoom = (id: string, rId?: string | null, rPass?: string | null) => {
    setEditingId(id);
    setRoomIdInput(rId || '');
    setRoomPassInput(rPass || '');
  };

  const handleSaveRoom = (id: string) => {
    updateTournament(id, {
      room_id: roomIdInput.trim(),
      room_password: roomPassInput.trim(),
    });
    setEditingId(null);
  };

  const handleCancel = (id: string, title: string) => {
    if (confirm(`Are you sure you want to cancel "${title}"? All registered participants will receive an automatic demo refund.`)) {
      cancelTournament(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Tournament Directory & Control</h2>
          <p className="text-xs text-gray-400">
            Manage live matches, edit room credentials, audit slots, or cancel tournaments.
          </p>
        </div>

        <Link
          href="/admin/tournaments/new"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-emerald-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Tournament</span>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div className="space-y-3">
          {tournaments.map((t) => {
            const isEditing = editingId === t.id;
            const isCancelled = t.status === 'cancelled';
            const isCompleted = t.status === 'completed';

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isCancelled
                    ? 'bg-red-950/20 border-red-900/40 opacity-75'
                    : isCompleted
                    ? 'bg-slate-950/60 border-gray-800/80'
                    : 'bg-gray-950/80 border-gray-800'
                }`}
              >
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-white">{t.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-gray-300">
                      {t.match_type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-900 text-emerald-400 border border-emerald-500/30">
                      {t.map}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'live'
                          ? 'bg-red-600 text-white'
                          : t.status === 'upcoming'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'completed'
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatMatchTime(t.match_time)}
                    </span>
                    <span>•</span>
                    <span>
                      Slots:{' '}
                      <strong className="text-white">
                        {t.current_slots}/{t.max_slots}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Entry: <strong className="text-white">{formatBDT(t.entry_fee)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Prize: <strong className="text-emerald-400">{formatBDT(t.prize_pool)}</strong>
                    </span>
                  </div>
                </div>

                {/* Center: Room Credentials */}
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={roomIdInput}
                      onChange={(e) => setRoomIdInput(e.target.value)}
                      placeholder="Room ID"
                      className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-xs w-28 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={roomPassInput}
                      onChange={(e) => setRoomPassInput(e.target.value)}
                      placeholder="Password"
                      className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-xs w-24 outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleSaveRoom(t.id)}
                      className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg font-bold"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs flex items-center justify-between gap-3 min-w-[200px]">
                    <div>
                      <p className="font-mono text-white text-xs">
                        ID: <span className="text-emerald-400 font-bold">{t.room_id || 'Not Set'}</span>
                      </p>
                      <p className="font-mono text-gray-400 text-[11px]">
                        Pass: <span className="text-orange-400">{t.room_password || 'Not Set'}</span>
                      </p>
                    </div>

                    {!isCancelled && !isCompleted && (
                      <button
                        onClick={() => startEditRoom(t.id, t.room_id, t.room_password)}
                        className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold border border-gray-700"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                    title="View Public Match Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/admin/players?tournamentId=${t.id}`}
                    className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1.5 transition-colors"
                    title="View Registered Players"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Slots ({t.current_slots})</span>
                  </Link>

                  {!isCancelled && !isCompleted && (
                    <button
                      onClick={() => handleCancel(t.id, t.title)}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white border border-red-900/60 transition-colors"
                      title="Cancel Tournament & Refund Players"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
