export type TransactionType = 'entry_fee' | 'demo_deposit' | 'prize_payout' | 'demo_refund' | 'withdrawal';

export interface DemoTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number; // In BDT ৳
  balance_after: number;
  tournament_id?: string;
  tournament_title?: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}
