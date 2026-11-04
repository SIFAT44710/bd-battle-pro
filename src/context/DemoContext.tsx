'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tournament, Participant, MatchResult, RoomCredentialResponse } from '@/types/tournament';
import { UserProfile, DemoAccount } from '@/types/user';
import { DemoTransaction } from '@/types/transaction';
import {
  INITIAL_DEMO_ACCOUNTS,
  INITIAL_TOURNAMENTS,
  INITIAL_PARTICIPANTS,
  INITIAL_MATCH_RESULTS,
  INITIAL_TRANSACTIONS,
} from '@/lib/seed-data';
import { isWithinRoomReleaseWindow, getMinutesUntilStart } from '@/lib/utils';

interface JoinResult {
  success: boolean;
  message: string;
  slotNumber?: number;
  newBalance?: number;
}

interface DemoContextType {
  currentUser: UserProfile | null;
  demoAccounts: DemoAccount[];
  tournaments: Tournament[];
  participants: Participant[];
  transactions: DemoTransaction[];
  matchResults: MatchResult[];
  switchUser: (userId: string) => void;
  login: (email: string) => boolean;
  registerUser: (data: { fullName: string; ign: string; ffUid: string; email: string }) => boolean;
  logout: () => void;
  joinTournament: (tournamentId: string, ign?: string, ffUid?: string) => Promise<JoinResult>;
  getRoomCredentials: (tournamentId: string) => RoomCredentialResponse;
  createTournament: (data: Omit<Tournament, 'id' | 'current_slots' | 'created_at'>) => Tournament;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  cancelTournament: (id: string) => void;
  publishResults: (tournamentId: string, results: Omit<MatchResult, 'id' | 'published_at'>[]) => void;
  resetDemoData: () => void;
  isRegistered: (tournamentId: string) => boolean;
  getUserSlot: (tournamentId: string) => number | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const STORAGE_KEY = 'bd_battle_pro_demo_state_v1';

function getInitialStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = getInitialStorage();
    return saved?.currentUser || INITIAL_DEMO_ACCOUNTS[0].profile;
  });

  const [demoAccounts] = useState<DemoAccount[]>(INITIAL_DEMO_ACCOUNTS);

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = getInitialStorage();
    return saved?.tournaments || INITIAL_TOURNAMENTS;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = getInitialStorage();
    return saved?.participants || INITIAL_PARTICIPANTS;
  });

  const [transactions, setTransactions] = useState<DemoTransaction[]>(() => {
    const saved = getInitialStorage();
    return saved?.transactions || INITIAL_TRANSACTIONS;
  });

  const [matchResults, setMatchResults] = useState<MatchResult[]>(() => {
    const saved = getInitialStorage();
    return saved?.matchResults || INITIAL_MATCH_RESULTS;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tournaments,
          participants,
          transactions,
          matchResults,
          currentUser,
        })
      );
    } catch (e) {
      console.warn('Could not save demo state to localStorage', e);
    }
  }, [tournaments, participants, transactions, matchResults, currentUser]);

  const switchUser = (userId: string) => {
    const acc = demoAccounts.find((a) => a.id === userId);
    if (acc) {
      setCurrentUser(acc.profile);
    }
  };

  const login = (email: string) => {
    const acc = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (acc) {
      setCurrentUser(acc.profile);
      return true;
    }
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      full_name: email.split('@')[0],
      ign: email.split('@')[0].toUpperCase(),
      ff_uid: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: 'player',
      demo_balance: 500,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newProfile);
    return true;
  };

  const registerUser = ({ fullName, ign, ffUid }: { fullName: string; ign: string; ffUid: string; email: string }) => {
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      full_name: fullName,
      ign,
      ff_uid: ffUid,
      role: 'player',
      demo_balance: 500,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newProfile);

    const welcomeTx: DemoTransaction = {
      id: `tx_${Date.now()}`,
      user_id: newProfile.id,
      type: 'demo_deposit',
      amount: 500,
      balance_after: 500,
      description: 'Initial Demo Wallet Credit (System Welcome)',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [welcomeTx, ...prev]);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isRegistered = (tournamentId: string): boolean => {
    if (!currentUser) return false;
    return participants.some(
      (p) => p.tournament_id === tournamentId && p.user_id === currentUser.id
    );
  };

  const getUserSlot = (tournamentId: string): number | null => {
    if (!currentUser) return null;
    const p = participants.find(
      (p) => p.tournament_id === tournamentId && p.user_id === currentUser.id
    );
    return p ? p.slot_number : null;
  };

  const joinTournament = async (
    tournamentId: string,
    customIgn?: string,
    customFfUid?: string
  ): Promise<JoinResult> => {
    if (!currentUser) {
      return { success: false, message: 'Please login or select a demo player first.' };
    }

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      return { success: false, message: 'Tournament not found.' };
    }

    if (tournament.status !== 'upcoming') {
      return {
        success: false,
        message: `Registration closed. Tournament status is ${tournament.status}.`,
      };
    }

    if (tournament.current_slots >= tournament.max_slots) {
      return { success: false, message: 'Tournament is already full! No slots remaining.' };
    }

    const alreadyJoined = participants.some(
      (p) => p.tournament_id === tournamentId && p.user_id === currentUser.id
    );
    if (alreadyJoined) {
      return { success: false, message: 'You are already registered for this tournament.' };
    }

    if (currentUser.demo_balance < tournament.entry_fee) {
      return {
        success: false,
        message: `Insufficient demo balance. Entry fee is ৳${tournament.entry_fee}, but your current balance is ৳${currentUser.demo_balance}.`,
      };
    }

    // Assign lowest free slot
    const takenSlots = new Set(
      participants
        .filter((p) => p.tournament_id === tournamentId)
        .map((p) => p.slot_number)
    );

    let assignedSlot = 1;
    while (takenSlots.has(assignedSlot) && assignedSlot <= tournament.max_slots) {
      assignedSlot++;
    }

    if (assignedSlot > tournament.max_slots) {
      return { success: false, message: 'All slots are occupied.' };
    }

    const newBalance = currentUser.demo_balance - tournament.entry_fee;

    const newParticipant: Participant = {
      id: `part_${Date.now()}`,
      tournament_id: tournamentId,
      user_id: currentUser.id,
      ign: customIgn || currentUser.ign,
      ff_uid: customFfUid || currentUser.ff_uid,
      slot_number: assignedSlot,
      payment_status: 'demo_paid',
      registered_at: new Date().toISOString(),
    };

    const newTx: DemoTransaction = {
      id: `tx_${Date.now()}`,
      user_id: currentUser.id,
      type: 'entry_fee',
      amount: tournament.entry_fee,
      balance_after: newBalance,
      tournament_id: tournamentId,
      tournament_title: tournament.title,
      description: `Demo Entry Fee for: ${tournament.title} (Assigned Slot #${assignedSlot})`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    setCurrentUser((prev) => (prev ? { ...prev, demo_balance: newBalance } : null));
    setParticipants((prev) => [...prev, newParticipant]);
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId ? { ...t, current_slots: t.current_slots + 1 } : t
      )
    );
    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Registration confirmed! You have been assigned Slot #${assignedSlot}.`,
      slotNumber: assignedSlot,
      newBalance,
    };
  };

  const getRoomCredentials = (tournamentId: string): RoomCredentialResponse => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      return {
        is_unlocked: false,
        match_time: '',
        minutes_until_start: 0,
        message: 'Tournament not found.',
      };
    }

    const isAdmin = currentUser?.role === 'admin';
    const isUserRegistered = currentUser
      ? participants.some(
          (p) => p.tournament_id === tournamentId && p.user_id === currentUser.id
        )
      : false;

    if (!isAdmin && !isUserRegistered) {
      return {
        is_unlocked: false,
        match_time: tournament.match_time,
        minutes_until_start: getMinutesUntilStart(tournament.match_time),
        message: 'Only registered players can access Room ID and Password.',
      };
    }

    const isWindowOpen = isWithinRoomReleaseWindow(tournament.match_time);

    if (isAdmin || isWindowOpen) {
      return {
        is_unlocked: true,
        room_id: tournament.room_id || 'Not Set Yet by Organizer',
        room_password: tournament.room_password || 'Not Set Yet',
        match_time: tournament.match_time,
        minutes_until_start: getMinutesUntilStart(tournament.match_time),
      };
    }

    return {
      is_unlocked: false,
      match_time: tournament.match_time,
      minutes_until_start: getMinutesUntilStart(tournament.match_time),
      message: 'Room credentials unlock exactly 15 minutes before match start.',
    };
  };

  const createTournament = (
    data: Omit<Tournament, 'id' | 'current_slots' | 'created_at'>
  ): Tournament => {
    const newTournament: Tournament = {
      ...data,
      id: `tourney_${Date.now()}`,
      current_slots: 0,
      created_at: new Date().toISOString(),
    };
    setTournaments((prev) => [newTournament, ...prev]);
    return newTournament;
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
  };

  const cancelTournament = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    if (!target) return;

    const registered = participants.filter((p) => p.tournament_id === id);
    const newRefundTxs: DemoTransaction[] = [];

    registered.forEach((p) => {
      newRefundTxs.push({
        id: `tx_refund_${Date.now()}_${p.slot_number}`,
        user_id: p.user_id,
        type: 'demo_refund',
        amount: target.entry_fee,
        balance_after: 0,
        tournament_id: id,
        tournament_title: target.title,
        description: `Refund for cancelled tournament: ${target.title}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    });

    setTransactions((prev) => [...newRefundTxs, ...prev]);
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t))
    );
  };

  const publishResults = (
    tournamentId: string,
    results: Omit<MatchResult, 'id' | 'published_at'>[]
  ) => {
    const target = tournaments.find((t) => t.id === tournamentId);
    if (!target) return;

    const publishedDate = new Date().toISOString();
    const newMatchResults: MatchResult[] = results.map((r, i) => ({
      ...r,
      id: `res_${Date.now()}_${i + 1}`,
      published_at: publishedDate,
    }));

    const prizeTxs: DemoTransaction[] = [];
    newMatchResults.forEach((res) => {
      if (res.user_id && res.prize_amount > 0) {
        prizeTxs.push({
          id: `tx_prize_${Date.now()}_${res.rank}`,
          user_id: res.user_id,
          type: 'prize_payout',
          amount: res.prize_amount,
          balance_after: 0,
          tournament_id: tournamentId,
          tournament_title: target.title,
          description: `Tournament Prize: Rank #${res.rank} (${res.kills} kills) in ${target.title}`,
          status: 'completed',
          created_at: publishedDate,
        });

        if (currentUser && currentUser.id === res.user_id) {
          setCurrentUser((prev) =>
            prev ? { ...prev, demo_balance: prev.demo_balance + res.prize_amount } : null
          );
        }
      }
    });

    setMatchResults((prev) => [...newMatchResults, ...prev]);
    setTransactions((prev) => [...prizeTxs, ...prev]);
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, status: 'completed' } : t))
    );
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setTournaments(INITIAL_TOURNAMENTS);
    setParticipants(INITIAL_PARTICIPANTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMatchResults(INITIAL_MATCH_RESULTS);
    setCurrentUser(INITIAL_DEMO_ACCOUNTS[0].profile);
  };

  return (
    <DemoContext.Provider
      value={{
        currentUser,
        demoAccounts,
        tournaments,
        participants,
        transactions,
        matchResults,
        switchUser,
        login,
        registerUser,
        logout,
        joinTournament,
        getRoomCredentials,
        createTournament,
        updateTournament,
        cancelTournament,
        publishResults,
        resetDemoData,
        isRegistered,
        getUserSlot,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
