"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

// Simple in-memory rate limiting (good enough for dev/free tier)
const submissionTracker = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = submissionTracker.get(ip);

    if (!entry || now > entry.resetAt) {
        submissionTracker.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
        return true;
    }

    if (entry.count >= 3) {
        return false;
    }

    entry.count++;
    return true;
}

interface IntrouvableFormState {
    success: boolean;
    error: string | null;
}

export async function submitIntrouvableRequest(
    _prevState: IntrouvableFormState,
    formData: FormData
): Promise<IntrouvableFormState> {
    try {
        // Extract fields
        const nom_prenom = formData.get("nom_prenom") as string;
        const fonction = formData.get("fonction") as string;
        const entreprise = formData.get("entreprise") as string;
        const adresse = formData.get("adresse") as string;
        const pays = formData.get("pays") as string;
        const email = formData.get("email") as string;
        const telephone = formData.get("telephone") as string;
        const description = formData.get("description") as string;

        // Server-side validation
        if (!nom_prenom || nom_prenom.length < 2) {
            return { success: false, error: "Le nom est requis (min. 2 caractères)." };
        }
        if (!entreprise || entreprise.length < 2) {
            return { success: false, error: "L'entreprise est requise (min. 2 caractères)." };
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, error: "Veuillez fournir un email valide." };
        }
        if (!description || description.length < 20) {
            return { success: false, error: "La description est requise (min. 20 caractères)." };
        }

        // Rate limiting (using email as identifier since we don't have IP in server actions easily)
        if (!checkRateLimit(email)) {
            return {
                success: false,
                error: "Trop de demandes. Veuillez réessayer dans une heure.",
            };
        }

        // Insert into database
        const supabase = createAdminClient();
        const { error: dbError } = await supabase
            .from("introuvable_requests")
            .insert({
                nom_prenom,
                fonction: fonction || null,
                entreprise,
                adresse: adresse || null,
                pays: pays || null,
                email,
                telephone: telephone || null,
                description,
            });

        if (dbError) {
            console.error("DB insert error:", dbError);
            return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
        }

        // Send email notification to admin
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: "movekindustrie@gmail.com",
                subject: `[MOVEK] Nouvelle demande introuvable - ${entreprise}`,
                html: `
          <h2>Nouvelle demande de produit introuvable</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Nom</strong></td><td style="padding:8px;border:1px solid #ddd">${nom_prenom}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Fonction</strong></td><td style="padding:8px;border:1px solid #ddd">${fonction || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Entreprise</strong></td><td style="padding:8px;border:1px solid #ddd">${entreprise}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Adresse</strong></td><td style="padding:8px;border:1px solid #ddd">${adresse || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Pays</strong></td><td style="padding:8px;border:1px solid #ddd">${pays || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Téléphone</strong></td><td style="padding:8px;border:1px solid #ddd">${telephone || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><strong>Description</strong></td><td style="padding:8px;border:1px solid #ddd">${description}</td></tr>
          </table>
        `,
            });
        } catch (emailError) {
            // Log but don't fail — the DB insert succeeded
            console.error("Email send error:", emailError);
        }

        return { success: true, error: null };
    } catch {
        return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
    }
}
