import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — bypasses RLS using the service role key.
 * USE ONLY in server-side code (API routes, server actions).
 * NEVER expose this in client-side code.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
