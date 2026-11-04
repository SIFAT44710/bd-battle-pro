'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { formatBDT } from '@/lib/utils';
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
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useDemo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Tournaments', href: '/tournaments', icon: Swords },
    { label: 'My Matches', href: '/my-tournaments', icon: Trophy },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ label: 'Admin Panel', href: '/admin', icon: Shield });
  }

  const isActive = (path: string) => {
    if (path === '/tournaments' && pathname === '/tournaments') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Swords className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-white">BD BATTLE</span>
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent font-black text-lg">
                PRO
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-emerald-400/80 font-bold -mt-1 uppercase">
              Powered by Sifr Esports
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Wallet & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Demo Wallet Balance Pill */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 transition-colors group"
                title="Your Demo BDT Wallet Balance"
              >
                <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-sm tracking-tight text-white">
                  {formatBDT(currentUser.demo_balance)}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase">
                  Demo
                </span>
              </Link>

              {/* User IGN Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-xs text-emerald-400">
                    {currentUser.full_name[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-200 leading-tight flex items-center gap-1">
                      {currentUser.ign}
                      {currentUser.role === 'admin' && (
                        <span className="text-[9px] bg-orange-500/20 text-orange-400 font-bold px-1 rounded">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">UID: {currentUser.ff_uid}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatBDT(currentUser.demo_balance)}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg bg-gray-800/80 border border-gray-700"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-[#090D16] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {currentUser ? (
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
                <p className="text-[11px] text-emerald-400 font-mono">
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
                className="py-2 text-center text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-sm font-bold text-slate-950 bg-emerald-500 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
