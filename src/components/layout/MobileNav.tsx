'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { Home, Swords, Trophy, User, Shield } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { currentUser } = useDemo();

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Matches', href: '/tournaments', icon: Swords },
    { label: 'My Rooms', href: '/my-tournaments', icon: Trophy },
    { label: 'Wallet', href: '/profile', icon: User },
  ];

  if (currentUser?.role === 'admin') {
    items.push({ label: 'Admin', href: '/admin', icon: Shield });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#07080C]/95 backdrop-blur-xl border-t border-[#1E2536] px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-white font-extrabold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600/30 to-blue-600/30 text-[#FF2438] border border-red-500/40 shadow-sm shadow-red-500/20'
                    : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF2438]' : ''}`} />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-white font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
