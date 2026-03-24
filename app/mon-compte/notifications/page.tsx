import { createClient } from "@/lib/supabase/server";
import NotificationsClient from "./NotificationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notifications",
};

export default async function NotificationsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: notifications } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Mes Notifications</h1>
            </div>
            <NotificationsClient initialNotifications={notifications || []} />
        </div>
    );
}
