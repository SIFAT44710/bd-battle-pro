'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BDT } from '@/components/common/BDT';
import {
  ShieldAlert,
  Power,
  CheckCircle2,
  AlertTriangle,
  Server,
  Users,
  DollarSign,
  Lock,
  Unlock,
  PlusCircle,
  ExternalLink,
  Crown,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  guild: string;
  domain: string;
  plan: 'Professional' | 'Enterprise';
  booking_paid: number;
  total_price: number;
  due_amount: number;
  due_date: string;
  monthly_mrr: number;
  mrr_status: 'Paid' | 'Overdue';
  status: 'active' | 'suspended';
}

export default function SBSSuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 'tenant-01',
      name: 'BD Battle Pro (Official Showcase)',
      guild: 'Sifr Esports',
      domain: 'bd-battle-pro.vercel.app',
      plan: 'Professional',
      booking_paid: 35000,
      total_price: 35000,
      due_amount: 0,
      due_date: 'Paid in Full',
      monthly_mrr: 2000,
      mrr_status: 'Paid',
      status: 'active',
    },
    {
      id: 'tenant-02',
      name: '7X Gaming Arena',
      guild: '7X ESPORTS BD',
      domain: '7xgaming.com',
      plan: 'Professional',
      booking_paid: 20000,
      total_price: 35000,
      due_amount: 15000,
      due_date: 'Due in 5 Days',
      monthly_mrr: 2000,
      mrr_status: 'Paid',
      status: 'active',
    },
    {
      id: 'tenant-03',
      name: 'Viper Army Free Fire',
      guild: 'VIPER_COMMUNITY',
      domain: 'viper-battle.app',
      plan: 'Professional',
      booking_paid: 5000,
      total_price: 35000,
      due_amount: 15000,
      due_date: 'OVERDUE (Defaulted)',
      monthly_mrr: 2000,
      mrr_status: 'Overdue',
      status: 'suspended',
    },
  ]);

  const [previewSuspended, setPreviewSuspended] = useState(false);

  const toggleKillSwitch = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === 'active' ? 'suspended' : 'active';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const totalClients = tenants.length;
  const activeClients = tenants.filter((t) => t.status === 'active').length;
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === 'active' ? t.monthly_mrr : 0), 0);
  const pendingDues = tenants.reduce((acc, t) => acc + t.due_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2536] pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Sifr Administration • Super-Admin Control</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 flex items-center gap-3">
            <span>SBS Master Kill-Switch & Multi-Tenant Hub</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 text-[#FF2438] border border-red-500/40 uppercase font-black">
              Restricted /sbs
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            ম্যানেজ করুন আপনার সমস্ত হোয়াইট-লেবেল ক্লায়েন্ট, কিস্তি ট্র্যাকিং এবং ১-ক্লিক রিমোট কিল-সুইচ।
          </p>
        </div>

        <button
          onClick={() => setPreviewSuspended(!previewSuspended)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
            previewSuspended
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-[#121624] text-gray-300 border-[#1E2536] hover:border-red-500/50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{previewSuspended ? 'Close Suspended Preview' : 'Preview Client Suspended Screen'}</span>
        </button>
      </div>

      {/* Suspended Screen Simulator */}
      {previewSuspended && (
        <div className="p-8 sm:p-12 rounded-3xl bg-red-950/90 border-2 border-red-500 text-center space-y-4 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-black/60 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-900 text-white">
              Platform Temporarily Suspended
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Platform Temporarily Suspended
            </h2>
            <p className="text-xs sm:text-sm text-red-200">
              Please clear pending dues or maintenance fees with Sifr Administration to reactivate your tournament website, APK, and player wallet.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-red-950 font-black text-xs shadow-xl"
            >
              <span>Contact Sifr Administration (WhatsApp)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Tenants / Clients</span>
            <Users className="w-4 h-4 text-[#00A3FF]" />
          </div>
          <div className="text-2xl font-black text-white">{totalClients} Brands</div>
          <p className="text-[11px] text-emerald-400 font-bold">{activeClients} Active • {totalClients - activeClients} Suspended</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Monthly Passive MRR</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            <BDT amount={totalMRR} /> / month
          </div>
          <p className="text-[11px] text-gray-400">Server & SifrPay AI Maintenance</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Pending Installments</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            <BDT amount={pendingDues} />
          </div>
          <p className="text-[11px] text-gray-400">15-Day Post-Launch Receivables</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Kill-Switch Status</span>
            <Power className="w-4 h-4 text-[#FF2438]" />
          </div>
          <div className="text-2xl font-black text-white">READY</div>
          <p className="text-[11px] text-emerald-400 font-bold">1-Click Instant Lock/Unlock</p>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="p-6 rounded-3xl bg-[#0C101A] border border-[#1E2536] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Active Tenant Deployments</span>
          </h2>

          <button
            onClick={() => alert('SOP 15-Minute Deployment Modal: Enter Brand Name, Domain, and SifrPay SIM credentials to auto-provision.')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Provision New Tenant (15-Min SOP)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07090F] text-gray-400 uppercase font-black border-y border-[#1E2536]">
              <tr>
                <th className="py-3 px-4">Brand / Client</th>
                <th className="py-3 px-4">Domain / App</th>
                <th className="py-3 px-4">Plan & Booking</th>
                <th className="py-3 px-4">Installment Due</th>
                <th className="py-3 px-4">Monthly MRR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Kill-Switch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2536]">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-[#121624] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-black text-white">{t.name}</div>
                    <div className="text-[10px] text-gray-400">{t.guild}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    <a
                      href={`https://${t.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00A3FF] hover:underline flex items-center gap-1"
                    >
                      <span>{t.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white">{t.plan}</span>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Paid: <BDT amount={t.booking_paid} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {t.due_amount > 0 ? (
                      <div>
                        <div className="font-black text-amber-400"><BDT amount={t.due_amount} /></div>
                        <div className="text-[10px] text-red-400 font-bold">{t.due_date}</div>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Full Paid
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white"><BDT amount={t.monthly_mrr} />/mo</div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        t.mrr_status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {t.mrr_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleKillSwitch(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ml-auto ${
                        t.status === 'active'
                          ? 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-800'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {t.status === 'active' ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Suspend (Kill)</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
