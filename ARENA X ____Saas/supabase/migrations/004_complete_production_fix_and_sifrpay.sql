-- ============================================================================
-- SIFR TOURNAMENT BY SBS — MIGRATION 004: COMPLETE PRODUCTION FIX & SIFRPAY
-- Fixes all 5 critical bugs discovered in code audit:
--   1. Fixes users.role CHECK constraint ('admin', 'host_admin', 'super_admin', 'player')
--   2. Adds missing tables: games, promotions
--   3. Adds missing columns on tournaments, tenant_settings, transactions, users
--   4. Adds full Row-Level Security (RLS) policies for Player & Admin operations
--   5. Fixes approve_deposit RPC signature & adds SifrPay 1-sec auto-verification RPC
-- ============================================================================

-- 1. FIX USERS ROLE CONSTRAINT & MISSING COLUMNS
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'host_admin', 'admin', 'player'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended'));

-- 2. ADD MISSING COLUMNS TO TENANT_SETTINGS (Including SifrPay Auto-Gateway Config)
ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS app_name VARCHAR(255) DEFAULT 'Arena X Pro',
  ADD COLUMN IF NOT EXISTS min_withdraw NUMERIC(15, 2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS referral_bonus NUMERIC(15, 2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS support_contact TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway_url TEXT,
  ADD COLUMN IF NOT EXISTS sifrpay_merchant_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sifrpay_secret_key VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bkash_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nagad_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS rocket_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS telegram_group TEXT,
  ADD COLUMN IF NOT EXISTS telegram_id TEXT,
  ADD COLUMN IF NOT EXISTS facebook_page TEXT,
  ADD COLUMN IF NOT EXISTS policy_privacy TEXT,
  ADD COLUMN IF NOT EXISTS policy_terms TEXT,
  ADD COLUMN IF NOT EXISTS policy_refund TEXT,
  ADD COLUMN IF NOT EXISTS policy_fair_play TEXT;

-- 3. ADD MISSING TABLES: GAMES & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'Battle Royale',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link TEXT DEFAULT '#',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ADD MISSING COLUMNS TO TOURNAMENTS & TRANSACTIONS
ALTER TABLE public.tournaments DROP CONSTRAINT IF EXISTS tournaments_match_type_check;
ALTER TABLE public.tournaments ADD CONSTRAINT tournaments_match_type_check
  CHECK (match_type IN ('Solo', 'Duo', 'Squad', 'CS 1v1', 'CS 4v4', 'Ludo'));

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS game_name VARCHAR(255) DEFAULT 'Free Fire',
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS room_password VARCHAR(255),
  ADD COLUMN IF NOT EXISTS show_id_pass BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS admin_note TEXT,
  ADD COLUMN IF NOT EXISTS reject_reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bKash',
  ADD COLUMN IF NOT EXISTS sender_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. ENABLE RLS & ADD COMPLETE POLICIES FOR ALL TABLES
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_tenant_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'host_admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read access for games and promotions
DROP POLICY IF EXISTS "Public can view games" ON public.games;
CREATE POLICY "Public can view games" ON public.games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view promotions" ON public.promotions;
CREATE POLICY "Public can view promotions" ON public.promotions FOR SELECT USING (true);

-- Admin full access on games, promotions, tournaments, tenant_settings, users, wallets, transactions
DROP POLICY IF EXISTS "Admins manage games" ON public.games;
CREATE POLICY "Admins manage games" ON public.games FOR ALL USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins manage promotions" ON public.promotions;
CREATE POLICY "Admins manage promotions" ON public.promotions FOR ALL USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins manage tournaments" ON public.tournaments;
CREATE POLICY "Admins manage tournaments" ON public.tournaments FOR ALL USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins manage tenant_settings" ON public.tenant_settings;
CREATE POLICY "Admins manage tenant_settings" ON public.tenant_settings FOR ALL USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins view all tenant users" ON public.users;
CREATE POLICY "Admins view all tenant users" ON public.users FOR SELECT USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins update tenant users" ON public.users;
CREATE POLICY "Admins update tenant users" ON public.users FOR UPDATE USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins view all tenant wallets" ON public.wallets;
CREATE POLICY "Admins view all tenant wallets" ON public.wallets FOR SELECT USING (public.is_tenant_admin());

DROP POLICY IF EXISTS "Admins manage transactions" ON public.transactions;
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (public.is_tenant_admin());

-- Player insert policy for deposit and withdrawal requests
DROP POLICY IF EXISTS "Players create own transactions" ON public.transactions;
CREATE POLICY "Players create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. FIX approve_deposit RPC (Supports both 2-arg and 4-arg calls seamlessly)
CREATE OR REPLACE FUNCTION public.approve_deposit(
    p_transaction_id UUID,
    p_admin_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_amount NUMERIC DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_tx public.transactions%ROWTYPE;
    v_wallet public.wallets%ROWTYPE;
    v_approver UUID;
BEGIN
    v_approver := COALESCE(p_admin_id, auth.uid());

    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
    IF v_tx.status != 'pending' THEN RAISE EXCEPTION 'Transaction is already processed'; END IF;
    IF v_tx.type != 'deposit' THEN RAISE EXCEPTION 'Not a deposit transaction'; END IF;

    SELECT * INTO v_wallet FROM public.wallets
    WHERE user_id = v_tx.user_id AND tenant_id = v_tx.tenant_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'User wallet not found'; END IF;

    UPDATE public.transactions
    SET status = 'completed', approved_by = v_approver, updated_at = NOW()
    WHERE id = p_transaction_id;

    UPDATE public.wallets
    SET main_balance = main_balance + v_tx.amount, updated_at = NOW()
    WHERE id = v_wallet.id;

    INSERT INTO public.wallet_ledger (
        tenant_id, user_id, transaction_id, action_type, source,
        before_main_balance, after_main_balance,
        before_winning_cash, after_winning_cash,
        before_bonus_cash, after_bonus_cash, amount
    ) VALUES (
        v_tx.tenant_id, v_tx.user_id, p_transaction_id, 'addition', 'deposit',
        v_wallet.main_balance, v_wallet.main_balance + v_tx.amount,
        v_wallet.winning_cash, v_wallet.winning_cash,
        v_wallet.bonus_cash, v_wallet.bonus_cash,
        v_tx.amount
    );

    RETURN jsonb_build_object('success', true, 'message', 'Deposit approved and credited to wallet');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ADD SIFRPAY INSTANT DEPOSIT RPC (Credits wallet immediately when SifrPay verifies TrxID)
CREATE OR REPLACE FUNCTION public.instant_sifrpay_deposit(
    p_tenant_id UUID,
    p_user_id UUID,
    p_amount NUMERIC,
    p_trx_id VARCHAR,
    p_method VARCHAR DEFAULT 'bKash'
) RETURNS JSONB AS $$
DECLARE
    v_wallet public.wallets%ROWTYPE;
    v_tx_id UUID;
BEGIN
    -- Prevent duplicate TrxID replay across the tenant
    IF EXISTS (SELECT 1 FROM public.transactions WHERE tenant_id = p_tenant_id AND UPPER(trx_id) = UPPER(p_trx_id) AND status = 'completed') THEN
        RAISE EXCEPTION 'This Transaction ID (%) has already been used.', p_trx_id;
    END IF;

    SELECT * INTO v_wallet FROM public.wallets
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;

    INSERT INTO public.transactions (tenant_id, user_id, type, amount, trx_id, payment_method, status, notes, updated_at)
    VALUES (p_tenant_id, p_user_id, 'deposit', p_amount, UPPER(p_trx_id), p_method, 'completed', 'Auto-verified via SifrPay Gateway', NOW())
    RETURNING id INTO v_tx_id;

    UPDATE public.wallets
    SET main_balance = main_balance + p_amount, updated_at = NOW()
    WHERE id = v_wallet.id;

    INSERT INTO public.wallet_ledger (
        tenant_id, user_id, transaction_id, action_type, source,
        before_main_balance, after_main_balance,
        before_winning_cash, after_winning_cash,
        before_bonus_cash, after_bonus_cash, amount
    ) VALUES (
        p_tenant_id, p_user_id, v_tx_id, 'addition', 'sifrpay_auto_deposit',
        v_wallet.main_balance, v_wallet.main_balance + p_amount,
        v_wallet.winning_cash, v_wallet.winning_cash,
        v_wallet.bonus_cash, v_wallet.bonus_cash,
        p_amount
    );

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_wallet.main_balance + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
