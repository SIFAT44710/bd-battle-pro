import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart, Crown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1E2536] bg-[#05060A] text-gray-400 text-xs pb-20 md:pb-8 pt-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F131C] border border-[#1E2536] p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="BD Battle Pro"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow-[0_0_8px_rgba(255,36,56,0.5)]"
                />
              </div>
              <span className="font-black text-base text-white tracking-wider">
                BD BATTLE <span className="bg-gradient-to-r from-[#FF2438] to-[#00A3FF] bg-clip-text text-transparent">PRO</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[13px]">
              Bangladesh&apos;s Next-Gen Free Fire Tournament Management Platform. Time-gated room credentials,
              automated slot reservation, and transparent competitive esports operations.
            </p>
            <p className="text-[11px] text-[#00A3FF] font-extrabold tracking-wide flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Powered by Sifr Esports Bangladesh
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-sm mb-3 uppercase tracking-wider">Platform Hub</h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/tournaments" className="hover:text-[#FF2438] transition-colors">
                  All Tournaments
                </Link>
              </li>
              <li>
                <Link href="/tournaments?status=upcoming" className="hover:text-[#FF2438] transition-colors">
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link href="/my-tournaments" className="hover:text-[#00A3FF] transition-colors">
                  My Joined Tournaments
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#00A3FF] transition-colors">
                  Player Profile & Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Tournament Formats */}
          <div>
            <h4 className="text-white font-black text-sm mb-3 uppercase tracking-wider">Free Fire Formats</h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/tournaments?type=Squad" className="hover:text-[#FF2438] transition-colors">
                  Squad Rush (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Solo" className="hover:text-[#FF2438] transition-colors">
                  Solo Survival (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Duo" className="hover:text-[#00A3FF] transition-colors">
                  Duo Warfare (48 Slots)
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=Clash+Squad" className="hover:text-[#00A3FF] transition-colors">
                  Clash Squad 4v4 Blitz (16 Slots)
                </Link>
              </li>
            </ul>
          </div>

          {/* Fair Play & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#FF2438]" />
              Fair Play Guarantee
            </h4>
            <p className="text-[12px] leading-relaxed text-gray-400">
              Room credentials are cryptographically protected and released exactly 15 minutes before match start
              to registered players only. Anti-emulator rules strictly enforced.
            </p>
            <div className="p-2.5 rounded-xl bg-[#0F131C] border border-[#1E2536] text-[11px] text-gray-300">
              Official Currency: <span className="text-[#FF2438] font-black">BDT (৳ / Taka)</span>.
              Protected by Sifr Esports anti-scam integrity protocol.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1E2536] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 BD Battle Pro. All rights reserved. Sifr Esports Bangladesh.</p>
          <p className="flex items-center gap-1 text-gray-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Bangladeshi Esports Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
