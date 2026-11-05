'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { ShieldAlert, RefreshCw, UserCheck, CheckCircle2, Crown } from 'lucide-react';

export default function DemoBanner() {
  const { currentUser, demoAccounts, switchUser, resetDemoData } = useDemo();

  return (
    <div className="bg-gradient-to-r from-red-950/70 via-[#0A0D14] to-blue-950/70 border-b border-red-500/20 px-3 py-1.5 text-xs text-gray-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-500/20 text-[#FF2438] font-black px-2.5 py-0.5 rounded-full border border-red-500/40 text-[10px] tracking-wider uppercase">
            <ShieldAlert className="w-3 h-3 text-[#FF2438]" />
            BBP DEMO ENGINE
          </span>
          <span className="hidden sm:inline text-gray-400 text-[11px]">
            Simulated Free Fire Esports Operations. Zero real deposits required.
          </span>
        </div>

        {/* Right: Quick Switcher */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-gray-400 text-[11px] hidden md:inline font-bold">Persona:</span>
          {demoAccounts.map((acc) => {
            const isActive = currentUser?.id === acc.id;
            const isAdmin = acc.profile.role === 'admin';
            return (
              <button
                key={acc.id}
                onClick={() => switchUser(acc.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-md shadow-red-950/60 border border-red-400/50'
                    : 'bg-[#10141F] text-gray-300 hover:bg-[#161C2C] border border-[#1E2536]'
                }`}
                title={acc.description}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isAdmin ? (
                  <Crown className="w-3 h-3 text-amber-400" />
                ) : (
                  <UserCheck className="w-3 h-3 text-gray-400" />
                )}
                <span>
                  {acc.profile.full_name.split(' ')[0]} ({acc.profile.role})
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              if (confirm('Reset all demo tournaments, slots, and balances to fresh seed state?')) {
                resetDemoData();
              }
            }}
            className="px-2 py-1 bg-[#10141F] hover:bg-red-950/60 hover:text-red-300 text-gray-400 rounded-lg text-[11px] border border-[#1E2536] hover:border-red-800 transition-colors flex items-center gap-1"
            title="Reset to fresh seed state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
