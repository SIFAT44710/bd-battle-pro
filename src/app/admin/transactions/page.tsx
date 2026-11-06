'use client';

import React, { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { formatMatchTime } from '@/lib/utils';
import { BDT } from '@/components/common/BDT';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Filter } from 'lucide-react';
import { TransactionType } from '@/types/transaction';

export default function AdminTransactionsPage() {
  const { transactions } = useDemo();
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'All') return true;
    return tx.type === filterType;
  });

  const totalEntryFees = transactions
    .filter((t) => t.type === 'entry_fee')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPrizesPaid = transactions
    .filter((t) => t.type === 'prize_payout')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Demo Financial Ledger & Auditing</h2>
          <p className="text-xs text-gray-400">
            Immutable log of all entry fee debits, prize payouts, and simulated wallet deposits.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-gray-800 text-xs text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Demo Ledger Protected</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase">Total Entry Fees Collected</p>
          <p className="text-2xl font-black text-white font-mono"><BDT amount={totalEntryFees} /></p>
          <p className="text-[10px] text-gray-400">From tournament join fees</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase">Total Prize Payouts</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            <BDT amount={totalPrizesPaid} />
          </p>
          <p className="text-[10px] text-gray-400">Credited to winner wallets</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 space-y-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase">Transaction Records</p>
          <p className="text-2xl font-black text-orange-400 font-mono">{transactions.length}</p>
          <p className="text-[10px] text-gray-400">100% audit coverage</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-gray-400 font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {(['All', 'entry_fee', 'prize_payout', 'demo_deposit', 'demo_refund'] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white'
              }`}
            >
              {type === 'All'
                ? 'All Transactions'
                : type === 'entry_fee'
                ? 'Entry Fees'
                : type === 'prize_payout'
                ? 'Prize Payouts'
                : type === 'demo_deposit'
                ? 'Deposits'
                : 'Refunds'}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredTxs.map((tx) => {
                const isCredit =
                  tx.type === 'demo_deposit' ||
                  tx.type === 'prize_payout' ||
                  tx.type === 'demo_refund';

                return (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          isCredit
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-200 font-sans max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-[11px] truncate max-w-[120px]">
                      {tx.user_id}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'} <BDT amount={tx.amount} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-400 text-[10px] uppercase font-bold">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-[11px] font-sans">
                      {formatMatchTime(tx.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
