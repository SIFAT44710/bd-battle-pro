import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency strictly in Bangladeshi Taka (BDT ৳)
 * Never formats in USD.
 */
export function formatBDT(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
  return `৳${formatted}`;
}

/**
 * Format match start time in Bangladesh Standard Time (BST)
 */
export function formatMatchTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Checks if current time is within the 15-minute room credentials release window.
 * Formula: (match_time - now) <= 15 minutes
 */
export function isWithinRoomReleaseWindow(matchTimeIso: string, currentTimestamp?: number): boolean {
  try {
    const matchTime = new Date(matchTimeIso).getTime();
    const now = currentTimestamp ?? Date.now();
    const diffMinutes = (matchTime - now) / (1000 * 60);
    // Credentials stay accessible up to 120 minutes after match time
    return diffMinutes <= 15 && diffMinutes >= -120;
  } catch {
    return false;
  }
}

/**
 * Returns exact minutes until match start
 */
export function getMinutesUntilStart(matchTimeIso: string, currentTimestamp?: number): number {
  try {
    const matchTime = new Date(matchTimeIso).getTime();
    const now = currentTimestamp ?? Date.now();
    return Math.round((matchTime - now) / (1000 * 60));
  } catch {
    return 999;
  }
}

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isWithin15m: boolean;
  label: string;
}

/**
 * Formats a countdown object based on given reference timestamp
 */
export function getMatchCountdown(matchTimeIso: string, currentTimestamp?: number): CountdownState {
  const matchTime = new Date(matchTimeIso).getTime();
  const now = currentTimestamp ?? Date.now();
  const diffMs = matchTime - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isStarted: true,
      isWithin15m: true,
      label: 'Match Live / In Progress',
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const isWithin15m = diffMs <= 15 * 60 * 1000;

  let label = '';
  if (days > 0) {
    label = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m left`;
  } else {
    label = `${minutes}m ${seconds}s left`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isStarted: false,
    isWithin15m,
    label,
  };
}
