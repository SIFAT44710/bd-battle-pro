'use client';

import { useSyncExternalStore } from 'react';
import { getMatchCountdown, CountdownState } from '@/lib/utils';

// Shared timer across all components for 60fps / 1s precision without render cascading
let currentTimestamp = typeof window !== 'undefined' ? Date.now() : 1793889000000;
const subscribers = new Set<() => void>();

if (typeof window !== 'undefined') {
  setInterval(() => {
    currentTimestamp = Date.now();
    subscribers.forEach((callback) => callback());
  }, 1000);
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return currentTimestamp;
}

function getServerSnapshot() {
  return 1793889000000;
}

export function useCurrentTimestamp(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCountdown(matchTimeIso: string): CountdownState {
  const now = useCurrentTimestamp();
  return getMatchCountdown(matchTimeIso, now);
}
