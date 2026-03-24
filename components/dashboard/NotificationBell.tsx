"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationBellProps {
    userId: string;
    initialCount: number;
}

export default function NotificationBell({
    userId,
    initialCount,
}: NotificationBellProps) {
    const [count, setCount] = useState(initialCount);
    const router = useRouter();

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    setCount((prev) => prev + 1);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    // If marked as read, decrement
                    if (payload.new && (payload.new as { is_read: boolean }).is_read) {
                        setCount((prev) => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const displayCount = count > 99 ? "99+" : count.toString();

    return (
        <button
            onClick={() => router.push("/mon-compte/notifications")}
            className="relative rounded-full p-2 text-movek-text-secondary transition-colors hover:bg-white/5 hover:text-white"
            aria-label={`${count} notifications non lues`}
        >
            <Bell className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-movek-orange px-1 text-[10px] font-bold text-white">
                    {displayCount}
                </span>
            )}
        </button>
    );
}
