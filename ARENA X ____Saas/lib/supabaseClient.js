// ==================================================
// SIFR TOURNAMENT BY SBS - Supabase Client
// ==================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// You will replace these with your actual Supabase URL and Anon Key later.
// Note: In production, these should ideally be injected via environment variables
// during a build step (if using a bundler), but for a static Vercel deployment, 
// they can be hardcoded here since the Anon Key is safe to expose.
const supabaseUrl = 'https://mtwobxluguuqfrziqoyu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d29ieGx1Z3V1cWZyemlxb3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODk5OTcsImV4cCI6MjA5MzY2NTk5N30.VIppgwq6e1AtQUXKDesYLJJhtAnyx2EHlubbstgjwbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
