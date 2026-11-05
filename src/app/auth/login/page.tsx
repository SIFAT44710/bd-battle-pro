'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { Swords, LogIn, UserCheck, Crown } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { demoAccounts, switchUser, login } = useDemo();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
      router.push('/tournaments');
    }
  };

  const handleDemoSelect = (userId: string) => {
    switchUser(userId);
    router.push('/tournaments');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-[#FF2438]/20 rounded-2xl blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-red-500/30 bg-[#090D16] p-1 flex items-center justify-center shadow-xl">
            <Image
              src="/logo.png"
              alt="BD Battle Pro Logo"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Sign In to <span className="text-bbp-gradient">BD BATTLE PRO</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Official Free Fire Esports Tournament & Room Vault System
          </p>
        </div>
      </div>

      {/* 1-Click Demo Profiles */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/30 space-y-3 shadow-lg shadow-red-950/20">
        <div className="flex items-center gap-1.5 text-xs text-[#00A3FF] font-bold">
          <UserCheck className="w-4 h-4 text-sky-400" />
          <span>Quick 1-Click Demo Login</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Select any pre-configured demo account to test player or admin flows immediately:
        </p>

        <div className="space-y-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => handleDemoSelect(acc.id)}
              className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-red-950/30 border border-gray-800 hover:border-red-500/40 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  {acc.profile.full_name} ({acc.profile.role.toUpperCase()})
                </p>
                <p className="text-[10px] text-gray-400">
                  IGN: <span className="font-mono text-gray-300">{acc.profile.ign}</span> • UID:{' '}
                  {acc.profile.ff_uid}
                </p>
              </div>
              <span className="text-[11px] font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                Sign In →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/80 border border-gray-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@example.com"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-sky-400 hover:underline font-bold">
            Create Free Account
          </Link>
        </p>
      </form>
    </div>
  );
}
