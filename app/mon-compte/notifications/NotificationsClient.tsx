"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Package, FileText, Tag, Calendar,
    ShoppingCart, Settings, Bell as BellIcon,
} from "lucide-react";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications";
import { useToast } from "@/hooks/use-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

const typeIcons: Record<string, typeof Package> = {
    new_product: Package,
    catalogue: FileText,
    promotion: Tag,
    evenement: Calendar,
    commande: ShoppingCart,
    technique: Settings,
};

function getTimeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
}

export default function NotificationsClient({
    initialNotifications,
}: {
    initialNotifications: Notification[];
}) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const filtered = notifications.filter((n) => {
        if (filter === "unread") return !n.is_read;
        if (filter === "read") return n.is_read;
        return true;
    });

    function handleMarkRead(id: string) {
        // Optimistic
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        startTransition(async () => {
            const result = await markNotificationAsRead(id);
            if (!result.success) {
                // Revert
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
                );
                toast({ variant: "destructive", description: result.error || "Erreur" });
            }
        });
    }

    function handleMarkAllRead() {
        const previousNotifications = [...notifications];
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        startTransition(async () => {
            const result = await markAllNotificationsAsRead();
            if (!result.success) {
                setNotifications(previousNotifications);
                toast({ variant: "destructive", description: result.error || "Erreur" });
            } else {
                toast({ description: "Toutes les notifications marquées comme lues" });
            }
        });
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const tabs = [
        { key: "all" as const, label: "Toutes" },
        { key: "unread" as const, label: `Non lues (${unreadCount})` },
        { key: "read" as const, label: "Lues" },
    ];

    return (
        <div className="space-y-4">
            {/* Tabs + mark all */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-0 border-b border-movek-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2.5 text-xs font-medium transition-colors ${filter === tab.key
                                    ? "border-b-2 border-movek-orange text-movek-orange"
                                    : "text-movek-text-secondary hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        disabled={isPending}
                        className="text-xs text-movek-text-secondary hover:text-white"
                    >
                        Tout marquer comme lu
                    </Button>
                )}
            </div>

            {/* Notification list */}
            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map((notif) => {
                        const Icon = typeIcons[notif.type] || BellIcon;
                        return (
                            <button
                                key={notif.id}
                                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${notif.is_read
                                        ? "border-movek-border bg-movek-card opacity-60"
                                        : "border-l-[3px] border-movek-orange bg-movek-card hover:bg-movek-navy"
                                    }`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    <Icon
                                        className={`h-5 w-5 ${notif.is_read ? "text-movek-text-secondary" : "text-movek-orange"
                                            }`}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p
                                            className={`text-sm font-medium ${notif.is_read ? "text-movek-text-secondary" : "text-white"
                                                }`}
                                        >
                                            {notif.title}
                                        </p>
                                        {!notif.is_read && (
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-movek-orange" />
                                        )}
                                    </div>
                                    <p className="text-xs text-movek-text-secondary">
                                        {notif.message}
                                    </p>
                                    <p className="mt-1 text-xs text-movek-text-secondary">
                                        {getTimeAgo(notif.created_at)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-movek-border bg-movek-card py-16 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-movek-navy">
                        <BellIcon className="h-10 w-10 text-movek-text-secondary" />
                    </div>
                    <h2 className="mb-2 text-lg font-bold text-white">
                        Aucune notification
                    </h2>
                    <p className="text-sm text-movek-text-secondary">
                        Vous serez notifié des nouveaux produits, promotions et actualités industrielles.
                    </p>
                </div>
            )}
        </div>
    );
}
