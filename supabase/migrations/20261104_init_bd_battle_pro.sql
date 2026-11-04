-- ==============================================================================
-- BD BATTLE PRO - FRESH DATABASE INITIALIZATION DRAFT
-- Migration: 20261104_init_bd_battle_pro.sql
-- Brand: BD Battle Pro (Powered by Sifr Esports)
-- Author: Sifat Bin Shahjahan
-- Currency: BDT (৳ / Taka) strictly
-- Notice: Run this migration in a fresh Supabase project SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('player', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tournament_type AS ENUM ('Solo', 'Duo', 'Squad', 'Clash Squad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tournament_map AS ENUM ('Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tournament_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('entry_fee', 'demo_deposit', 'prize_payout', 'demo_refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    ign TEXT NOT NULL, -- Free Fire In-Game Name
    ff_uid TEXT NOT NULL, -- Free Fire Numeric UID (e.g. 1234567890)
    role user_role NOT NULL DEFAULT 'player',
    demo_balance NUMERIC(12, 2) NOT NULL DEFAULT 500.00 CHECK (demo_balance >= 0),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    game TEXT NOT NULL DEFAULT 'Free Fire',
    match_type tournament_type NOT NULL DEFAULT 'Squad',
    map tournament_map NOT NULL DEFAULT 'Bermuda',
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (entry_fee >= 0),
    prize_pool NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (prize_pool >= 0),
    per_kill NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (per_kill >= 0),
    prize_distribution JSONB NOT NULL DEFAULT '{"first": 0, "second": 0, "third": 0}'::jsonb,
    max_slots INT NOT NULL DEFAULT 48 CHECK (max_slots > 0),
    current_slots INT NOT NULL DEFAULT 0 CHECK (current_slots >= 0 AND current_slots <= max_slots),
    status tournament_status NOT NULL DEFAULT 'upcoming',
    match_time TIMESTAMPTZ NOT NULL,
    room_id TEXT, -- Sensitive: Released 15m before match
    room_password TEXT, -- Sensitive: Released 15m before match
    rules TEXT,
    banner_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ign TEXT NOT NULL,
    ff_uid TEXT NOT NULL,
    slot_number INT NOT NULL CHECK (slot_number > 0),
    payment_status TEXT NOT NULL DEFAULT 'demo_paid',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tournament_player UNIQUE (tournament_id, user_id),
    CONSTRAINT uq_tournament_slot UNIQUE (tournament_id, slot_number)
);

-- 6. DEMO TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.demo_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. MATCH RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    rank INT NOT NULL CHECK (rank > 0),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ign TEXT NOT NULL,
    kills INT NOT NULL DEFAULT 0 CHECK (kills >= 0),
    prize_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (prize_amount >= 0),
    published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_match_time ON public.tournaments(match_time);
CREATE INDEX IF NOT EXISTS idx_participants_tournament ON public.participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.demo_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_results_tournament ON public.match_results(tournament_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Tournaments Policies
CREATE POLICY "Tournaments are viewable by everyone"
    ON public.tournaments FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert tournaments"
    ON public.tournaments FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tournaments"
    ON public.tournaments FOR UPDATE
    USING (public.is_admin());

-- Participants Policies
CREATE POLICY "Participants list viewable by authenticated users"
    ON public.participants FOR SELECT
    USING (true);

CREATE POLICY "Admins or registration RPC can insert participants"
    ON public.participants FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Demo Transactions Policies
CREATE POLICY "Users can view their own transactions"
    ON public.demo_transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Match Results Policies
CREATE POLICY "Match results are viewable by everyone"
    ON public.match_results FOR SELECT
    USING (true);

CREATE POLICY "Admins can publish match results"
    ON public.match_results FOR INSERT
    WITH CHECK (public.is_admin());

-- 10. ATOMIC RPC FUNCTION: JOIN TOURNAMENT
-- Uses row-level lock (FOR UPDATE) to prevent oversubscription & race conditions
CREATE OR REPLACE FUNCTION public.join_tournament(
    p_tournament_id UUID,
    p_ign TEXT,
    p_ff_uid TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tournament RECORD;
    v_user_profile RECORD;
    v_next_slot INT;
    v_new_balance NUMERIC(12, 2);
    v_participant_id UUID;
BEGIN
    -- 1. Ensure user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to join tournaments';
    END IF;

    -- 2. Lock the tournament row to prevent race conditions on slots
    SELECT * INTO v_tournament
    FROM public.tournaments
    WHERE id = p_tournament_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    -- 3. Check tournament status
    IF v_tournament.status != 'upcoming' THEN
        RAISE EXCEPTION 'Tournament is not open for registration (status: %)', v_tournament.status;
    END IF;

    -- 4. Check available slots
    IF v_tournament.current_slots >= v_tournament.max_slots THEN
        RAISE EXCEPTION 'Tournament is full (%/%)', v_tournament.current_slots, v_tournament.max_slots;
    END IF;

    -- 5. Check if user is already registered
    IF EXISTS (
        SELECT 1 FROM public.participants
        WHERE tournament_id = p_tournament_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'You are already registered for this tournament';
    END IF;

    -- 6. Lock and fetch user demo balance
    SELECT * INTO v_user_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- 7. Validate demo balance
    IF v_user_profile.demo_balance < v_tournament.entry_fee THEN
        RAISE EXCEPTION 'Insufficient demo balance. Entry fee: ৳%, your balance: ৳%',
            v_tournament.entry_fee, v_user_profile.demo_balance;
    END IF;

    -- 8. Find lowest unoccupied slot number
    SELECT COALESCE(MIN(candidate_slot), 1) INTO v_next_slot
    FROM generate_series(1, v_tournament.max_slots) AS candidate_slot
    WHERE candidate_slot NOT IN (
        SELECT slot_number FROM public.participants WHERE tournament_id = p_tournament_id
    );

    IF v_next_slot IS NULL OR v_next_slot > v_tournament.max_slots THEN
        RAISE EXCEPTION 'No available slots remaining';
    END IF;

    -- 9. Deduct entry fee
    v_new_balance := v_user_profile.demo_balance - v_tournament.entry_fee;
    UPDATE public.profiles
    SET demo_balance = v_new_balance,
        updated_at = now()
    WHERE id = v_user_id;

    -- 10. Record participant
    INSERT INTO public.participants (
        tournament_id,
        user_id,
        ign,
        ff_uid,
        slot_number,
        payment_status
    ) VALUES (
        p_tournament_id,
        v_user_id,
        COALESCE(NULLIF(p_ign, ''), v_user_profile.ign),
        COALESCE(NULLIF(p_ff_uid, ''), v_user_profile.ff_uid),
        v_next_slot,
        'demo_paid'
    ) RETURNING id INTO v_participant_id;

    -- 11. Increment current_slots
    UPDATE public.tournaments
    SET current_slots = current_slots + 1,
        updated_at = now()
    WHERE id = p_tournament_id;

    -- 12. Record transaction ledger
    INSERT INTO public.demo_transactions (
        user_id,
        type,
        amount,
        balance_after,
        tournament_id,
        description
    ) VALUES (
        v_user_id,
        'entry_fee',
        v_tournament.entry_fee,
        v_new_balance,
        p_tournament_id,
        'Demo Entry Fee for: ' || v_tournament.title || ' (Slot #' || v_next_slot || ')'
    );

    -- 13. Return success payload
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Registration successful! Slot assigned.',
        'participant_id', v_participant_id,
        'slot_number', v_next_slot,
        'current_slots', v_tournament.current_slots + 1,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. SECURE FUNCTION: GET ROOM CREDENTIALS (15-Minute Window Protection)
CREATE OR REPLACE FUNCTION public.get_tournament_room_credentials(p_tournament_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tournament RECORD;
    v_is_participant BOOLEAN := false;
    v_is_admin BOOLEAN := false;
    v_minutes_until_start NUMERIC;
    v_can_access BOOLEAN := false;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'error', 'unauthorized',
            'message', 'Login required to view room credentials'
        );
    END IF;

    -- Fetch tournament
    SELECT * INTO v_tournament
    FROM public.tournaments
    WHERE id = p_tournament_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'not_found', 'message', 'Tournament not found');
    END IF;

    -- Check if admin
    SELECT public.is_admin() INTO v_is_admin;

    -- Check if registered participant
    SELECT EXISTS (
        SELECT 1 FROM public.participants
        WHERE tournament_id = p_tournament_id AND user_id = v_user_id
    ) INTO v_is_participant;

    IF NOT v_is_admin AND NOT v_is_participant THEN
        RETURN jsonb_build_object(
            'error', 'forbidden',
            'message', 'Only registered players can access Room ID and Password'
        );
    END IF;

    -- Calculate minutes until match start
    v_minutes_until_start := EXTRACT(EPOCH FROM (v_tournament.match_time - now())) / 60;

    -- Admin can always access; players can only access within 15 minutes of match time
    IF v_is_admin OR v_minutes_until_start <= 15 THEN
        v_can_access := true;
    END IF;

    IF v_can_access THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_unlocked', true,
            'room_id', COALESCE(v_tournament.room_id, 'Not Set Yet by Organizer'),
            'room_password', COALESCE(v_tournament.room_password, 'Not Set Yet'),
            'match_time', v_tournament.match_time,
            'minutes_until_start', ROUND(v_minutes_until_start, 1)
        );
    ELSE
        RETURN jsonb_build_object(
            'success', true,
            'is_unlocked', false,
            'message', 'Room credentials unlock exactly 15 minutes before match start.',
            'match_time', v_tournament.match_time,
            'minutes_until_start', ROUND(v_minutes_until_start, 1),
            'unlock_at', v_tournament.match_time - interval '15 minutes'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
