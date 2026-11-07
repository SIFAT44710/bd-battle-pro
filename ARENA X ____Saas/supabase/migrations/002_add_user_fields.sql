-- ==================================================
-- SIFR TOURNAMENT BY SBS - DB PATCH 002
-- Description: Add missing legacy UI fields to users table
-- ==================================================

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_app_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add uniqueness constraints per tenant
ALTER TABLE public.users 
ADD CONSTRAINT unique_user_app_id_per_tenant UNIQUE (tenant_id, user_app_id),
ADD CONSTRAINT unique_referral_code_per_tenant UNIQUE (tenant_id, referral_code);

-- Update the handle_new_user trigger to generate these fields
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

    -- Generate an 8-character referral code (simple random hex for now, or use a better generator)
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
