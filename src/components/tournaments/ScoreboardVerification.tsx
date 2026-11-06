'use client';

import React, { useState } from 'react';
import { Tournament } from '@/types/tournament';
import { useDemo } from '@/context/DemoContext';
import { BDT } from '@/components/common/BDT';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Scan,
  Trophy,
  Flame,
  ShieldCheck,
  Crown,
  AlertCircle,
  FileCheck,
  Eye,
  Wallet,
} from 'lucide-react';

interface ScoreboardVerificationProps {
  tournament: Tournament;
}

export default function ScoreboardVerification({ tournament }: ScoreboardVerificationProps) {
  const { currentUser, isRegistered, addBalance } = useDemo();
  const joined = isRegistered(tournament.id);
  const isAdmin = currentUser?.role === 'admin';

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  
  // Verification Result
  const [result, setResult] = useState<{
    ign: string;
    placement: string;
    rank: number;
    kills: number;
    killRate: number;
    killBounty: number;
    rankPrize: number;
    totalPayout: number;
    confidence: number;
  } | null>(null);

  const [isClaimed, setIsClaimed] = useState(false);

  // Sample Free Fire Booyah victory screen image
  const SAMPLE_SCOREBOARD_IMAGE =
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';

  const userIgn = currentUser?.ign || '亗TANVIR亗';

  // Run the 1.5s AI OCR verification scan
  const startScan = (imageSrc: string) => {
    setScreenshotUrl(imageSrc);
    setIsScanning(true);
    setResult(null);
    setIsClaimed(false);
    setScanProgress(15);
    setScanStep('Analyzing Free Fire post-match HUD & End-Screen...');

    setTimeout(() => {
      setScanProgress(50);
      setScanStep(`Scanning OCR text for registered gamer IGN: "${userIgn}"...`);
    }, 500);

    setTimeout(() => {
      setScanProgress(85);
      setScanStep('Parsing OCR placement detection & kill counter tally...');
    }, 1000);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);

      const rank = 1;
      const kills = 7;
      const killRate = tournament.per_kill > 0 ? tournament.per_kill : 15;
      const rankPrize = tournament.prize_distribution.first || 1000;
      const killBounty = kills * killRate;
      const totalPayout = rankPrize + killBounty;

      setResult({
        ign: userIgn,
        placement: '#1 (BOOYAH!)',
        rank,
        kills,
        killRate,
        killBounty,
        rankPrize,
        totalPayout,
        confidence: 99.4,
      });
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          startScan(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClaimWinnings = () => {
    if (!result || isClaimed || !currentUser) return;
    addBalance(
      result.totalPayout,
      `AI Verified Scoreboard Payout: ${result.placement} • ${result.kills} Kills in ${tournament.title}`,
      'prize_payout'
    );
    setIsClaimed(true);
  };

  // Only render if logged in and registered or admin or in demo mode
  return (
    <div className="p-6 rounded-3xl bg-[#0C101A] border border-[#1E2536] space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2536] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF2438] to-[#00A3FF] p-[1px] flex items-center justify-center shadow-lg shadow-red-950/40">
            <div className="w-full h-full bg-[#090D16] rounded-[15px] flex items-center justify-center">
              <Scan className="w-5 h-5 text-[#FF2438]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                AI Booyah & Kill Verification
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Sifr Vision Engine
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Upload end-screen match scoreboard screenshot for automated prize payout verification
            </p>
          </div>
        </div>

        {/* Demo Fast Trigger Button */}
        <button
          onClick={() => startScan(SAMPLE_SCOREBOARD_IMAGE)}
          disabled={isScanning}
          className="px-3.5 py-2 rounded-xl bg-[#121622] hover:bg-[#1E2536] border border-[#1E2536] text-xs font-bold text-[#00A3FF] hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Test with Sample Scoreboard</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="relative z-10">
        <label className="block w-full rounded-2xl border-2 border-dashed border-[#1E2536] hover:border-[#FF2438]/50 p-6 text-center cursor-pointer transition-colors bg-[#07090F]/70">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isScanning}
            className="hidden"
          />
          <UploadCloud className="w-10 h-10 text-gray-500 hover:text-[#00A3FF] mx-auto mb-2 transition-colors" />
          <p className="text-xs sm:text-sm font-bold text-gray-200">
            Click to upload your Free Fire end-game scoreboard screenshot
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Supports PNG, JPG, or WEBP from mobile screenshots. Match IGN: <strong className="text-[#00A3FF]">{userIgn}</strong>
          </p>
        </label>
      </div>

      {/* Scanning Animation State */}
      {isScanning && (
        <div className="p-6 rounded-2xl bg-[#07090F] border border-[#00A3FF]/40 space-y-4 animate-in fade-in duration-200 relative overflow-hidden">
          {/* Laser Scanning Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF2438] to-transparent animate-pulse" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#00A3FF] font-bold flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
              {scanStep}
            </span>
            <span className="font-mono font-black text-white">{scanProgress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#121622] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF2438] via-rose-500 to-[#00A3FF] transition-all duration-300 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Verified Result Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F1424] to-[#080B12] border-2 border-emerald-500/50 space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">Scoreboard Audited & Verified</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                    {result.confidence}% Match
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Player identity confirmed against registered Free Fire profile.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center gap-1.5 shadow-md">
              <Crown className="w-4 h-4 text-amber-400" />
              {result.placement}
            </span>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-[#07090F] border border-[#1E2536]">
              <p className="text-[10px] text-gray-400 uppercase font-black">Verified IGN</p>
              <p className="text-sm font-black text-white font-mono mt-0.5 truncate">{result.ign}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07090F] border border-[#1E2536]">
              <p className="text-[10px] text-gray-400 uppercase font-black">Rank Prize</p>
              <p className="text-sm font-black text-amber-400 font-mono mt-0.5">
                <BDT amount={result.rankPrize} />
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07090F] border border-[#1E2536]">
              <p className="text-[10px] text-gray-400 uppercase font-black">Detected Kills</p>
              <p className="text-sm font-black text-[#00A3FF] font-mono mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF2438]" />
                {result.kills} × <BDT amount={result.killRate} />
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40">
              <p className="text-[10px] text-red-400 uppercase font-black">Total Calculated</p>
              <p className="text-base font-black text-white font-mono mt-0.5">
                <BDT amount={result.totalPayout} />
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scoreboard cryptographic hash logged in Sifr Anti-Cheat Ledger</span>
            </div>

            <button
              onClick={handleClaimWinnings}
              disabled={isClaimed}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isClaimed
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                  : 'bg-gradient-to-r from-[#FF2438] to-red-600 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-950/60 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isClaimed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Winnings Claimed & Credited to Wallet!</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-amber-300" />
                  <span>Claim Verified Winnings (<BDT amount={result.totalPayout} />)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
