'use client';

import React from 'react';
import { Participant } from '@/types/tournament';
import { useDemo } from '@/context/DemoContext';
import { User, ShieldCheck } from 'lucide-react';

interface SlotGridProps {
  tournamentId: string;
  maxSlots: number;
}

export default function SlotGrid({ tournamentId, maxSlots }: SlotGridProps) {
  const { participants, currentUser } = useDemo();

  const tournamentParticipants = participants.filter(
    (p) => p.tournament_id === tournamentId
  );

  // Map participants by slot number
  const slotMap = new Map<number, Participant>();
  tournamentParticipants.forEach((p) => {
    slotMap.set(p.slot_number, p);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <User className="w-4 h-4 text-[#FF2438]" />
            Room Slot Roster ({tournamentParticipants.length}/{maxSlots})
          </h4>
          <p className="text-xs text-gray-400">
            Designated room seating. Free Fire in-game names verified by BBP Esports engine.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#FF2438] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2438] shadow-sm shadow-red-500/50"></span>
            Your Slot
          </span>
          <span className="flex items-center gap-1.5 text-[#00A3FF] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A3FF]"></span>
            Booked
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-700"></span>
            Open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto pr-1">
        {Array.from({ length: maxSlots }, (_, i) => {
          const slotNum = i + 1;
          const participant = slotMap.get(slotNum);
          const isUserSlot = currentUser && participant?.user_id === currentUser.id;

          if (participant) {
            return (
              <div
                key={slotNum}
                className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isUserSlot
                    ? 'bg-red-950/40 border-[#FF2438] shadow-lg shadow-red-950/40'
                    : 'bg-[#0E1320] border-[#1E2536]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`font-black font-mono text-[11px] px-1.5 py-0.5 rounded ${
                      isUserSlot
                        ? 'bg-[#FF2438] text-white'
                        : 'bg-[#151D2F] text-[#00A3FF]'
                    }`}
                  >
                    #{slotNum}
                  </span>
                  {isUserSlot && (
                    <span className="text-[10px] font-black tracking-tight text-[#FF2438] flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      YOU
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-white truncate mt-0.5" title={participant.ign}>
                  {participant.ign}
                </p>
                <p className="text-[10px] text-gray-400 font-mono truncate">
                  UID: {participant.ff_uid}
                </p>
              </div>
            );
          }

          return (
            <div
              key={slotNum}
              className="p-2.5 rounded-xl border border-dashed border-[#1E2536] bg-[#07090F]/50 text-xs flex flex-col justify-between opacity-60"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-gray-500">#{slotNum}</span>
                <span className="text-[10px] text-gray-500">Open</span>
              </div>
              <p className="text-gray-500 italic text-[11px] mt-1">Available</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
