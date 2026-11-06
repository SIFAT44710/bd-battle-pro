'use client';

import React from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';
import { BDT } from '@/components/common/BDT';
import {
  X,
  Home,
  User,
  Swords,
  PlusCircle,
  ArrowUpRight,
  History,
  Gift,
  Headphones,
  LogOut,
  Shield,
  Crown,
  Gamepad2,
  ChevronRight,
  Wallet,
  Zap,
} from 'lucide-react';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export default function UserDrawer({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenWithdraw,
}: UserDrawerProps) {
  const { currentUser, logout, participants } = useDemo();

  if (!isOpen || !currentUser) return null;

  const userMatchesCount = participants.filter((p) => p.user_id === currentUser.id).length;

  // Approximate deposit vs winnings for demo display
  const totalBalance = currentUser.demo_balance;
  const winningBalance = Math.min(totalBalance, 150);
  const depositBalance = Math.max(0, totalBalance - winningBalance);

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'My Account / Profile', href: '/profile', icon: User },
    { label: 'My Matches', href: '/my-tournaments', icon: Swords, badge: userMatchesCount > 0 ? `${userMatchesCount}` : undefined },
    {
      label: 'Add Money (Deposit)',
      action: () => {
        onClose();
        onOpenDeposit();
      },
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: 'Withdraw Money',
      action: () => {
        onClose();
        onOpenWithdraw();
      },
      icon: ArrowUpRight,
    },
    { label: 'Withdraw & Ledger List', href: '/profile?tab=ledger', icon: History },
    { label: 'Refer & Earn', href: '/profile?tab=refer', icon: Gift },
    { label: 'Support (Telegram / WA)', href: 'https://t.me', external: true, icon: Headphones },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ label: 'Admin Hub', href: '/admin', icon: Shield });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Slide-in from right) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-[#0A0D15] border-l border-[#1E2536] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          
          {/* 1. Header (User Identity) */}
          <div className="p-5 border-b border-[#1E2536] bg-[#07090F] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  User Panel
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-[#121624] hover:bg-[#1E2536] text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF2438] via-rose-600 to-[#00A3FF] p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full bg-[#0A0D15] rounded-[14px] flex items-center justify-center font-black text-xl text-white">
                  {currentUser.full_name[0]}
                </div>
              </div>

              <div className="space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-white truncate">
                    {currentUser.full_name}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-950/80 text-[#FF2438] border border-red-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{currentUser.phone || 'Verified Player'}</p>
                <p className="text-xs font-mono font-bold text-[#00A3FF] truncate flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                  <span>{currentUser.ign}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">UID: {currentUser.ff_uid}</span>
                </p>
              </div>
            </div>

            {/* 2. Wallet Balance Summary Bar (RRR Esports Style) */}
            <div className="p-3.5 rounded-2xl bg-[#0F1422] border border-[#1E2536] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5 font-bold">
                  <Wallet className="w-3.5 h-3.5 text-[#00A3FF]" />
                  Total Wallet Balance
                </span>
                <span className="text-base font-black text-white">
                  <BDT amount={totalBalance} />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2536] text-center text-xs">
                <div className="p-2 rounded-xl bg-[#080B12] border border-[#1E2536]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Deposit Balance</span>
                  <span className="font-black text-gray-200 mt-0.5 block">
                    <BDT amount={depositBalance} />
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#080B12] border border-[#1E2536]">
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold">Winning Cash</span>
                  <span className="font-black text-emerald-400 mt-0.5 block">
                    <BDT amount={winningBalance} />
                  </span>
                </div>
              </div>

              {/* 2 Quick SifrPay Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Money</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenWithdraw();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#121624] hover:bg-[#182032] text-[#00A3FF] hover:text-white font-bold text-xs border border-[#1E2536] hover:border-[#00A3FF]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Navigation List (RRR Esports Exact Menu Items) */}
          <nav className="p-4 space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.action) {
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      item.highlight
                        ? 'bg-red-500/15 text-white border border-red-500/30 hover:bg-red-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-[#121624]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.highlight ? 'text-[#FF2438]' : 'text-[#00A3FF]'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                );
              }

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#121624] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#121624] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#00A3FF]" />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* 4. Footer (Logout) */}
          <div className="p-4 border-t border-[#1E2536] bg-[#07090F]">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-900/80 font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout from BD Battle Pro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
