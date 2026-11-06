'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { formatBDT } from '@/lib/utils';
import { BDT } from '@/components/common/BDT';
import SifrPayModal from '@/components/wallet/SifrPayModal';
import {
  Swords,
  Trophy,
  User,
  Shield,
  Wallet,
  Menu,
  X,
  LogIn,
  LogOut,
  Flame,
  Crown,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useDemo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const navLinks = [
    { label: 'Free Fire Matches', href: '/tournaments', icon: Swords },
    { label: 'My Matches', href: '/my-tournaments', icon: Trophy },
    { label: 'Wallet & Profile', href: '/profile', icon: User },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ label: 'Admin Hub', href: '/admin', icon: Shield });
  }

  const isActive = (path: string) => {
    if (path === '/tournaments' && pathname === '/tournaments') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07080C]/95 backdrop-blur-md border-b border-[#1E2536]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with User Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-[#0F131C] border border-[#1E2536] p-1 flex items-center justify-center overflow-hidden shadow-lg shadow-red-950/40 group-hover:border-red-500/50 transition-all">
            <Image
              src="/logo.png"
              alt="BD Battle Pro"
              width={40}
              height={40}
              className="object-contain drop-shadow-[0_0_8px_rgba(255,36,56,0.6)] group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-lg tracking-wider text-white">BD BATTLE</span>
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">
                PRO
              </span>
            </div>
            <p className="text-[9px] tracking-widest text-[#00A3FF] font-extrabold uppercase mt-1 flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 text-amber-400 inline" />
              Powered by Sifr Esports
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-red-500/15 text-white border border-red-500/40 shadow-sm shadow-red-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#121622]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FF2438]' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Wallet & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Demo Wallet Balance Pill with Red-Blue Theme */}
              <button
                type="button"
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F131C] border border-[#1E2536] text-gray-200 hover:border-[#00A3FF]/50 transition-all group cursor-pointer"
                title="Click to Open SifrPay Deposit & Withdraw Modal"
              >
                <Wallet className="w-4 h-4 text-[#00A3FF] group-hover:scale-110 transition-transform" />
                <span className="font-black text-sm tracking-tight text-white">
                  <BDT amount={currentUser.demo_balance} />
                </span>
                <span className="text-[9px] bg-red-500/20 text-[#FF2438] font-black px-1.5 py-0.5 rounded uppercase border border-red-500/30">
                  Demo
                </span>
              </button>

              {/* User IGN Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#1E2536]">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-blue-600 p-[1px] flex items-center justify-center font-black text-xs text-white">
                    <span className="w-full h-full bg-[#0F131C] rounded-[7px] flex items-center justify-center font-extrabold text-xs text-gray-200">
                      {currentUser.full_name[0]}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-100 leading-tight flex items-center gap-1.5">
                      {currentUser.ign}
                      {currentUser.role === 'admin' && (
                        <span className="text-[9px] bg-red-500/20 text-[#FF2438] font-bold px-1.5 rounded border border-red-500/40">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">UID: {currentUser.ff_uid}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#121622] rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-[#00A3FF]" />
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-[#FF2438] to-[#E01B2E] hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-lg shadow-lg shadow-red-950/50 transition-all flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F131C] border border-[#1E2536] text-white text-xs font-bold">
              <Wallet className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>{formatBDT(currentUser.demo_balance)}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white rounded-lg bg-[#0F131C] border border-[#1E2536]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF2438]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E2536] bg-[#07080C] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold ${
                  active
                    ? 'bg-red-500/15 text-white border border-red-500/40'
                    : 'text-gray-300 hover:bg-[#121622]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FF2438]' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}

          {currentUser ? (
            <div className="pt-3 border-t border-[#1E2536] flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-white">{currentUser.full_name}</p>
                <p className="text-[11px] text-[#00A3FF] font-mono">
                  IGN: {currentUser.ign} | UID: {currentUser.ff_uid}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-red-400 bg-red-950/40 rounded border border-red-900 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-sm font-bold text-gray-300 bg-[#121622] border border-[#1E2536] rounded-lg"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-sm font-black text-white bg-gradient-to-r from-[#FF2438] to-[#E01B2E] rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SifrPay Deposit & Withdraw Modal accessible from Navbar */}
      <SifrPayModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        initialMode="deposit"
      />
    </header>
  );
}
