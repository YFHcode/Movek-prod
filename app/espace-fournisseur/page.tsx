import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    Package,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Clock,
    ArrowRight
} from "lucide-react";

export const metadata = {
    title: "Tableau de Bord | Espace Fournisseur | MOVEK",
};

export default async function FournisseurDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: fournisseur } = await supabase
        .from("fournisseurs")
        .select("id, entreprise")
        .eq("user_id", user.id)
        .single();

    if (!fournisseur) return null;

    // Fetch products stats
    const { data: products } = await supabase
        .from("products")
        .select("id, is_approved, rejection_reason")
        .eq("fournisseur_id", fournisseur.id);

    const totalProducts = products?.length || 0;
    const onlineProducts = products?.filter(p => p.is_approved).length || 0;
    const rejectedProducts = products?.filter(p => !p.is_approved && p.rejection_reason) || [];
    const pendingProducts = products?.filter(p => !p.is_approved && !p.rejection_reason).length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Bonjour, {fournisseur.entreprise}</h1>
                <p className="mt-1 text-sm text-movek-text-secondary">
                    Bienvenue sur votre espace Fournisseur MOVEK.
                </p>
            </div>

            {/* Rejected Products Banner */}
            {rejectedProducts.length > 0 && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-400">Action requise</h3>
                            <p className="mt-1 text-sm text-movek-text-secondary">
                                {rejectedProducts.length} de vos produits {rejectedProducts.length > 1 ? "ont été refusés" : "a été refusé"} par l&apos;équipe ETREND.
                                Veuillez consulter les motifs de refus et modifier vos fiches produits.
                            </p>
                            <Link href="/espace-fournisseur/produits" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-300 hover:underline">
                                Voir mes produits <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-3 rounded-xl border border-movek-border bg-movek-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2.5">
                            <Package className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-medium text-movek-text-secondary">Total Produits</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalProducts}</p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-movek-border bg-movek-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-500/10 p-2.5">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-sm font-medium text-movek-text-secondary">Produits en ligne</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{onlineProducts}</p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-movek-border bg-movek-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500/10 p-2.5">
                            <Clock className="h-5 w-5 text-orange-400" />
                        </div>
                        <h3 className="text-sm font-medium text-movek-text-secondary">En attente</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{pendingProducts}</p>
                </div>
            </div>

            {/* Tips Section */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-movek-orange" />
                    <h2 className="text-lg font-bold text-white">Conseils pour mieux vendre</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-movek-navy/50 p-4 border border-movek-border">
                        <h3 className="text-sm font-bold text-white mb-2">Des photos de qualité</h3>
                        <p className="text-xs text-movek-text-secondary">
                            Les annonces avec au moins 3 photos carrées et nettes reçoivent
                            en moyenne 40% de contacts en plus de la part des acheteurs.
                        </p>
                    </div>
                    <div className="rounded-lg bg-movek-navy/50 p-4 border border-movek-border">
                        <h3 className="text-sm font-bold text-white mb-2">Fiches techniques détaillées</h3>
                        <p className="text-xs text-movek-text-secondary">
                            Les acheteurs professionnels recherchent de la documentation.
                            N&apos;oubliez pas d&apos;attacher le PDF technique de la machine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
