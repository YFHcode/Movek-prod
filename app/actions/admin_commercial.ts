"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { notifyOrderStatusUpdate, notifyIntrouvableReply } from "@/lib/mailer";

export async function getAdminOrders() {
    const { adminClient } = await verifyAdmin();

    const { data: orders, error } = await adminClient
        .from("orders")
        .select(`
            *,
            clients (entreprise, nom_prenom, email),
            products (article, fournisseur_id)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin orders:", error);
        return [];
    }

    // For admin view, we want to know the fournisseur of the product
    // We fetch the fournisseurs details based on the product's fournisseur_id
    const fournisseurIds = Array.from(new Set(orders.map(o => o.products?.fournisseur_id).filter(Boolean)));

    if (fournisseurIds.length > 0) {
        const { data: fournisseurs } = await adminClient
            .from("fournisseurs")
            .select("id, entreprise")
            .in("id", fournisseurIds);

        // Attach fournisseur names to orders
        return orders.map(order => {
            const f = fournisseurs?.find(f => f.id === order.products?.fournisseur_id);
            return {
                ...order,
                fournisseur_name: f ? f.entreprise : "Inconnu"
            };
        });
    }

    return orders;
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const { adminClient } = await verifyAdmin();

    const { data: orderData, error: fetchError } = await adminClient
        .from("orders")
        .select(`
            id,
            clients (email, nom_prenom)
        `)
        .eq("id", orderId)
        .single();

    if (fetchError || !orderData) return { success: false, error: "Commande introuvable." };

    const { error } = await adminClient
        .from("orders")
        .update({ statut: newStatus })
        .eq("id", orderId);

    if (error) {
        return { success: false, error: "Erreur lors de la mise à jour de la commande." };
    }

    // Trigger non-blocking email notification
    try {
        if (orderData.clients) {
            const client = Array.isArray(orderData.clients) ? orderData.clients[0] : orderData.clients;
            if (client && client.email) {
                const orderRef = orderData.id.split('-')[0].toUpperCase();
                await notifyOrderStatusUpdate(client.email, client.nom_prenom, orderRef, newStatus);
            }
        }
    } catch (emailError) {
        console.error("Failed to send order status email:", emailError);
    }

    revalidatePath("/admin/commandes");
    revalidatePath("/admin");
    return { success: true };
}

export async function getAdminDemandes() {
    const { adminClient } = await verifyAdmin();

    const { data: demandes, error } = await adminClient
        .from("introuvable_requests")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin demandes:", error);
        return [];
    }

    return demandes;
}

export async function updateDemandeStatus(demandeId: string, newStatus: string, adminReply?: string) {
    const { adminClient } = await verifyAdmin();

    const { data: demandeData, error: fetchError } = await adminClient
        .from("introuvable_requests")
        .select("email, nom_prenom, description")
        .eq("id", demandeId)
        .single();

    if (fetchError || !demandeData) return { success: false, error: "Demande introuvable." };

    const { error } = await adminClient
        .from("introuvable_requests")
        .update({ status: newStatus })
        .eq("id", demandeId);

    if (error) {
        return { success: false, error: "Erreur lors de la mise à jour de la demande." };
    }

    // Trigger non-blocking email notification if an admin reply is provided
    if (adminReply && adminReply.trim() !== "") {
        try {
            await notifyIntrouvableReply(demandeData.email, demandeData.nom_prenom, demandeData.description, adminReply);
        } catch (emailError) {
            console.error("Failed to send demande reply email:", emailError);
        }
    }

    revalidatePath("/admin/demandes");
    revalidatePath("/admin");
    return { success: true };
}
