"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function RealtimeListener() {
    const router = useRouter();
    const supabase = createClient();
    const [hasNewUpdates, setHasNewUpdates] = useState(false);

    // We use a ref to debounce router.refresh() 
    // to avoid spamming server renders if multiple rows are inserted at once
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const triggerRefresh = () => {
        setHasNewUpdates(true);
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        refreshTimeoutRef.current = setTimeout(() => {
            router.refresh(); // Tells Next.js to re-fetch Server Components for the current route
        }, 1500); // Wait 1.5s after the last event to refresh
    };

    useEffect(() => {
        const channel = supabase.channel("admin_urgent_actions");

        channel
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "clients" }, () => triggerRefresh())
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "fournisseurs" }, () => triggerRefresh())
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, () => triggerRefresh())
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "introuvable_requests" }, () => triggerRefresh())
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => triggerRefresh())
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("Admin Dashboard Realtime Subscribed");
                }
                if (status === "CLOSED" || status === "CHANNEL_ERROR") {
                    console.warn("Realtime connection issue:", status);
                }
            });

        return () => {
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, router]);

    // If there are no updates recently, we don't render anything visually
    if (!hasNewUpdates) return null;

    // A subtle visual indicator injected into the DOM
    return (
        <div
            className="fixed top-[18px] left-[calc(260px+120px)] flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full animate-in fade-in slide-in-from-top-2"
            title="Nouvelles actions urgentes reçues en temps réel"
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-semibold">Mise à jour en direct...</span>
        </div>
    );
}
