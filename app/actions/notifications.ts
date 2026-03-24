"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié." };

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Mark notification error:", error);
        return { success: false, error: "Une erreur est survenue." };
    }

    revalidatePath("/mon-compte/notifications");
    revalidatePath("/mon-compte");
    return { success: true, error: null };
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Non authentifié." };

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error("Mark all notifications error:", error);
        return { success: false, error: "Une erreur est survenue." };
    }

    revalidatePath("/mon-compte/notifications");
    revalidatePath("/mon-compte");
    return { success: true, error: null };
}
