"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Register Fournisseur ───────────────────────────────────────────────
export interface RegisterFournisseurState {
    success: boolean;
    error: string | null;
    fieldErrors?: Record<string, string>;
}

export async function registerFournisseur(
    _prev: RegisterFournisseurState,
    formData: FormData
): Promise<RegisterFournisseurState> {
    try {
        const nom = (formData.get("nom") as string)?.trim();
        const prenom = (formData.get("prenom") as string)?.trim();
        const fonction = (formData.get("fonction") as string)?.trim();
        const entreprise = (formData.get("entreprise") as string)?.trim();
        const adresse = (formData.get("adresse") as string)?.trim() || null;
        const ville = (formData.get("ville") as string)?.trim() || null;
        const pays = (formData.get("pays") as string)?.trim();
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        const telephone = (formData.get("telephone") as string)?.trim();
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const message = (formData.get("message") as string)?.trim() || null;
        const acceptCgv = formData.get("acceptCgv") === "on";

        // Validate
        const fieldErrors: Record<string, string> = {};
        if (!nom || nom.length < 2) fieldErrors.nom = "Le nom est requis (min. 2 caractères).";
        if (!prenom || prenom.length < 2) fieldErrors.prenom = "Le prénom est requis (min. 2 caractères).";
        if (!fonction) fieldErrors.fonction = "La fonction est requise.";
        if (!entreprise || entreprise.length < 2) fieldErrors.entreprise = "L'entreprise est requise (min. 2 caractères).";
        if (!pays) fieldErrors.pays = "Le pays est requis.";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Email invalide.";
        if (!telephone) fieldErrors.telephone = "Le téléphone est requis.";
        if (!password || password.length < 8) fieldErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
        if (password !== confirmPassword) fieldErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        if (!acceptCgv) fieldErrors.acceptCgv = "Vous devez accepter les conditions.";

        if (Object.keys(fieldErrors).length > 0) {
            return { success: false, error: null, fieldErrors };
        }

        const nom_prenom = `${prenom} ${nom}`;
        const adminSupabase = createAdminClient();

        // Check if email already exists
        const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
        const emailExists = existingUsers?.users?.some(
            (u) => u.email?.toLowerCase() === email
        );
        if (emailExists) {
            return {
                success: false,
                error: null,
                fieldErrors: { email: "Un compte existe déjà avec cet email." },
            };
        }

        // Sign up
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { role: "fournisseur" },
            },
        });

        if (authError || !authData.user) {
            console.error("Auth signup error:", authError);
            return { success: false, error: "Une erreur est survenue lors de l'inscription." };
        }

        // Insert into fournisseurs table
        const { error: fournisseurError } = await adminSupabase.from("fournisseurs").insert({
            user_id: authData.user.id,
            nom_prenom,
            fonction,
            entreprise,
            adresse,
            ville,
            pays,
            email,
            telephone,
            message,
            is_approved: false,
        });

        if (fournisseurError) {
            console.error("Fournisseur insert error:", fournisseurError);
            return { success: false, error: "Une erreur est survenue lors de l'inscription." };
        }

        // Email to Admin
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: "contact@etrend-maroc.com",
                subject: `🏭 Nouveau fournisseur MOVEK: ${entreprise}`,
                html: `
          <div style="background:#0A1628;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#0F2040;border-radius:12px;overflow:hidden;">
              <div style="background:#FF6B00;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">MOV<span style="font-weight:400;">EK</span></h1>
              </div>
              <div style="padding:30px;">
                <h2 style="color:white;margin-top:0;">🏭 Nouveau fournisseur inscrit</h2>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;width:140px;">Nom</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${nom_prenom}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Fonction</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${fonction}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Entreprise</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${entreprise}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Adresse</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${adresse || "—"}, ${ville || "—"}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Pays</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${pays}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Email</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${email}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Téléphone</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${telephone}</td></tr>
                  <tr><td style="padding:10px;color:#94A3B8;">Note/Message</td><td style="padding:10px;color:white;">${message || "—"}</td></tr>
                </table>
              </div>
            </div>
          </div>
        `,
            });
        } catch (e) {
            console.error("Admin email error:", e);
        }

        // Email to Fournisseur
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Bienvenue sur MOVEK — Espace Fournisseur",
                html: `
          <div style="background:#0A1628;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#0F2040;border-radius:12px;overflow:hidden;">
              <div style="background:#FF6B00;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">MOV<span style="font-weight:400;">EK</span></h1>
              </div>
              <div style="padding:30px;">
                <h2 style="color:white;margin-top:0;">Bonjour ${prenom},</h2>
                <p style="color:#94A3B8;line-height:1.6;">Votre espace fournisseur MOVEK a bien été créé.</p>
                <p style="color:#94A3B8;line-height:1.6;">Notre équipe ETREND va valider votre compte sous peu. Vous pourrez ensuite ajouter vos produits industriels.</p>
              </div>
            </div>
          </div>
        `,
            });
        } catch (e) {
            console.error("Fournisseur email error:", e);
        }

        return { success: true, error: null };
    } catch (e) {
        console.error("Register error:", e);
        return { success: false, error: "Une erreur est survenue." };
    }
}

// ─── Login Fournisseur ──────────────────────────────────────────────────
export interface LoginFournisseurState {
    success: boolean;
    error: string | null;
    notApproved?: boolean;
    rejectedProductsCount?: number;
}

export async function loginFournisseur(
    _prev: LoginFournisseurState,
    formData: FormData
): Promise<LoginFournisseurState> {
    try {
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        const password = formData.get("password") as string;
        const redirectTo = (formData.get("redirect") as string) || "/espace-fournisseur";

        if (!email || !password) {
            return { success: false, error: "Email et mot de passe requis." };
        }

        const supabase = await createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return { success: false, error: "Email ou mot de passe incorrect." };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Erreur d'authentification." };

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "fournisseur") {
            await supabase.auth.signOut();
            return { success: false, error: "Ce compte n'est pas un compte fournisseur." };
        }

        const { data: fournisseur } = await supabase
            .from("fournisseurs")
            .select("id, is_approved")
            .eq("user_id", user.id)
            .single();

        if (fournisseur && !fournisseur.is_approved) {
            return { success: false, error: null, notApproved: true };
        }

        if (fournisseur && fournisseur.id) {
            const { count } = await supabase
                .from("products")
                .select("id", { count: "exact", head: true })
                .eq("fournisseur_id", fournisseur.id)
                .not("rejection_reason", "is", null);

            if (count && count > 0) {
                return {
                    success: true,
                    error: null,
                    rejectedProductsCount: count
                };
            }
        }

        redirect(redirectTo);
    } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
        const err = e as { digest?: string };
        if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
        return { success: false, error: "Une erreur est survenue." };
    }
}

// ─── Update Fournisseur Profile ────────────────────────────────────────────────
export interface FournisseurProfileState {
    success: boolean;
    error: string | null;
}

export async function updateFournisseurProfile(
    _prev: FournisseurProfileState,
    formData: FormData
): Promise<FournisseurProfileState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Non authentifié." };

        const nom_prenom = `${(formData.get("prenom") as string)?.trim()} ${(formData.get("nom") as string)?.trim()}`;
        const fonction = (formData.get("fonction") as string)?.trim() || null;
        const entreprise = (formData.get("entreprise") as string)?.trim();
        const adresse = (formData.get("adresse") as string)?.trim() || null;
        const ville = (formData.get("ville") as string)?.trim() || null;
        const pays = (formData.get("pays") as string)?.trim();
        const telephone = (formData.get("telephone") as string)?.trim();

        if (!entreprise || entreprise.length < 2) {
            return { success: false, error: "L'entreprise est requise." };
        }

        const { error } = await supabase
            .from("fournisseurs")
            .update({ nom_prenom, fonction, entreprise, adresse, ville, pays, telephone })
            .eq("user_id", user.id);

        if (error) {
            console.error("Profile update error:", error);
            return { success: false, error: "Une erreur est survenue." };
        }

        return { success: true, error: null };
    } catch {
        return { success: false, error: "Une erreur est survenue." };
    }
}
