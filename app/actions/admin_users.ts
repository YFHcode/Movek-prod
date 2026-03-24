"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import {
    notifyClientApproved,
    notifyClientDisabled,
    notifyFournisseurApproved,
    notifyFournisseurDisabled
} from "@/lib/mailer";

export async function getAdminClients() {
    const { adminClient } = await verifyAdmin();

    const { data: clients, error } = await adminClient
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching clients:", error);
        return [];
    }

    return clients;
}

export async function approveClient(clientId: string, isApproved: boolean) {
    const { adminClient } = await verifyAdmin();

    const { data: clientData, error: fetchError } = await adminClient
        .from("clients")
        .select("email, nom_prenom")
        .eq("id", clientId)
        .single();

    if (fetchError || !clientData) return { success: false, error: "Client introuvable." };

    const { error } = await adminClient
        .from("clients")
        .update({ is_approved: isApproved })
        .eq("id", clientId);

    if (error) {
        return { success: false, error: "Erreur lors de la modification du statut du client." };
    }

    // Trigger non-blocking email notification
    try {
        if (isApproved) {
            await notifyClientApproved(clientData.email, clientData.nom_prenom);
        } else {
            await notifyClientDisabled(clientData.email, clientData.nom_prenom);
        }
    } catch (emailError) {
        console.error("Failed to send client approval email:", emailError);
    }

    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return { success: true };
}

export async function getAdminFournisseurs() {
    const { adminClient } = await verifyAdmin();

    const { data: fournisseurs, error } = await adminClient
        .from("fournisseurs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching fournisseurs:", error);
        return [];
    }

    return fournisseurs;
}

export async function approveFournisseur(fournisseurId: string, isApproved: boolean) {
    const { adminClient } = await verifyAdmin();

    const { data: fournisseurData, error: fetchError } = await adminClient
        .from("fournisseurs")
        .select("email, nom_prenom")
        .eq("id", fournisseurId)
        .single();

    if (fetchError || !fournisseurData) return { success: false, error: "Fournisseur introuvable." };

    const { error } = await adminClient
        .from("fournisseurs")
        .update({ is_approved: isApproved })
        .eq("id", fournisseurId);

    if (error) {
        return { success: false, error: "Erreur lors de la modification du statut du fournisseur." };
    }

    // Trigger non-blocking email notification
    try {
        if (isApproved) {
            await notifyFournisseurApproved(fournisseurData.email, fournisseurData.nom_prenom);
        } else {
            await notifyFournisseurDisabled(fournisseurData.email, fournisseurData.nom_prenom);
        }
    } catch (emailError) {
        console.error("Failed to send fournisseur approval email:", emailError);
    }

    revalidatePath("/admin/fournisseurs");
    revalidatePath("/admin");
    return { success: true };
}
