-- ==================================================
-- SIFR TOURNAMENT BY SBS - DB PATCH 003
-- Description: Seed a default tenant for local development
-- ==================================================

-- 1. Add app_name column if it doesn't exist
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS app_name VARCHAR(255) DEFAULT 'Arena X';

-- 2. Insert a default active tenant
INSERT INTO public.tenants (name, verified_domain, status)
VALUES ('Arena X', 'localhost', 'active')
ON CONFLICT DO NOTHING;

-- 3. Insert default tenant settings for the newly created tenant
INSERT INTO public.tenant_settings (tenant_id, app_name, primary_color, secondary_color)
SELECT id, 'Arena X', '#1E293B', '#0F172A' 
FROM public.tenants 
WHERE name = 'Arena X'
ON CONFLICT (tenant_id) DO NOTHING;
