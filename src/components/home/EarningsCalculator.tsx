'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BDT } from '@/components/common/BDT';
import {
  Calculator,
  Crown,
  Flame,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Trophy,
} from 'lucide-react';

type MatchFormat = 'Solo' | 'Duo' | 'Squad' | 'Clash Squad';

interface FormatConfig {
  entryFee: number;
  perKill: number;
  rankPrizes: {
    first: number;
    second: number;
    third: number;
    unranked: number;
  };
  description: string;
}

const FORMAT_CONFIGS: Record<MatchFormat, FormatConfig> = {
  Solo: {
    entryFee: 30,
    perKill: 10,
    rankPrizes: {
      first: 600,
      second: 300,
      third: 150,
      unranked: 0,
    },
    description: '1 vs 47 Battle Royale • High kill potential • 100% individual glory',
  },
  Duo: {
    entryFee: 40,
    perKill: 12,
    rankPrizes: {
      first: 900,
      second: 500,
      third: 200,
      unranked: 0,
    },
    description: '2-Player Synergy • Tactical revive points • Split bounty pool',
  },
  Squad: {
    entryFee: 50,
    perKill: 15,
    rankPrizes: {
      first: 1200,
      second: 600,
      third: 300,
      unranked: 0,
    },
    description: '4-Player Full Team Rush • High tier competitive • Biggest prize pools',
  },
  'Clash Squad': {
    entryFee: 50,
    perKill: 0,
    rankPrizes: {
      first: 1000,
      second: 0,
      third: 0,
      unranked: 0,
    },
    description: '4v4 Fast-Paced Rounds • Winner Takes All • No kill bounty',
  },
};

export default function EarningsCalculator() {
  const [selectedFormat, setSelectedFormat] = useState<MatchFormat>('Squad');
  const [expectedKills, setExpectedKills] = useState<number>(6);
  const [placement, setPlacement] = useState<'first' | 'second' | 'third' | 'unranked'>('first');

  const config = FORMAT_CONFIGS[selectedFormat];
  const rankPrize = config.rankPrizes[placement];
  const killBounty = selectedFormat === 'Clash Squad' ? 0 : expectedKills * config.perKill;
  const totalGross = rankPrize + killBounty;
  const netProfit = totalGross - config.entryFee;
  const roiMultiplier = config.entryFee > 0 ? (totalGross / config.entryFee).toFixed(1) : '0';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0A0E17] border border-gray-800/80 p-6 sm:p-10 shadow-2xl">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 bg-[#FF2438]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-24 w-96 h-96 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF2438]/15 text-[#FF2E4D] border border-[#FF2438]/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              Kill & Booyah Earnings Calculator
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Calculate your projected BDT earnings before entering the battle arena. Our transparent prize formula guarantees instant payouts for every verified kill and placement.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-slate-950/70 px-4 py-2 rounded-xl border border-gray-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Real-time BDT payout formula</span>
          </div>
        </div>

        {/* Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 bg-slate-950/60 p-6 sm:p-7 rounded-2xl border border-gray-800/80">
            {/* Step 1: Format Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>1. Select Match Format</span>
                <span className="text-[11px] font-normal text-gray-400 font-sans">
                  Entry Fee: <BDT amount={config.entryFee} />
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Solo', 'Duo', 'Squad', 'Clash Squad'] as MatchFormat[]).map((fmt) => {
                  const isSelected = selectedFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setSelectedFormat(fmt);
                        if (fmt === 'Clash Squad' && (placement === 'second' || placement === 'third')) {
                          setPlacement('first');
                        }
                      }}
                      className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 to-[#FF2438] text-white border-[#FF2438] shadow-lg shadow-red-600/30 scale-[1.02]'
                          : 'bg-slate-900/80 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <span>{fmt}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                        <BDT amount={FORMAT_CONFIGS[fmt].entryFee} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 bg-slate-900/50 p-2.5 rounded-lg border border-gray-800/50">
                {config.description}
              </p>
            </div>

            {/* Step 2: Placement Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-300">
                2. Target Placement
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'first', label: '#1 Booyah', icon: Crown, color: 'text-amber-400' },
                  { id: 'second', label: '2nd Place', icon: Trophy, color: 'text-slate-300', disabled: selectedFormat === 'Clash Squad' },
                  { id: 'third', label: '3rd Place', icon: Trophy, color: 'text-amber-600', disabled: selectedFormat === 'Clash Squad' },
                  { id: 'unranked', label: 'Kills Only', icon: Flame, color: 'text-red-400' },
                ].map((item) => {
                  const isSelected = placement === item.id;
                  const Icon = item.icon;
                  if (item.disabled) return null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlacement(item.id as any)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-md shadow-sky-500/20'
                          : 'bg-slate-900/80 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Expected Kills Slider (Disabled for Clash Squad) */}
            {selectedFormat !== 'Clash Squad' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>3. Target Kills ({expectedKills})</span>
                  </label>
                  <span className="text-xs font-bold text-red-400 font-mono">
                    {expectedKills} Kills × <BDT amount={config.perKill} /> = <BDT amount={killBounty} />
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={expectedKills}
                    onChange={(e) => setExpectedKills(parseInt(e.target.value) || 0)}
                    className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF2438] focus:outline-none"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0 Kills</span>
                  <span>5 Kills</span>
                  <span>10 Kills</span>
                  <span>15 Kills</span>
                  <span>20 Kills (Max)</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/50 border border-gray-800 text-xs text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Clash Squad is a fast round-based mode. Payout is awarded directly for match victory!</span>
              </div>
            )}
          </div>

          {/* Results Projection Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-gray-800 p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div>
                <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Projected Earnings</p>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Payout Breakdown
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-mono">
                  {roiMultiplier}x ROI
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Rank Placement Prize:
                </span>
                <span className="font-mono font-bold text-white">
                  <BDT amount={rankPrize} />
                </span>
              </div>

              {selectedFormat !== 'Clash Squad' && (
                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    Kill Bounty ({expectedKills} × <BDT amount={config.perKill} />):
                  </span>
                  <span className="font-mono font-bold text-white">
                    <BDT amount={killBounty} />
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-400 pt-1">
                <span>Entry Fee (Deducted):</span>
                <span className="font-mono text-gray-400">
                  - <BDT amount={config.entryFee} />
                </span>
              </div>
            </div>

            {/* Big Total Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-extrabold text-gray-400">Net Estimated Profit:</span>
                <div className="text-right">
                  <div className={`text-2xl sm:text-3xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netProfit >= 0 ? '+' : ''} <BDT amount={netProfit} />
                  </div>
                  <p className="text-[10px] text-gray-500">Gross Return: <BDT amount={totalGross} /></p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/tournaments"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-[#FF2438] to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Join a {selectedFormat} Match Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="text-[11px] text-center text-gray-500">
              ⚡ Instant automated SifrPay wallet withdrawal upon match result approval
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}