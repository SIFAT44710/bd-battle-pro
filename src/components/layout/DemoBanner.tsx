'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { ShieldAlert, RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';

export default function DemoBanner() {
  const { currentUser, demoAccounts, switchUser, resetDemoData } = useDemo();

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border-b border-emerald-500/20 px-3 py-1.5 text-xs text-gray-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-gray-400">
            Simulated Free Fire Esports Ops. No real MFS or cash deposits required.
          </span>
        </div>

        {/* Right: Quick Switcher */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-gray-400 text-[11px] hidden md:inline">Test Persona:</span>
          {demoAccounts.map((acc) => {
            const isActive = currentUser?.id === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => switchUser(acc.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
                title={acc.description}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
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
            className="px-2 py-1 bg-gray-800 hover:bg-red-950/60 hover:text-red-300 text-gray-400 rounded text-[11px] border border-gray-700 hover:border-red-800 transition-colors flex items-center gap-1"
            title="Reset to fresh seed state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
