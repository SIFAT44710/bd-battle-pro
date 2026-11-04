export type TournamentType = 'Solo' | 'Duo' | 'Squad' | 'Clash Squad';
export type TournamentMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';
export type TournamentStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface PrizeDistribution {
  first: number;
  second: number;
  third: number;
  per_kill?: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  match_type: TournamentType;
  map: TournamentMap;
  entry_fee: number;
  prize_pool: number;
  per_kill: number;
  prize_distribution: PrizeDistribution;
  max_slots: number;
  current_slots: number;
  status: TournamentStatus;
  match_time: string; // ISO string
  room_id?: string | null;
  room_password?: string | null;
  rules?: string;
  banner_url?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Participant {
  id: string;
  tournament_id: string;
  user_id: string;
  ign: string;
  ff_uid: string;
  slot_number: number;
  payment_status: 'demo_paid' | 'free' | 'refunded';
  registered_at: string;
}

export interface MatchResult {
  id: string;
  tournament_id: string;
  rank: number;
  user_id?: string;
  ign: string;
  kills: number;
  prize_amount: number;
  published_at: string;
}

export interface RoomCredentialResponse {
  is_unlocked: boolean;
  room_id?: string | null;
  room_password?: string | null;
  match_time: string;
  minutes_until_start: number;
  message?: string;
  unlock_at?: string;
}
