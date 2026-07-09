import { createClient } from '@supabase/supabase-js';

// Supabase URL & Anon Key loaded from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-public-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'platform_core'
  }
});
