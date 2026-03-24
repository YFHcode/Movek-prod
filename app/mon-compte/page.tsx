import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Heart, Package, Bell, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mon Compte",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch client info
    const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user!.id)
        .single();

    // Fetch counts
    const { count: interestCount } = await supabase
        .from("interests")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client!.id)
        .eq("is_deleted", false)
        .gte("expires_at", new Date().toISOString());

    const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client!.id);

    const { count: notifCount } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);

    // Fetch recent interests with product data
    const { data: recentInterests } = await supabase
        .from("interests")
        .select("id, created_at, expires_at, product_id, public_products(id, article, designation, marque, reference, etat)")
        .eq("client_id", client!.id)
        .eq("is_deleted", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(3);

    // Fetch recent notifications
    const { data: recentNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(3);

    const memberSince = client?.created_at
        ? new Date(client.created_at).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
        })
        : "";

    const prenom = client?.nom_prenom?.split(" ")[0] || "Utilisateur";

    function getDaysLeft(expiresAt: string) {
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    function getTimeAgo(date: string) {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `Il y a ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Il y a ${days}j`;
    }

    const stats = [
        { icon: Heart, value: interestCount || 0, label: "Produits Intéressés", href: "/mon-compte/interesses" },
        { icon: Package, value: orderCount || 0, label: "Commandes", href: "/mon-compte/commandes" },
        { icon: Bell, value: notifCount || 0, label: "Notifications", href: "/mon-compte/notifications" },
        { icon: Clock, value: "7 jours", label: "Durée conservation intérêts", href: "/mon-compte/interesses" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-xl border border-movek-border bg-gradient-to-r from-movek-card to-[#1E3A5F] p-6">
                <div className="border-l-4 border-movek-orange pl-4">
                    <h1 className="text-xl font-bold text-white">
                        Bonjour, {prenom} 👋
                    </h1>
                    <p className="text-sm text-movek-text-secondary">
                        {client?.entreprise} — {client?.pays}
                    </p>
                    <p className="mt-1 text-xs text-movek-text-secondary">
                        Membre depuis {memberSince}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="rounded-xl border border-movek-border bg-movek-card p-5 transition-colors hover:border-movek-orange/50"
                    >
                        <stat.icon className="mb-3 h-8 w-8 text-movek-orange" />
                        <p className="text-2xl font-bold text-white">
                            {stat.value}
                        </p>
                        <p className="text-xs text-movek-text-secondary">
                            {stat.label}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Recent Interests */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-white">Mes derniers intérêts</h2>
                    <Link href="/mon-compte/interesses" className="text-xs text-movek-orange hover:underline">
                        Voir tous →
                    </Link>
                </div>
                {recentInterests && recentInterests.length > 0 ? (
                    <div className="space-y-3">
                        {recentInterests.map((interest) => {
                            const product = interest.public_products as unknown as {
                                id: string; article: string; designation: string;
                                marque: string | null; reference: string | null; etat: string;
                            };
                            if (!product) return null;
                            const daysLeft = getDaysLeft(interest.expires_at);
                            return (
                                <Link
                                    key={interest.id}
                                    href={`/produits/${product.id}`}
                                    className="flex items-center justify-between rounded-lg border border-movek-border bg-movek-navy p-4 transition-colors hover:border-movek-orange/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white">
                                            {product.article} — {product.designation}
                                        </p>
                                        <p className="text-xs text-movek-text-secondary">
                                            {product.marque || "—"} | {product.reference || "—"}
                                        </p>
                                    </div>
                                    <span
                                        className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${daysLeft < 2
                                                ? "bg-red-500/20 text-red-400"
                                                : daysLeft < 5
                                                    ? "bg-orange-500/20 text-orange-400"
                                                    : "bg-movek-navy text-movek-text-secondary"
                                            }`}
                                    >
                                        {daysLeft}j restant{daysLeft !== 1 ? "s" : ""}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-movek-text-secondary">
                        Aucun intérêt pour le moment.{" "}
                        <Link href="/produits" className="text-movek-orange hover:underline">
                            Explorer le catalogue
                        </Link>
                    </p>
                )}
            </div>

            {/* Recent Notifications */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-white">Dernières notifications</h2>
                    <Link href="/mon-compte/notifications" className="text-xs text-movek-orange hover:underline">
                        Voir toutes →
                    </Link>
                </div>
                {recentNotifications && recentNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {recentNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="flex items-start gap-3 rounded-lg border-l-[3px] border-movek-orange bg-movek-navy p-4"
                            >
                                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-movek-orange" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white">{notif.title}</p>
                                    <p className="text-xs text-movek-text-secondary">{notif.message}</p>
                                    <p className="mt-1 text-xs text-movek-text-secondary">
                                        {getTimeAgo(notif.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-movek-text-secondary">
                        Aucune notification pour le moment.
                    </p>
                )}
            </div>

            {/* Introuvable CTA */}
            <div className="rounded-xl border border-movek-orange/30 bg-movek-orange/10 p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div>
                        <h3 className="font-bold text-white">
                            Vous ne trouvez pas un produit ?
                        </h3>
                        <p className="text-sm text-movek-text-secondary">
                            Notre équipe d&apos;experts le trouve pour vous.
                        </p>
                    </div>
                    <Link href="/introuvable">
                        <Button className="rounded-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110">
                            Soumettre une demande
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
