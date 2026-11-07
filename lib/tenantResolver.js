// ==================================================
// SIFR TOURNAMENT BY SBS - Tenant Resolver
// ==================================================
import { supabase } from './supabaseClient.js';

let currentTenant = null;

export async function resolveTenant() {
    // If we already resolved it in this session, return it
    if (currentTenant) return currentTenant;

    const cachedTenant = sessionStorage.getItem('tenantData');
    if (cachedTenant) {
        currentTenant = JSON.parse(cachedTenant);
        applyTenantSettings(currentTenant.settings);
        return currentTenant;
    }

    const hostname = window.location.hostname;
    
    // For local development
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    try {
        let query = supabase.from('tenants').select('*, tenant_settings(*)');
        
        // Match against verified_domain or verified_subdomain
        // If local, we might want to default to a specific test tenant
        if (isLocalhost) {
            query = query.limit(1); // Just grab the first one for dev testing
        } else {
            query = query.or(`verified_domain.eq.${hostname},verified_subdomain.eq.${hostname}`);
        }

        let { data, error } = await query.single();

        if (error || !data) {
            // Fallback to first tenant so deployment on any domain/preview URL works seamlessly
            const fallback = await supabase.from('tenants').select('*, tenant_settings(*)').limit(1).single();
            if (fallback.data) {
                data = fallback.data;
                error = null;
            }
        }

        if (error || !data) {
            console.error("Tenant not found or error:", error);
            // Optionally redirect to a "Platform Not Found" default page
            document.body.innerHTML = '<h1 style="color:white; text-align:center; margin-top:20vh;">Platform Not Found or Inactive</h1>';
            return null;
        }

        if (data.status !== 'active') {
            document.body.innerHTML = '<h1 style="color:white; text-align:center; margin-top:20vh;">Platform Suspended</h1>';
            return null;
        }

        currentTenant = {
            id: data.id,
            name: data.name,
            settings: data.tenant_settings[0] || {}
        };

        sessionStorage.setItem('tenantData', JSON.stringify(currentTenant));
        applyTenantSettings(currentTenant.settings);
        
        return currentTenant;

    } catch (err) {
        console.error("Critical error resolving tenant:", err);
        return null;
    }
}

function applyTenantSettings(settings) {
    if (!settings) return;

    const root = document.documentElement;

    // Apply Custom CSS Variables
    if (settings.primary_color) {
        root.style.setProperty('--primary-bg', settings.primary_color);
    }
    if (settings.secondary_color) {
        root.style.setProperty('--secondary-bg', settings.secondary_color);
    }

    // Apply custom CSS if provided
    if (settings.custom_css) {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = settings.custom_css;
        document.head.appendChild(styleEl);
    }

    // Replace Logos
    if (settings.logo_url) {
        const logos = document.querySelectorAll('.tenant-logo');
        logos.forEach(img => img.src = settings.logo_url);
    }
}

// Helper to get the tenant ID synchronously after resolution
export function getTenantId() {
    if (currentTenant) return currentTenant.id;
    const cached = sessionStorage.getItem('tenantData');
    if (cached) return JSON.parse(cached).id;
    return null;
}
