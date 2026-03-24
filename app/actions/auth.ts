"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Register Client ───────────────────────────────────────────────
interface RegisterState {
    success: boolean;
    error: string | null;
    fieldErrors?: Record<string, string>;
}

export async function registerClient(
    _prev: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    try {
        const nom = (formData.get("nom") as string)?.trim();
        const prenom = (formData.get("prenom") as string)?.trim();
        const fonction = (formData.get("fonction") as string)?.trim() || null;
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

        // Field-level validation
        const fieldErrors: Record<string, string> = {};
        if (!nom || nom.length < 2) fieldErrors.nom = "Le nom est requis (min. 2 caractères).";
        if (!prenom || prenom.length < 2) fieldErrors.prenom = "Le prénom est requis (min. 2 caractères).";
        if (!entreprise || entreprise.length < 2) fieldErrors.entreprise = "L'entreprise est requise (min. 2 caractères).";
        if (!pays) fieldErrors.pays = "Le pays est requis.";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Email invalide.";
        if (!telephone) fieldErrors.telephone = "Le téléphone est requis.";
        if (!password || password.length < 8) fieldErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
        if (password !== confirmPassword) fieldErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        if (!acceptCgv) fieldErrors.acceptCgv = "Vous devez accepter les CGV.";

        if (Object.keys(fieldErrors).length > 0) {
            return { success: false, error: null, fieldErrors };
        }

        const nom_prenom = `${prenom} ${nom}`;

        // Check if email already exists (prevent duplicates)
        const adminSupabase = createAdminClient();
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
                data: { role: "client" },
            },
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                return {
                    success: false,
                    error: null,
                    fieldErrors: { email: "Un compte existe déjà avec cet email." },
                };
            }
            console.error("Auth signup error:", authError);
            return { success: false, error: "Une erreur est survenue lors de l'inscription." };
        }

        if (!authData.user) {
            return { success: false, error: "Une erreur est survenue lors de l'inscription." };
        }

        // Insert into clients table (via admin to bypass RLS)
        const { error: clientError } = await adminSupabase.from("clients").insert({
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

        if (clientError) {
            console.error("Client insert error:", clientError);
            return { success: false, error: "Une erreur est survenue lors de l'inscription." };
        }

        // Send notification email to admin
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: "contact@etrend-maroc.com",
                subject: `🏭 Nouveau client MOVEK: ${entreprise}`,
                html: `
          <div style="background:#0A1628;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#0F2040;border-radius:12px;overflow:hidden;">
              <div style="background:#FF6B00;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">MOV<span style="font-weight:400;">EK</span></h1>
              </div>
              <div style="padding:30px;">
                <h2 style="color:white;margin-top:0;">🏭 Nouveau client inscrit</h2>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;width:140px;">Nom</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${nom_prenom}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Fonction</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${fonction || "—"}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Entreprise</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${entreprise}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Adresse</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${adresse || "—"}, ${ville || "—"}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Pays</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${pays}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Email</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${email}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:#94A3B8;">Téléphone</td><td style="padding:10px;border-bottom:1px solid #1E3A5F;color:white;">${telephone}</td></tr>
                  <tr><td style="padding:10px;color:#94A3B8;">Message</td><td style="padding:10px;color:white;">${message || "—"}</td></tr>
                </table>
              </div>
              <div style="padding:15px;text-align:center;border-top:1px solid #1E3A5F;">
                <p style="color:#94A3B8;font-size:12px;margin:0;">MOVEK — Opéré par ETREND</p>
              </div>
            </div>
          </div>
        `,
            });
        } catch (e) {
            console.error("Admin email error:", e);
        }

        // Send confirmation email to client
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Bienvenue sur MOVEK — Votre inscription est reçue",
                html: `
          <div style="background:#0A1628;padding:40px 20px;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#0F2040;border-radius:12px;overflow:hidden;">
              <div style="background:#FF6B00;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">MOV<span style="font-weight:400;">EK</span></h1>
              </div>
              <div style="padding:30px;">
                <h2 style="color:white;margin-top:0;">Bonjour ${prenom},</h2>
                <p style="color:#94A3B8;line-height:1.6;">
                  Votre demande d'inscription sur MOVEK a bien été reçue.
                </p>
                <p style="color:#94A3B8;line-height:1.6;">
                  Notre équipe ETREND va valider votre compte professionnel sous peu.
                  Vous recevrez un email de confirmation dès que votre accès sera activé.
                </p>
                <p style="color:#94A3B8;line-height:1.6;">À bientôt sur MOVEK.</p>
              </div>
              <div style="padding:15px;text-align:center;border-top:1px solid #1E3A5F;">
                <p style="color:#94A3B8;font-size:12px;margin:0;">MOVEK — Opéré par ETREND | contact@etrend-maroc.com</p>
              </div>
            </div>
          </div>
        `,
            });
        } catch (e) {
            console.error("Client email error:", e);
        }

        return { success: true, error: null };
    } catch (e) {
        console.error("Register error:", e);
        return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
    }
}

// ─── Login Client ──────────────────────────────────────────────────
interface LoginState {
    success: boolean;
    error: string | null;
    notApproved?: boolean;
}

export async function loginClient(
    _prev: LoginState,
    formData: FormData
): Promise<LoginState> {
    try {
        const email = (formData.get("email") as string)?.trim().toLowerCase();
        const password = formData.get("password") as string;
        const redirectTo = (formData.get("redirect") as string) || "/mon-compte";

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

        // Check role
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Email ou mot de passe incorrect." };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "client") {
            await supabase.auth.signOut();
            return {
                success: false,
                error: "Ce compte n'est pas un compte acheteur.",
            };
        }

        // Check is_approved
        const { data: client } = await supabase
            .from("clients")
            .select("is_approved")
            .eq("user_id", user.id)
            .single();

        if (client && !client.is_approved) {
            return {
                success: false,
                error: null,
                notApproved: true,
            };
        }

        // Redirect on success — use redirect() which throws
        redirect(redirectTo);
    } catch (e) {
        // redirect() throws a NEXT_REDIRECT error — re-throw it
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
        // Check for Next.js redirect
        const err = e as { digest?: string };
        if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
        console.error("Login error:", e);
        return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
    }
}

// ─── Logout ────────────────────────────────────────────────────────
export async function logoutClient() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}

// ─── Forgot Password ──────────────────────────────────────────────
interface ForgotState {
    success: boolean;
    error: string | null;
}

export async function forgotPassword(
    _prev: ForgotState,
    formData: FormData
): Promise<ForgotState> {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Veuillez fournir un email valide." };
    }

    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/client/login`,
    });

    if (error) {
        console.error("Forgot password error:", error);
        // Don't reveal if email exists or not
    }

    // Always show success (security: don't reveal if email exists)
    return { success: true, error: null };
}

// ─── Update Profile ────────────────────────────────────────────────
interface ProfileState {
    success: boolean;
    error: string | null;
}

export async function updateProfile(
    _prev: ProfileState,
    formData: FormData
): Promise<ProfileState> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
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
            .from("clients")
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

// ─── Change Password ───────────────────────────────────────────────
interface PasswordState {
    success: boolean;
    error: string | null;
}

export async function changePassword(
    _prev: PasswordState,
    formData: FormData
): Promise<PasswordState> {
    try {
        const newPassword = formData.get("newPassword") as string;
        const confirmNew = formData.get("confirmNewPassword") as string;

        if (!newPassword || newPassword.length < 8) {
            return { success: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
        }
        if (newPassword !== confirmNew) {
            return { success: false, error: "Les mots de passe ne correspondent pas." };
        }

        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            console.error("Password change error:", error);
            return { success: false, error: "Une erreur est survenue." };
        }

        return { success: true, error: null };
    } catch {
        return { success: false, error: "Une erreur est survenue." };
    }
}
