'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { formatBDT, formatMatchTime } from '@/lib/utils';
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
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, transactions, participants, registerUser } = useDemo();
  const [topUpSuccess, setTopUpSuccess] = useState(false);

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
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const userTransactions = transactions.filter((tx) => tx.user_id === currentUser.id);
  const userMatchesCount = participants.filter((p) => p.user_id === currentUser.id).length;

  const handleDemoTopUp = () => {
    // Add ৳500 demo balance
    registerUser({
      fullName: currentUser.full_name,
      ign: currentUser.ign,
      ffUid: currentUser.ff_uid,
      email: `${currentUser.ign.toLowerCase()}@demo.com`,
    });
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1 flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl shadow-emerald-500/20">
              {currentUser.full_name[0]}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentUser.full_name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentUser.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  IGN: {currentUser.ign}
                </span>
                <span>•</span>
                <span className="font-mono">Free Fire UID: {currentUser.ff_uid}</span>
              </div>
            </div>
          </div>

          {/* Quick Balance Display */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between sm:justify-end gap-5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Demo Wallet Balance
              </p>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {formatBDT(currentUser.demo_balance)}
              </p>
            </div>

            <button
              onClick={handleDemoTopUp}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/40 transition-colors flex items-center gap-1.5"
              title="Add ৳500 Demo Balance to test joining more matches"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+৳500 Demo</span>
            </button>
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
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Tournaments Joined</p>
          <p className="text-2xl font-black text-white font-mono">{userMatchesCount}</p>
          <p className="text-[11px] text-gray-400">Total tournament registrations</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Free Fire Identity</p>
          <p className="text-lg font-black text-emerald-400 font-mono truncate">{currentUser.ign}</p>
          <p className="text-[11px] text-gray-400">UID: {currentUser.ff_uid}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Platform Security</p>
          <p className="text-lg font-black text-white flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Protected
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">15-Minute Room Vault Enabled</p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Demo Transaction Ledger
          </h3>
          <span className="text-xs text-gray-400">
            {userTransactions.length} records recorded
          </span>
        </div>

        {userTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {userTransactions.map((tx) => {
              const isCredit = tx.type === 'demo_deposit' || tx.type === 'prize_payout' || tx.type === 'demo_refund';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-gray-950/70 border border-gray-800/80 flex items-center justify-between text-xs"
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
                        isCredit ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatBDT(tx.amount)}
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
    </div>
  );
}
