"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function getAdminSentNotifications() {
    const { adminClient } = await verifyAdmin();

    // Since we don't have a specific "sent notifications" table (notifications are per-user),
    // we'll track global pushes by looking at unique recent titles
    // For a real production app we'd have a `notification_campaigns` table.
    // For now, we simulate this by querying DISTINCT titles/messages sent today

    // Note: Supabase doesn't easily do DISTINCT ON via PostgREST natively without RPC, 
    // so we'll just fetch the latest 100 and deduplicate in JS for the admin view.
    const { data: rawNotifs, error } = await adminClient
        .from("notifications")
        .select("title, message, type, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) {
        console.error("Error fetching notifications log:", error);
        return [];
    }

    const uniqueNotifs = [];
    const seen = new Set();

    for (const notif of rawNotifs) {
        // Create a unique key based on message content and roughly the time it was sent
        const key = `${notif.title}-${notif.message}-${notif.created_at.substring(0, 13)}`; // Group by hour
        if (!seen.has(key)) {
            seen.add(key);
            uniqueNotifs.push({
                id: key, // synthetic ID
                ...notif
            });
        }
    }

    return uniqueNotifs;
}

export type SendNotificationState = {
    success: boolean;
    error: string | null;
};

export async function sendGlobalNotification(
    _prev: SendNotificationState,
    formData: FormData
): Promise<SendNotificationState> {
    const { adminClient } = await verifyAdmin();

    const title = formData.get("title") as string;
    const message = formData.get("message") as string;
    const type = formData.get("type") as string;
    const recipientGroup = formData.get("recipients") as string;

    if (!title || !message || !type) {
        return { success: false, error: "Tous les champs sont requis." };
    }

    try {
        const userIdsToNotify: string[] = [];

        // 1. Fetch matching users
        if (recipientGroup === "all" || recipientGroup === "clients") {
            const { data } = await adminClient.from("clients").select("user_id").eq("is_approved", true).not("user_id", "is", null);
            if (data) {
                const ids = data.map((d: { user_id: string }) => d.user_id).filter(Boolean);
                userIdsToNotify.push(...ids);
            }
        }

        if (recipientGroup === "all" || recipientGroup === "fournisseurs") {
            const { data } = await adminClient.from("fournisseurs").select("user_id").eq("is_approved", true).not("user_id", "is", null);
            if (data) {
                const ids = data.map((d: { user_id: string }) => d.user_id).filter(Boolean);
                userIdsToNotify.push(...ids);
            }
        }

        if (userIdsToNotify.length === 0) {
            return { success: false, error: "Aucun destinataire trouvé pour ce groupe." };
        }

        // 2. Prepare payload
        const notificationsToInsert = userIdsToNotify.map(userId => ({
            user_id: userId,
            title,
            message,
            type,
            is_read: false
        }));

        // 3. Batch insert
        const { error: insertError } = await adminClient
            .from("notifications")
            .insert(notificationsToInsert);

        if (insertError) throw insertError;

        revalidatePath("/admin/notifications");
        return { success: true, error: null };

    } catch (error: unknown) {
        console.error("Notification push failed", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'envoi." };
    }
}
