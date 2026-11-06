'use client';

import React, { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { BDT } from '@/components/common/BDT';
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface SifrPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'deposit' | 'withdraw';
}

type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

const METHODS: Record<PaymentMethod, { name: string; color: string; border: string; bg: string; number: string }> = {
  bkash: {
    name: 'bKash',
    color: '#D12053',
    border: 'border-[#D12053]/40',
    bg: 'bg-[#D12053]/10',
    number: '01700-000000',
  },
  nagad: {
    name: 'Nagad',
    color: '#F7921E',
    border: 'border-[#F7921E]/40',
    bg: 'bg-[#F7921E]/10',
    number: '01700-000000',
  },
  rocket: {
    name: 'Rocket',
    color: '#8C3494',
    border: 'border-[#8C3494]/40',
    bg: 'bg-[#8C3494]/10',
    number: '01700-000000',
  },
};

export default function SifrPayModal({
  isOpen,
  onClose,
  initialMode = 'deposit',
}: SifrPayModalProps) {
  const { currentUser, addBalance, withdrawBalance } = useDemo();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(initialMode);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState<string>('200');
  const [trxId, setTrxId] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('150');
  const [recipientNumber, setRecipientNumber] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const currentMethodConfig = METHODS[selectedMethod];

  // Helper to copy merchant number
  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(currentMethodConfig.number);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {}
  };

  // Helper to fill a random realistic TrxID
  const handleFillDemoTrx = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTrxId(id);
    setErrorMessage('');
  };

  // Handle deposit submit with 1-second animated verification
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 50 || amt > 5000) {
      setErrorMessage('Please enter an amount between ৳50 and ৳5,000.');
      return;
    }
    if (!trxId || trxId.trim().length < 6) {
      setErrorMessage('Please enter a valid TrxID (or click "Fill Demo TrxID").');
      return;
    }

    setIsVerifying(true);

    // 1-second simulated SifrPay OCR & Gateway verification
    setTimeout(() => {
      setIsVerifying(false);
      addBalance(
        amt,
        `SifrPay Auto-Verified Deposit via ${currentMethodConfig.name} (TrxID: ${trxId.toUpperCase().trim()})`,
        'demo_deposit'
      );
      setVerificationSuccess(true);
      setTimeout(() => {
        setVerificationSuccess(false);
        setTrxId('');
        onClose();
      }, 1500);
    }, 1000);
  };

  // Handle withdrawal submit
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 50) {
      setErrorMessage('Minimum withdrawal amount is ৳50.');
      return;
    }
    if (amt > currentUser.demo_balance) {
      setErrorMessage(`Insufficient balance. Your current balance is ৳${currentUser.demo_balance}.`);
      return;
    }
    if (!recipientNumber || recipientNumber.length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      const res = withdrawBalance(amt, recipientNumber, currentMethodConfig.name);
      if (res.success) {
        setWithdrawSuccess(true);
        setTimeout(() => {
          setWithdrawSuccess(false);
          setRecipientNumber('');
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#090D16] border border-[#1E2536] shadow-2xl shadow-red-950/40 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#1E2536] flex items-center justify-between bg-[#0C101A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2438] to-[#00A3FF] p-[1px] flex items-center justify-center shadow-lg shadow-red-950/50">
              <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#FF2438]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">SifrPay Gateway</h3>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                  1-Sec Auto-Verify
                </span>
              </div>
              <p className="text-xs text-gray-400">Zero-Fee BDT Wallet Settlement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#121622] hover:bg-[#1A2234] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Deposit vs Withdraw */}
        <div className="grid grid-cols-2 p-2 bg-[#07090F] border-b border-[#1E2536]">
          <button
            onClick={() => {
              setMode('deposit');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'deposit'
                ? 'bg-gradient-to-r from-[#FF2438] to-red-600 text-white shadow-lg shadow-red-950/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Add Balance (Deposit)</span>
          </button>

          <button
            onClick={() => {
              setMode('withdraw');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'withdraw'
                ? 'bg-gradient-to-r from-[#00A3FF] to-blue-600 text-white shadow-lg shadow-blue-950/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Winnings</span>
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="px-6 py-2.5 bg-[#0C101A] border-b border-[#1E2536] flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1.5 font-bold">
            <Wallet className="w-3.5 h-3.5 text-[#00A3FF]" />
            Current Wallet Balance:
          </span>
          <span className="font-mono font-black text-white text-sm">
            <BDT amount={currentUser.demo_balance} />
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Method Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(METHODS) as PaymentMethod[]).map((m) => {
                const conf = METHODS[m];
                const isSelected = selectedMethod === m;
                // For withdraw, Rocket can be disabled or active
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${conf.border} ${conf.bg} ring-2 ring-[${conf.color}]/50 shadow-md`
                        : 'border-[#1E2536] bg-[#0C101A] hover:bg-[#121622] text-gray-400'
                    }`}
                  >
                    <p
                      className="font-black text-sm tracking-wide"
                      style={{ color: isSelected ? conf.color : '#E2E8F0' }}
                    >
                      {conf.name}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Instant</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DEPOSIT FORM */}
          {mode === 'deposit' ? (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Send Money Number Display */}
              <div className="p-3.5 rounded-2xl bg-[#07090F] border border-[#1E2536] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {currentMethodConfig.name} Send Money Number
                  </p>
                  <p className="font-mono font-black text-base text-white mt-0.5 tracking-wider">
                    {currentMethodConfig.number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-lg bg-[#121622] hover:bg-[#1E2536] text-xs font-bold text-gray-300 border border-[#1E2536] flex items-center gap-1.5 transition-colors"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#00A3FF]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">Deposit Amount (৳)</label>
                  <span className="text-[10px] text-gray-400">Min ৳50 • Max ৳5,000</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#FF2438]">৳</span>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-sm font-mono focus:outline-none focus:border-[#FF2438] transition-colors"
                    placeholder="200"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2 pt-1">
                  {[100, 300, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset.toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#0C101A] hover:bg-[#121622] border border-[#1E2536] text-[11px] font-mono font-bold text-gray-300 hover:text-white transition-colors"
                    >
                      +৳{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* TrxID Input & Demo Helper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">10-Digit Transaction ID (TrxID)</label>
                  <button
                    type="button"
                    onClick={handleFillDemoTrx}
                    className="text-[11px] font-bold text-[#00A3FF] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Fill Demo TrxID
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-[#00A3FF] transition-colors placeholder:text-gray-600"
                  placeholder="e.g. BLM984X7Q2"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || verificationSuccess}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF2438] to-red-600 hover:from-red-500 hover:to-red-600 disabled:opacity-60 text-white font-black text-sm shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SifrPay Verifying TrxID ({trxId})...</span>
                  </>
                ) : verificationSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span>Verified & Deposited to Wallet!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Verify & Add <BDT amount={depositAmount || 0} /></span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* WITHDRAW FORM */
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Recipient Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">
                  {currentMethodConfig.name} Recipient Number (11-digit)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-sm font-mono tracking-wider focus:outline-none focus:border-[#00A3FF] transition-colors"
                  placeholder="017XXXXXXXX"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">Withdraw Amount (৳)</label>
                  <span className="text-[10px] text-gray-400">Available: ৳{currentUser.demo_balance}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#00A3FF]">৳</span>
                  <input
                    type="number"
                    min="50"
                    max={currentUser.demo_balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white text-sm font-mono focus:outline-none focus:border-[#00A3FF] transition-colors"
                    placeholder="150"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[100, 300, 500].filter((v) => v <= currentUser.demo_balance).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWithdrawAmount(preset.toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#0C101A] hover:bg-[#121622] border border-[#1E2536] text-[11px] font-mono font-bold text-gray-300 hover:text-white transition-colors"
                    >
                      ৳{preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(currentUser.demo_balance.toString())}
                    className="px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/40 border border-[#00A3FF]/40 text-[11px] font-mono font-bold text-[#00A3FF] transition-colors"
                  >
                    Max (All)
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isWithdrawing || withdrawSuccess || currentUser.demo_balance < 50}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00A3FF] to-blue-600 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 text-white font-black text-sm shadow-xl shadow-blue-950/60 transition-all flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payout to {recipientNumber}...</span>
                  </>
                ) : withdrawSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span>Payout Settled Successfully!</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Request Payout of <BDT amount={withdrawAmount || 0} /></span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SifrPay Security Footer */}
          <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SifrPay Anti-Fraud Encryption Active
            </span>
            <span className="flex items-center gap-1 font-mono text-gray-300">
              <Clock className="w-3 h-3 text-[#00A3FF]" />
              Instant 0% Payout Fee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
