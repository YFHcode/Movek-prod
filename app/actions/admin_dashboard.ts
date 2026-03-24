"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export async function getDashboardStats() {
    // 1. Verify admin securely first
    const { adminClient } = await verifyAdmin();

    try {
        // Fetch counts in parallel
        const [
            { count: clientsCount },
            { count: fournisseursCount },
            { count: pendingClientsCount },
            { count: pendingFournisseursCount },
            { count: interestsCount },
            { count: activeProductsCount },
            { count: pendingProductsCount },
            { count: pendingIntrouvablesCount },
            { count: totalIntrouvablesCount },
            { count: activeOrdersCount },
            { count: totalOrdersCount }
        ] = await Promise.all([
            // Stats Row 1 - Users
            adminClient.from("clients").select("*", { count: "exact", head: true }),
            adminClient.from("fournisseurs").select("*", { count: "exact", head: true }),
            adminClient.from("clients").select("*", { count: "exact", head: true }).eq("is_approved", false),
            adminClient.from("fournisseurs").select("*", { count: "exact", head: true }).eq("is_approved", false),
            adminClient.from("interests").select("*", { count: "exact", head: true }).eq("is_deleted", false),

            // Stats Row 2 - Catalog & Commercial
            adminClient.from("products").select("*", { count: "exact", head: true }).eq("is_approved", true),
            adminClient.from("products").select("*", { count: "exact", head: true }).eq("is_approved", false),
            adminClient.from("introuvable_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
            adminClient.from("introuvable_requests").select("*", { count: "exact", head: true }),
            adminClient.from("orders").select("*", { count: "exact", head: true }).in("statut", ["pending", "confirmed", "quality_check"]),
            adminClient.from("orders").select("*", { count: "exact", head: true })
        ]);

        return {
            clientsTotal: clientsCount || 0,
            fournisseursTotal: fournisseursCount || 0,
            usersPendingTotal: (pendingClientsCount || 0) + (pendingFournisseursCount || 0),
            usersPendingClients: pendingClientsCount || 0,
            usersPendingFournisseurs: pendingFournisseursCount || 0,
            interestsTotal: interestsCount || 0,
            productsActive: activeProductsCount || 0,
            productsPending: pendingProductsCount || 0,
            introuvablesPending: pendingIntrouvablesCount || 0,
            introuvablesTotal: totalIntrouvablesCount || 0,
            ordersActive: activeOrdersCount || 0,
            ordersTotal: totalOrdersCount || 0
        };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return null;
    }
}

export async function getRecentActivity() {
    const { adminClient } = await verifyAdmin();

    try {
        const { data, error } = await adminClient
            .from("admin_recent_activity_view")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Recent Activity View Error:", error);
            return [];
        }

        return data.map((item: { id: string; type: string; title: string; subtitle: string | null; target_id: string; created_at: string; }) => ({
            ...item,
            timeAgo: formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })
        }));
    } catch (e) {
        console.error("getRecentActivity catch:", e);
        return [];
    }
}
