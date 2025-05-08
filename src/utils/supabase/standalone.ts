import { SupabaseClient, createClient } from '@supabase/supabase-js';

/**
 * creates a standalone client for supabase
 * doesn't require cookies or SSR
 * uses service_role key or anon key
 */
export function createStandaloneClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Brak konfiguracji Supabase: ustaw NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY lub NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return createClient(url, key);
}
