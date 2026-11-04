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
    { label: 'Tournaments', href: '/tournaments', icon: Swords },
    { label: 'My Matches', href: '/my-tournaments', icon: Trophy },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (currentUser?.role === 'admin') {
    items.push({ label: 'Admin', href: '/admin', icon: Shield });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#090D16]/95 backdrop-blur-xl border-t border-gray-800/80 px-2 py-2 safe-bottom">
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
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
