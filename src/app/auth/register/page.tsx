'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import { Flame, Gamepad2, Crown } from 'lucide-react';

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
          <h1 className="text-2xl font-black text-white">Create Player Profile</h1>
          <p className="text-xs text-gray-400 mt-1">
            Join <span className="text-bbp-gradient">BD BATTLE PRO</span> & claim{' '}
            <strong className="text-sky-400 font-mono">৳500 Demo Balance</strong> immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/90 border border-gray-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sifat Bin Shahjahan"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
            Free Fire In-Game Name (IGN) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={ign}
            onChange={(e) => setIgn(e.target.value)}
            placeholder="e.g. 亗TANVIR亗"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors font-mono"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">
            Free Fire end-screen OCR scans this exact name for score and prize settlement.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Free Fire Numeric UID</span> <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={ffUid}
            onChange={(e) => setFfUid(e.target.value)}
            placeholder="e.g. 2948201948"
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors font-mono"
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
            required
            className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>Register & Claim ৳500 Demo</span>
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">
          Already registered?{' '}
          <Link href="/auth/login" className="text-sky-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
