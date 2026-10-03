import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://amdfioimaowczzyumjwy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZGZpb2ltYW93Y3p6eXVtand5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTcxMDYsImV4cCI6MjEwNjE3MzEwNn0.I1deEOgyAbnft6GxjI3zIyYQxv7W0_46URj4jtlgwsQ';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
