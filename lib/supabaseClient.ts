import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Don't throw at module import time — allow build/prerender to proceed.
    // Throwing is still useful at runtime when code actually needs Supabase.
    throw new Error('Missing Supabase environment variables')
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

// NOTE: prefer calling `getSupabase()` from runtime/client code. This file
// avoids creating the client at module load so builds / prerenders won't
// immediately throw when env vars are absent in the environment.
