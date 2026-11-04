'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import {
  LayoutDashboard,
  Swords,
  PlusCircle,
  Users,
  Trophy,
  History,
  Lock,
  UserCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, switchUser, demoAccounts } = useDemo();

  const adminAccount = demoAccounts.find((a) => a.profile.role === 'admin');
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center mx-auto text-red-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Organizer Access Restricted</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
            The BD Battle Pro Admin Panel requires verified Tournament Organizer credentials.
            Current user: <strong className="text-white">{currentUser?.full_name || 'Guest'}</strong> (
            {currentUser?.role || 'unauthenticated'}).
          </p>
        </div>

        {adminAccount && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-left space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <UserCheck className="w-4 h-4" />
              <span>Switch to Organizer Persona (Demo Mode)</span>
            </div>
            <p className="text-[11px] text-gray-400">
              In this demo build, click below to instantly adopt the Organizer Admin role:
            </p>
            <button
              onClick={() => switchUser(adminAccount.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <span>Unlock Admin Panel as {adminAccount.profile.full_name}</span>
            </button>
          </div>
        )}

        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
            Return to Player Website
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Tournaments', href: '/admin/tournaments', icon: Swords },
    { label: 'Create Match', href: '/admin/tournaments/new', icon: PlusCircle },
    { label: 'Player Slots', href: '/admin/players', icon: Users },
    { label: 'Publish Results', href: '/admin/results', icon: Trophy },
    { label: 'Demo Ledger', href: '/admin/transactions', icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500 text-slate-950">
              Organizer Panel
            </span>
            <span className="text-xs text-gray-400">BD Battle Pro Ops Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Tournament Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
            <p className="text-[10px] text-emerald-400 font-mono">Role: {currentUser.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-xs">
            {currentUser.full_name[0]}
          </div>
        </div>
      </div>

      {/* Admin Horizontal Nav Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-gray-800/80">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
