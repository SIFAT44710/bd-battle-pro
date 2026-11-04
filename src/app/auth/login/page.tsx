'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { Swords, LogIn, UserCheck } from 'lucide-react';

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
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <Swords className="w-6 h-6 text-slate-950 font-black" />
        </div>
        <h1 className="text-2xl font-black text-white">Sign In to BD Battle Pro</h1>
        <p className="text-xs text-gray-400">
          Powered by Sifr Esports • Instant Room Credentials & Tournament Operations
        </p>
      </div>

      {/* 1-Click Demo Profiles */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
          <UserCheck className="w-4 h-4" />
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
              className="w-full p-2.5 rounded-xl bg-gray-950 hover:bg-emerald-950/40 border border-gray-800 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {acc.profile.full_name} ({acc.profile.role.toUpperCase()})
                </p>
                <p className="text-[10px] text-gray-400">
                  IGN: <span className="font-mono text-gray-300">{acc.profile.ign}</span> • UID:{' '}
                  {acc.profile.ff_uid}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
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
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:underline font-bold">
            Create Free Account
          </Link>
        </p>
      </form>
    </div>
  );
}
