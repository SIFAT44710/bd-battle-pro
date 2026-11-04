'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { Swords, Flame, Gamepad2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useDemo();

  const [fullName, setFullName] = useState('');
  const [ign, setIgn] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && ign && ffUid && email) {
      registerUser({
        fullName,
        ign: ign.trim(),
        ffUid: ffUid.trim(),
        email,
      });
      router.push('/tournaments');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <Swords className="w-6 h-6 text-slate-950 font-black" />
        </div>
        <h1 className="text-2xl font-black text-white">Create Player Profile</h1>
        <p className="text-xs text-gray-400">
          Join BD Battle Pro and receive <strong className="text-emerald-400">৳500 Demo Balance</strong> immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sifat Bin Shahjahan"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            Free Fire In-Game Name (IGN) <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={ign}
            onChange={(e) => setIgn(e.target.value)}
            placeholder="e.g. 亗TANVIR亗"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">
            Free Fire end-screen OCR scans this exact name for score and prize settlement.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">
            Free Fire Numeric UID <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={ffUid}
            onChange={(e) => setFfUid(e.target.value)}
            placeholder="e.g. 2948201948"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@example.com"
            required
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
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4" />
          <span>Register & Claim ৳500 Demo</span>
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">
          Already registered?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
