"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AdminAuthState {
    success: boolean;
    error: string | null;
}

export async function loginAdmin(
    _prev: AdminAuthState,
    formData: FormData
): Promise<AdminAuthState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { success: false, error: "Email et mot de passe requis." };
    }

    const supabase = await createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error("Admin Login Error:", signInError);
        return { success: false, error: "Identifiants incorrects." };
    }

    // Verify strict role
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            // Kick them out immediately if they are just a client/fournisseur
            // trying to use the admin login.
            await supabase.auth.signOut();
            return { success: false, error: "Accès non autorisé: Compte non-administrateur." };
        }
    }

    // Success - redirect to dashboard
    redirect("/admin");
}
