"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { notifyAdminAlert } from "@/lib/mailer";

export async function removeInterest(interestId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié." };

    const { error } = await supabase
        .from("interests")
        .update({ is_deleted: true })
        .eq("id", interestId);

    if (error) {
        console.error("Remove interest error:", error);
        return { success: false, error: "Une erreur est survenue." };
    }

    revalidatePath("/mon-compte");
    revalidatePath("/mon-compte/interesses");
    return { success: true, error: null };
}

export async function registerInterest(productId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié." };

    // Get client record
    const { data: client } = await supabase
        .from("clients")
        .select("id, nom_prenom, entreprise, telephone")
        .eq("user_id", user.id)
        .single();

    if (!client) return { success: false, error: "Profil client introuvable." };

    // Check for existing active interest
    const { data: existing } = await supabase
        .from("interests")
        .select("id")
        .eq("client_id", client.id)
        .eq("product_id", productId)
        .eq("is_deleted", false)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

    if (existing) {
        return { success: true, error: null, alreadyExists: true };
    }

    // Insert interest
    const { error: insertError } = await supabase.from("interests").insert({
        client_id: client.id,
        product_id: productId,
    });

    if (insertError) {
        console.error("Register interest error:", insertError);
        return { success: false, error: "Erreur lors de l'enregistrement." };
    }

    // Fetch product details for the notification
    const adminSupabase = createAdminClient();
    const { data: product } = await adminSupabase
        .from("products")
        .select("article, designation, marque, reference")
        .eq("id", productId)
        .single();

    // Send admin notification email (non-blocking)
    try {
        const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://movek.ma"}/produits/${productId}`;
        await notifyAdminAlert(
            `🔔 Nouvel Intérêt Client — ${product?.article || "Produit"}`,
            `
            <div style="background:#0A1628;padding:40px;font-family:Arial;border-radius:12px;">
                <h2 style="color:#FF6B00;margin-top:0;">🔔 Nouveau Client Intéressé</h2>
                <p style="color:#94A3B8;">Un client a manifesté son intérêt pour un produit. L'équipe commerciale doit le contacter.</p>
                
                <div style="background:#0F2040;border:1px solid #1E3A5F;border-radius:8px;padding:20px;margin:20px 0;">
                    <h3 style="color:white;margin-top:0;">👤 Client</h3>
                    <table style="width:100%;color:white;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#94A3B8;">Nom</td><td style="padding:6px 0;font-weight:bold;">${client.nom_prenom}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Entreprise</td><td style="padding:6px 0;font-weight:bold;">${client.entreprise || "—"}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Téléphone</td><td style="padding:6px 0;font-weight:bold;">${client.telephone || "—"}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Email</td><td style="padding:6px 0;font-weight:bold;">${user.email}</td></tr>
                    </table>
                </div>

                <div style="background:#0F2040;border:1px solid #1E3A5F;border-radius:8px;padding:20px;margin:20px 0;">
                    <h3 style="color:white;margin-top:0;">📦 Produit</h3>
                    <table style="width:100%;color:white;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#94A3B8;">Article</td><td style="padding:6px 0;font-weight:bold;">${product?.article || "—"}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Désignation</td><td style="padding:6px 0;font-weight:bold;">${product?.designation || "—"}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Marque</td><td style="padding:6px 0;font-weight:bold;">${product?.marque || "—"}</td></tr>
                        <tr><td style="padding:6px 0;color:#94A3B8;">Référence</td><td style="padding:6px 0;font-weight:bold;">${product?.reference || "—"}</td></tr>
                    </table>
                </div>

                <a href="${productUrl}" style="display:inline-block;background:#FF6B00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px;">
                    Voir le produit →
                </a>
            </div>
            `
        );
    } catch (emailError) {
        console.error("Interest email notification error:", emailError);
    }

    revalidatePath("/mon-compte");
    revalidatePath("/mon-compte/interesses");
    revalidatePath("/admin");
    return { success: true, error: null };
}

