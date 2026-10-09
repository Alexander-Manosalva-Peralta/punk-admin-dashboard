import { createClient } from "@supabase/supabase-js";

// Credenciales oficiales de Supabase vinculadas a tu proyecto Punk
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://uavilbyvctfydqvkfzjg.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_JH4aF-NZ23Do7n9EswWmDw_iIJNVbbp";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
