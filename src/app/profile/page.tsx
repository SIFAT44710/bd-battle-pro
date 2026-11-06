'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { formatMatchTime } from '@/lib/utils';
import { BDT } from '@/components/common/BDT';
import SifrPayModal from '@/components/wallet/SifrPayModal';
import {
  User,
  Wallet,
  History,
  Gamepad2,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CheckCircle2,
  Crown,
  Zap,
  Swords,
  Gift,
  Copy,
  Clock,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Share2,
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, transactions, participants, tournaments, addBalance } = useDemo();
  const [activeTab, setActiveTab] = useState<'matches' | 'ledger' | 'refer' | 'settings'>('matches');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isSifrPayOpen, setIsSifrPayOpen] = useState(false);
  const [sifrPayMode, setSifrPayMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [demoTopUpAlert, setDemoTopUpAlert] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#0C101A] border border-[#1E2536] flex items-center justify-center mx-auto text-gray-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Login Required</h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
          Please login or select a demo player account from the top banner to view your user panel.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // User's joined tournaments
  const userParticipants = participants.filter((p) => p.user_id === currentUser.id);
  const joinedTournaments = userParticipants.map((p) => {
    const tourney = tournaments.find((t) => t.id === p.tournament_id);
    return {
      participant: p,
      tournament: tourney,
    };
  }).filter((item) => item.tournament !== undefined);

  // User's transaction records
  const userTransactions = transactions.filter((tx) => tx.user_id === currentUser.id);

  // Atomic Balances
  const totalBalance = currentUser.demo_balance;
  const winningBalance = Math.min(totalBalance, 150);
  const depositBalance = Math.max(0, totalBalance - winningBalance);

  const referralCode = currentUser.ign.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'BBP77';
  const referralLink = `https://bd-battle-pro.vercel.app/?ref=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleDemoTopUp = () => {
    addBalance(500, 'Demo Wallet Top-up (+৳500)', 'demo_deposit');
    setDemoTopUpAlert(true);
    setTimeout(() => setDemoTopUpAlert(false), 3000);
  };

  const openDeposit = () => {
    setSifrPayMode('deposit');
    setIsSifrPayOpen(true);
  };

  const openWithdraw = () => {
    setSifrPayMode('withdraw');
    setIsSifrPayOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-20">
      {/* 1. USER PROFILE IDENTITY HEADER (RRR Esports Style) */}
      <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0A0D16] border border-[#1E2536] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left: Avatar & Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FF2438] via-rose-600 to-[#00A3FF] p-[2px] flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-red-950/50 shrink-0">
              <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
                <span className="drop-shadow text-white">{currentUser.full_name[0]}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentUser.full_name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950/80 text-[#FF2438] border border-red-500/30">
                  {currentUser.role}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Player
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-300">
                <span className="flex items-center gap-1 font-mono text-[#00A3FF] font-bold">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                  IGN: {currentUser.ign}
                </span>
                <span>•</span>
                <span className="font-mono text-gray-400">Free Fire UID: {currentUser.ff_uid}</span>
                <span>•</span>
                <span className="text-gray-400">{currentUser.phone}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={openDeposit}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Add Money</span>
            </button>

            <button
              onClick={openWithdraw}
              className="px-4 py-2.5 rounded-xl bg-[#121624] hover:bg-[#182032] text-[#00A3FF] hover:text-white text-xs font-bold border border-[#1E2536] hover:border-[#00A3FF]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={handleDemoTopUp}
              className="px-3.5 py-2.5 rounded-xl bg-[#0D111D] hover:bg-[#161C2E] text-gray-300 hover:text-white text-xs font-bold border border-[#1E2536] transition-colors flex items-center gap-1 cursor-pointer"
              title="Add ৳500 Demo Balance"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+<BDT amount={500} /> Demo</span>
            </button>
          </div>
        </div>

        {demoTopUpAlert && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ডেমো ওয়ালেটে +৳৫০০ যোগ করা হয়েছে! আপনার ব্যালেন্স আপডেট হয়েছে।</span>
          </div>
        )}
      </div>

      {/* 2. THREE-PART ATOMIC WALLET CARDS (RRR Esports Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Balance */}
        <div className="p-5 rounded-2xl bg-[#0A0D15] border border-[#1E2536] space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <Wallet className="w-4 h-4 text-[#00A3FF]" />
              Total Balance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-[#00A3FF] border border-blue-500/30 font-bold">
              All Matches
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            <BDT amount={totalBalance} />
          </div>
          <p className="text-[11px] text-gray-400">টুর্নামেন্টে এন্ট্রি নেওয়ার মোট ব্যালেন্স</p>
        </div>

        {/* Card 2: Deposit Balance */}
        <div className="p-5 rounded-2xl bg-[#0A0D15] border border-[#1E2536] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-bold uppercase tracking-wide flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-gray-300" />
              Deposit Balance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#151D2F] text-gray-300 border border-[#1E2536] font-bold">
              bKash / Nagad
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-200">
            <BDT amount={depositBalance} />
          </div>
          <p className="text-[11px] text-gray-400">SifrPay দিয়ে ডিপোজিট করা মূল টাকা</p>
        </div>

        {/* Card 3: Winning Cash */}
        <div className="p-5 rounded-2xl bg-[#0A0D15] border-2 border-emerald-500/40 space-y-1.5 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              Winning Cash
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-black">
              Withdrawable
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            <BDT amount={winningBalance} />
          </div>
          <p className="text-[11px] text-emerald-300">বুয়াহ ও কিল থেকে অর্জিত টাকা (উইথড্রযোগ্য)</p>
        </div>
      </div>

      {/* 3. USER PANEL TABS (RRR Esports Style: My Matches / Ledger / Refer / Settings) */}
      <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#0A0D16] border border-[#1E2536] space-y-6 shadow-xl">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#1E2536] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#121624]'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>My Matches (Joined)</span>
            {joinedTournaments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/60 text-white">
                {joinedTournaments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#121624]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Wallet Ledger & Transactions</span>
          </button>

          <button
            onClick={() => setActiveTab('refer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'refer'
                ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#121624]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Refer & Earn (Bonus)</span>
          </button>
        </div>

        {/* TAB 1: MY MATCHES (Joined Tournaments List) */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">
                Registered in <strong className="text-white">{joinedTournaments.length}</strong> tournaments
              </span>
              <Link href="/tournaments" className="text-[#00A3FF] hover:underline font-bold flex items-center gap-1">
                <span>Browse More Matches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {joinedTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedTournaments.map(({ participant, tournament }) => {
                  if (!tournament) return null;
                  const isLive = tournament.status === 'live';
                  const isCompleted = tournament.status === 'completed';

                  return (
                    <div
                      key={tournament.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#07090F] border border-[#1E2536] hover:border-[#FF2438]/50 transition-all space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#121726] text-white border border-[#1E2536]">
                            {tournament.match_type}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#00A3FF] bg-[#121726] border border-[#00A3FF]/30">
                            {tournament.map}
                          </span>
                        </div>

                        <div>
                          {isLive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FF2438] text-white animate-pulse">
                              LIVE NOW
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                              COMPLETED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/70 text-[#00A3FF] border border-blue-500/30">
                              UPCOMING
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm sm:text-base text-white">
                          {tournament.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#00A3FF]" />
                          <span>Match Time: {formatMatchTime(tournament.match_time)}</span>
                        </p>
                      </div>

                      {/* Slot Badge & Prize Pool */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0B0F19] border border-[#1E2536] text-center text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Your Assigned Slot</span>
                          <span className="font-black text-amber-400 block mt-0.5">
                            Slot #{participant.slot_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Prize Pool</span>
                          <span className="font-black text-[#FF2438] block mt-0.5">
                            <BDT amount={tournament.prize_pool} />
                          </span>
                        </div>
                      </div>

                      {/* Room Vault Link */}
                      <Link
                        href={`/tournaments/${tournament.id}#room-vault`}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00A3FF] to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Open Room Vault (ID & Password)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#07090F] border border-[#1E2536] space-y-3">
                <Swords className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">You have not joined any tournament yet</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Browse our active Free Fire matches and secure your slot to compete for cash rewards.
                </p>
                <Link
                  href="/tournaments"
                  className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white font-bold text-xs shadow-md"
                >
                  Join a Tournament Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WALLET LEDGER & TRANSACTIONS */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">
                Logged <strong className="text-white">{userTransactions.length}</strong> transactions
              </span>
              <div className="flex gap-2">
                <button onClick={openDeposit} className="text-[#00A3FF] hover:underline font-bold">
                  + Deposit
                </button>
                <span>•</span>
                <button onClick={openWithdraw} className="text-emerald-400 hover:underline font-bold">
                  Withdraw
                </button>
              </div>
            </div>

            {userTransactions.length > 0 ? (
              <div className="space-y-2">
                {userTransactions.map((tx) => {
                  const isCredit =
                    tx.type === 'demo_deposit' ||
                    tx.type === 'prize_payout' ||
                    tx.type === 'demo_refund';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between text-xs hover:border-[#1E2A44] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200">{tx.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatMatchTime(tx.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-mono font-black text-sm ${
                            isCredit ? 'text-emerald-400' : 'text-[#FF2438]'
                          }`}
                        >
                          {isCredit ? '+' : '-'} <BDT amount={tx.amount} />
                        </p>
                        <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase bg-[#121624] text-gray-400 border border-[#1E2536]">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">
                No transactions recorded yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: REFER & EARN (RRR Style) */}
        {activeTab === 'refer' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0E1322] to-blue-950/40 border border-[#1E2536] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto font-black text-xl">
                🎁
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                রেফার করুন এবং বোনাস ক্যাশ জিতে নিন!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                আপনার রেফারেল লিংক আপনার বন্ধুদের সাথে শেয়ার করুন। প্রতি বন্ধু সাইন-আপ করে ম্যাচ খেললে আপনি পাবেন <strong className="text-emerald-400"><BDT amount={10} /></strong> ফ্রি ওয়ালেট বোনাস!
              </p>

              {/* Referral Link Box */}
              <div className="max-w-md mx-auto p-2 rounded-xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-gray-300 truncate px-2 select-all">
                  {referralLink}
                </span>
                <button
                  onClick={copyReferral}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF2438] hover:bg-red-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Refer Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Total Referred</span>
                <div className="text-2xl font-black text-white">3 Friends</div>
                <p className="text-[10px] text-gray-500">Joined via your link</p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Bonus Earned</span>
                <div className="text-2xl font-black text-emerald-400"><BDT amount={30} /></div>
                <p className="text-[10px] text-gray-500">Credited to wallet</p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090F] border border-[#1E2536] space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Commission Rate</span>
                <div className="text-2xl font-black text-[#00A3FF]">৳10 / friend</div>
                <p className="text-[10px] text-gray-500">Instant on first match</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SifrPay Deposit & Withdraw Modal */}
      <SifrPayModal
        isOpen={isSifrPayOpen}
        onClose={() => setIsSifrPayOpen(false)}
        initialMode={sifrPayMode}
      />
    </div>
  );
}
