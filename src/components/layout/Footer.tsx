import React from 'react';
import Link from 'next/link';
import { Swords, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-[#070A11] text-gray-400 text-xs pb-20 md:pb-8 pt-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Swords className="w-4 h-4 text-slate-950 font-black" />
              </div>
              <span className="font-black text-base text-white tracking-wider">
                BD BATTLE <span className="text-emerald-400">PRO</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[13px]">
              Bangladesh&apos;s Next-Gen Free Fire Tournament Management Platform. Time-gated room credentials,
              automated slot reservation, and transparent competitive esports operations.
            </p>
            <p className="text-[11px] text-emerald-400/90 font-semibold tracking-wide">
              Powered by Sifr Esports Bangladesh
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/tournaments" className="hover:text-emerald-400 transition-colors">
                  All Tournaments
                </Link>
              </li>
              <li>
                <Link href="/tournaments?status=upcoming" className="hover:text-emerald-400 transition-colors">
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link href="/my-tournaments" className="hover:text-emerald-400 transition-colors">
                  My Joined Tournaments
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition-colors">
                  Player Profile & Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Tournament Formats */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Free Fire Formats</h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/tournaments?type=Squad" className="hover:text-emerald-400 transition-colors">
                  Squad Rush (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Solo" className="hover:text-emerald-400 transition-colors">
                  Solo Survival (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Duo" className="hover:text-emerald-400 transition-colors">
                  Duo Warfare (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Clash+Squad" className="hover:text-emerald-400 transition-colors">
                  Clash Squad 4v4 Blitz (16 Slots)
                </Link>
              </li>
            </ul>
          </div>

          {/* Fair Play & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Fair Play & Security
            </h4>
            <p className="text-[12px] leading-relaxed text-gray-400">
              Room credentials are cryptographically protected and released exactly 15 minutes before match start
              to registered players only. Anti-emulator rules strictly enforced.
            </p>
            <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px] text-gray-400">
              Official Currency: <span className="text-emerald-400 font-bold">BDT (৳ / Taka)</span>.
              This demo build operates with simulated test ledger funds.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 BD Battle Pro. All rights reserved. Sifr Esports Bangladesh.</p>
          <p className="flex items-center gap-1 text-gray-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Bangladeshi Esports Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
