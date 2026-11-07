-- ==================================================
-- SIFR TOURNAMENT BY SBS - INITIAL SCHEMA (V2)
-- Description: Core tables, RLS policies, Auth triggers, and Full RPCs
-- ==================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- 1. GLOBAL & TENANT MANAGEMENT
-- ==================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verified_domain VARCHAR(255) UNIQUE,
    verified_subdomain VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    primary_color VARCHAR(50) DEFAULT '#0F172A',
    secondary_color VARCHAR(50) DEFAULT '#1E293B',
    logo_url TEXT,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    withdraw_enabled BOOLEAN DEFAULT TRUE,
    deposit_enabled BOOLEAN DEFAULT TRUE,
    registration_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_number VARCHAR(50),
    custom_css TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player' CHECK (role IN ('super_admin', 'host_admin', 'player')),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    user_app_id VARCHAR(50),
    referral_code VARCHAR(50),
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_app_id),
    UNIQUE(tenant_id, referral_code),
    UNIQUE(tenant_id, username)
);

-- ==================================================
-- 2. FINANCIAL CORE
-- ==================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    main_balance NUMERIC(15, 2) DEFAULT 0.00,
    winning_cash NUMERIC(15, 2) DEFAULT 0.00,
    bonus_cash NUMERIC(15, 2) DEFAULT 0.00,
    locked_balance NUMERIC(15, 2) DEFAULT 0.00,
    total_earned NUMERIC(15, 2) DEFAULT 0.00,
    total_withdrawn NUMERIC(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'join_fee', 'prize', 'referral', 'refund')),
    amount NUMERIC(15, 2) NOT NULL,
    trx_id VARCHAR(255),
    reference_id UUID,
    notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, trx_id)
);

CREATE TABLE wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    before_main_balance NUMERIC(15, 2) NOT NULL,
    after_main_balance NUMERIC(15, 2) NOT NULL,
    before_winning_cash NUMERIC(15, 2) NOT NULL,
    after_winning_cash NUMERIC(15, 2) NOT NULL,
    before_bonus_cash NUMERIC(15, 2) NOT NULL,
    after_bonus_cash NUMERIC(15, 2) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referral_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 3. TOURNAMENTS
-- ==================================================

CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    match_type VARCHAR(50) NOT NULL CHECK (match_type IN ('Solo', 'Duo', 'Squad')),
    entry_fee NUMERIC(15, 2) DEFAULT 0.00,
    prize_pool NUMERIC(15, 2) DEFAULT 0.00,
    max_slots INTEGER NOT NULL,
    filled_slots INTEGER DEFAULT 0,
    per_kill NUMERIC(15, 2) DEFAULT 0.00,
    map_name VARCHAR(100),
    room_id VARCHAR(255),
    room_pass VARCHAR(255),
    room_publish_time TIMESTAMP WITH TIME ZONE,
    banner_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_data JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kills INTEGER DEFAULT 0,
    position INTEGER,
    prize NUMERIC(15, 2) DEFAULT 0.00,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 4. LOGGING & NOTIFICATIONS
-- ==================================================

CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read for tenant settings and tournaments
CREATE POLICY "Public can view active tenants" ON tenants FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view tenant settings" ON tenant_settings FOR SELECT USING (true);
CREATE POLICY "Public can view tournaments" ON tournaments FOR SELECT USING (true);

-- User specific access
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view own ledgers" ON wallet_ledger FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view participants" ON tournament_participants FOR SELECT USING (true);

-- ==================================================
-- 6. AUTHENTICATION TRIGGERS
-- ==================================================

-- Automatically create user profile and wallet when signing up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_referral_code VARCHAR(8);
    v_user_app_id VARCHAR(6);
BEGIN
    -- Extract tenant_id from user metadata, or fallback to the first active tenant
    v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::UUID;
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE status = 'active' LIMIT 1;
    END IF;

    -- Generate an 8-character referral code
    v_referral_code := substr(md5(random()::text), 1, 8);
    
    -- Generate a 6-digit user app ID
    v_user_app_id := floor(random() * (999999 - 100000 + 1) + 100000)::text;

    -- 1. Create Public User Profile
    INSERT INTO public.users (id, tenant_id, role, username, email, photo_url, user_app_id, referral_code)
    VALUES (
        new.id, 
        v_tenant_id,
        COALESCE((new.raw_user_meta_data->>'role'), 'player'),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'avatar_url',
        v_user_app_id,
        v_referral_code
    );

    -- 2. Create Multi-Layer Wallet
    INSERT INTO public.wallets (tenant_id, user_id, main_balance, winning_cash, bonus_cash)
    VALUES (
        v_tenant_id,
        new.id,
        0.00,
        0.00,
        COALESCE((new.raw_user_meta_data->>'signup_bonus')::NUMERIC, 0.00)
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================================================
-- 7. SECURE FINANCIAL RPCs
-- ==================================================

-- A. Tournament Join
CREATE OR REPLACE FUNCTION join_tournament(
    p_tournament_id UUID,
    p_tenant_id UUID,
    p_user_id UUID,
    p_team_data JSONB
) RETURNS JSONB AS $$
DECLARE
    v_entry_fee NUMERIC(15,2);
    v_filled_slots INTEGER;
    v_max_slots INTEGER;
    v_wallet wallets%ROWTYPE;
    v_amount_to_deduct NUMERIC(15,2);
    v_main_deduct NUMERIC(15,2) := 0;
    v_winning_deduct NUMERIC(15,2) := 0;
    v_bonus_deduct NUMERIC(15,2) := 0;
    v_trx_id UUID;
BEGIN
    -- 1. Lock Tournament Row
    SELECT entry_fee, filled_slots, max_slots 
    INTO v_entry_fee, v_filled_slots, v_max_slots
    FROM tournaments 
    WHERE id = p_tournament_id AND tenant_id = p_tenant_id 
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Tournament not found'; END IF;
    IF v_filled_slots >= v_max_slots THEN RAISE EXCEPTION 'Tournament is full'; END IF;

    -- 2. Lock Wallet Row
    SELECT * INTO v_wallet FROM wallets
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;

    -- 3. Calculate Deductions (Winning -> Bonus -> Main)
    v_amount_to_deduct := v_entry_fee;

    IF v_wallet.winning_cash >= v_amount_to_deduct THEN
        v_winning_deduct := v_amount_to_deduct;
        v_amount_to_deduct := 0;
    ELSE
        v_winning_deduct := v_wallet.winning_cash;
        v_amount_to_deduct := v_amount_to_deduct - v_winning_deduct;
    END IF;

    IF v_amount_to_deduct > 0 THEN
        IF v_wallet.bonus_cash >= v_amount_to_deduct THEN
            v_bonus_deduct := v_amount_to_deduct;
            v_amount_to_deduct := 0;
        ELSE
            v_bonus_deduct := v_wallet.bonus_cash;
            v_amount_to_deduct := v_amount_to_deduct - v_bonus_deduct;
        END IF;
    END IF;

    IF v_amount_to_deduct > 0 THEN
        IF v_wallet.main_balance >= v_amount_to_deduct THEN
            v_main_deduct := v_amount_to_deduct;
            v_amount_to_deduct := 0;
        ELSE
            RAISE EXCEPTION 'Insufficient total balance';
        END IF;
    END IF;

    -- 4. Update Wallet
    UPDATE wallets
    SET main_balance = main_balance - v_main_deduct,
        winning_cash = winning_cash - v_winning_deduct,
        bonus_cash = bonus_cash - v_bonus_deduct,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- 5. Record Transaction
    INSERT INTO transactions (tenant_id, user_id, type, amount, status, notes)
    VALUES (p_tenant_id, p_user_id, 'join_fee', -v_entry_fee, 'completed', 'Joined tournament')
    RETURNING id INTO v_trx_id;

    -- 6. Record Wallet Ledger Audit
    INSERT INTO wallet_ledger (
        tenant_id, user_id, transaction_id, action_type, source,
        before_main_balance, after_main_balance,
        before_winning_cash, after_winning_cash,
        before_bonus_cash, after_bonus_cash, amount
    ) VALUES (
        p_tenant_id, p_user_id, v_trx_id, 'deduction', 'tournament_join',
        v_wallet.main_balance, v_wallet.main_balance - v_main_deduct,
        v_wallet.winning_cash, v_wallet.winning_cash - v_winning_deduct,
        v_wallet.bonus_cash, v_wallet.bonus_cash - v_bonus_deduct,
        -v_entry_fee
    );

    -- 7. Add to Participants & Increment Slots
    INSERT INTO tournament_participants (tournament_id, tenant_id, user_id, team_data)
    VALUES (p_tournament_id, p_tenant_id, p_user_id, p_team_data);

    UPDATE tournaments SET filled_slots = filled_slots + 1 WHERE id = p_tournament_id;

    RETURN jsonb_build_object('success', true, 'message', 'Successfully joined tournament');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Deposit Approval
CREATE OR REPLACE FUNCTION approve_deposit(
    p_transaction_id UUID,
    p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_tx transactions%ROWTYPE;
    v_wallet wallets%ROWTYPE;
BEGIN
    -- 1. Lock Transaction Row
    SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
    IF v_tx.status != 'pending' THEN RAISE EXCEPTION 'Transaction is not pending'; END IF;
    IF v_tx.type != 'deposit' THEN RAISE EXCEPTION 'Not a deposit transaction'; END IF;

    -- 2. Lock Wallet Row
    SELECT * INTO v_wallet FROM wallets WHERE user_id = v_tx.user_id AND tenant_id = v_tx.tenant_id FOR UPDATE;

    -- 3. Update Transaction
    UPDATE transactions 
    SET status = 'completed', approved_by = p_admin_id, updated_at = NOW() 
    WHERE id = p_transaction_id;

    -- 4. Update Wallet (Main Balance)
    UPDATE wallets
    SET main_balance = main_balance + v_tx.amount, updated_at = NOW()
    WHERE id = v_wallet.id;

    -- 5. Record Ledger
    INSERT INTO wallet_ledger (
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

    RETURN jsonb_build_object('success', true, 'message', 'Deposit approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
