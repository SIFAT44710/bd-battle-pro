// ==================================================
// SIFR TOURNAMENT BY SBS - Auth Engine
// ==================================================
import { supabase } from './supabaseClient.js';
import { getTenantId } from './tenantResolver.js';

/**
 * Handles user signup. Ensures tenant_id is passed in metadata.
 */
export async function signUp(email, password, username, referredByCode = null) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error("Tenant ID not resolved.");

    // 1. Sign up the user in Supabase Auth
    // We pass tenant_id in user_metadata so a trigger or our code knows where they belong
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                tenant_id: tenantId,
                referred_by_code: referredByCode
            }
        }
    });

    if (error) throw error;

    // 2. Insert into our public.users table 
    // (Note: This is often better handled by a Postgres Trigger on auth.users,
    // but for explicit control we can do it here if RLS allows, though Trigger is safer).
    // Assuming we use a Postgres Trigger: "after_auth_insert", so we just return success here.
    
    return data;
}

/**
 * Handles user login. 
 * Note: Since a user might have accounts on multiple tenants with the same email,
 * our RLS policies will only show data for the CURRENT tenant.
 */
export async function logIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    
    // Verify that the user belongs to the current tenant
    // (We will check the users table which is RLS protected by tenant_id)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (userError || !userData) {
        // User exists in Auth, but not for this specific tenant!
        await logOut();
        throw new Error("Account does not exist on this platform.");
    }

    return { session: data.session, user: userData };
}

/**
 * Handles user logout.
 */
export async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/login.html';
}

/**
 * Gets current session and DB user data.
 */
export async function getCurrentUser() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) return null;

    // Get user details for current tenant
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (userError || !userData) return null;

    return { auth: session.user, db: userData };
}
