import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  browserClient ??= createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  adminClient ??= createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

export function getPublicUrl(bucket: string, path: string): string {
  if (!supabaseUrl) return `/placeholder/${path}`;
  const client = getSupabaseClient();
  if (!client) return `/placeholder/${path}`;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
