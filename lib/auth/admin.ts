"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAdmin() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Unauthorized: User not authenticated");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Unauthorized: Profile not found");
    }

    if (profile.role !== "admin") {
        throw new Error("Unauthorized: Access denied. Admin role required.");
    }

    // Only instantiate and return the admin client AFTER strict verification
    return {
        adminClient: createAdminClient(),
        user
    };
}
