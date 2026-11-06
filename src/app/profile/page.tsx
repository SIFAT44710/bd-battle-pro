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
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, transactions, participants, addBalance } = useDemo();
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [isSifrPayOpen, setIsSifrPayOpen] = useState(false);
  const [sifrPayMode, setSifrPayMode] = useState<'deposit' | 'withdraw'>('deposit');

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Login Required</h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
          Please login or select a demo player account from the top banner to view your profile and wallet.
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

  const userTransactions = transactions.filter((tx) => tx.user_id === currentUser.id);
  const userMatchesCount = participants.filter((p) => p.user_id === currentUser.id).length;

  const handleDemoTopUp = () => {
    // Add ৳500 demo balance without resetting user or wiping transactions!
    addBalance(500, 'Demo Wallet Top-up (+৳500)', 'demo_deposit');
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 3000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0C101A] border border-[#1E2536] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FF2438] via-rose-600 to-[#00A3FF] p-[2px] flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-red-950/50">
              <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
                <span className="drop-shadow text-white">{currentUser.full_name[0]}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentUser.full_name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950/60 text-[#FF2438] border border-red-500/30">
                  {currentUser.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1 font-mono text-[#00A3FF] font-bold">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                  IGN: {currentUser.ign}
                </span>
                <span>•</span>
                <span className="font-mono">Free Fire UID: {currentUser.ff_uid}</span>
              </div>
            </div>
          </div>

          {/* Quick Balance & SifrPay Actions */}
          <div className="p-4 rounded-2xl bg-[#07090F] border border-[#1E2536] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-[#00A3FF]" />
                Demo Wallet Balance
              </p>
              <div className="text-2xl font-black text-[#00A3FF] mt-0.5">
                <BDT amount={currentUser.demo_balance} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={openDeposit}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF2438] to-red-600 hover:from-red-500 hover:to-red-600 text-white text-xs font-black shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>SifrPay Deposit</span>
              </button>

              <button
                onClick={openWithdraw}
                className="px-3.5 py-2 rounded-xl bg-[#00A3FF]/20 hover:bg-[#00A3FF]/30 text-[#00A3FF] text-xs font-bold border border-[#00A3FF]/40 transition-colors flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>

              <button
                onClick={handleDemoTopUp}
                className="px-3 py-2 rounded-xl bg-[#121622] hover:bg-[#1E2536] text-gray-300 hover:text-white text-xs font-bold border border-[#1E2536] transition-colors flex items-center gap-1.5"
                title="Add ৳500 Demo Balance directly"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="flex items-center gap-1">
                  +<BDT amount={500} /> Demo
                </span>
              </button>
            </div>
          </div>
        </div>

        {topUpSuccess && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Demo wallet credited with +৳500! Updated balance is ready to use.</span>
          </div>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Tournaments Joined</p>
          <p className="text-2xl font-black text-white font-mono">{userMatchesCount}</p>
          <p className="text-[11px] text-gray-400">Total tournament registrations</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Free Fire Identity</p>
          <p className="text-lg font-black text-[#00A3FF] font-mono truncate">{currentUser.ign}</p>
          <p className="text-[11px] text-gray-400">UID: {currentUser.ff_uid}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Platform Security</p>
          <p className="text-lg font-black text-white flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#FF2438]" />
            Protected
          </p>
          <p className="text-[11px] text-[#00A3FF] font-medium">15-Minute Room Vault Enabled</p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E2536] pb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#00A3FF]" />
            Transaction Ledger (SifrPay & Tournament Settlements)
          </h3>
          <span className="text-xs text-gray-400">
            {userTransactions.length} records logged
          </span>
        </div>

        {userTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {userTransactions.map((tx) => {
              const isCredit = tx.type === 'demo_deposit' || tx.type === 'prize_payout' || tx.type === 'demo_refund';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">
            No transactions found for this demo account.
          </p>
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
