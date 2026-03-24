import React from "react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getDashboardStats, getRecentActivity } from "@/app/actions/admin_dashboard";
import {
    Users, Factory, Clock, Heart, Package, Search, ShoppingCart,
    CheckCircle2, ArrowRight
} from "lucide-react";

export default async function AdminDashboard() {
    const stats = await getDashboardStats();
    const activityInfo = await getRecentActivity();

    // If verification failed (should be caught by layout, but safegaurd here)
    if (!stats) return <div className="p-8 text-white">Erreur de chargement.</div>;

    const hasUrgentActions =
        stats.usersPendingTotal > 0 ||
        stats.productsPending > 0 ||
        stats.introuvablesPending > 0;

    return (
        <>
            <AdminTopBar title="Vue d'ensemble de la plateforme" adminName="Admin" />

            <div className="p-8 max-w-7xl mx-auto space-y-8">

                {/* --- STATS ROW 1: USERS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <Link href="/admin/clients" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Clients inscrits</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.clientsTotal}</div>
                    </Link>

                    {/* Card 2 */}
                    <Link href="/admin/fournisseurs" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-orange-500/10 p-3 rounded-lg text-orange-400">
                                <Factory className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Fournisseurs inscrits</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.fournisseursTotal}</div>
                    </Link>

                    {/* Card 3 */}
                    <Link href="/admin/clients?filter=pending" className={`bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border ${stats.usersPendingTotal > 0 ? "border-yellow-500/50" : "border-[#1E3A5F]"}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">En attente d&apos;app</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.usersPendingTotal}</div>
                    </Link>

                    {/* Card 4 */}
                    <div className="bg-[#0F2040] p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Intérêts produits</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.interestsTotal}</div>
                    </div>
                </div>

                {/* --- STATS ROW 2: CATALOG & COMMERCIAL --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <Link href="/admin/produits?filter=approved" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-500/10 p-3 rounded-lg text-green-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Produits en ligne</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.productsActive}</div>
                    </Link>

                    {/* Card 2 */}
                    <Link href="/admin/produits?filter=pending" className={`bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border ${stats.productsPending > 0 ? "border-yellow-500/50" : "border-[#1E3A5F]"}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-orange-500/10 p-3 rounded-lg text-orange-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Produits à valider</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.productsPending}</div>
                    </Link>

                    {/* Card 3 */}
                    <Link href="/admin/demandes" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Demandes introuvables</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {stats.introuvablesTotal}
                            <span className="text-sm font-normal text-slate-400 ml-2">({stats.introuvablesPending} non traitées)</span>
                        </div>
                    </Link>

                    {/* Card 4 */}
                    <Link href="/admin/commandes" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-6 rounded-xl border border-[#1E3A5F]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium">Commandes</h3>
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {stats.ordersTotal}
                            <span className="text-sm font-normal text-slate-400 ml-2">({stats.ordersActive} en cours)</span>
                        </div>
                    </Link>
                </div>

                {/* --- BOTTOM SECTION: URGENT ACTIONS & RECENT ACTIVITY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Urgent Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xl">⚡</span>
                            <h2 className="text-xl font-bold text-white">Actions urgentes</h2>
                        </div>

                        {!hasUrgentActions ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center flex flex-col items-center justify-center h-[300px]">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold text-white">Tout est à jour !</h3>
                                <p className="text-slate-400 mt-2">Aucune action urgente requise pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {stats.usersPendingClients > 0 && (
                                    <Link href="/admin/clients?filter=pending" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-4 rounded-lg border-l-4 border-l-[#FF6B00] border-y border-y-[#1E3A5F] border-r border-r-[#1E3A5F] flex items-center justify-between group">
                                        <div>
                                            <div className="text-white font-medium">{stats.usersPendingClients} nouveau(x) client(s) à approuver</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}

                                {stats.usersPendingFournisseurs > 0 && (
                                    <Link href="/admin/fournisseurs?filter=pending" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-4 rounded-lg border-l-4 border-l-[#FF6B00] border-y border-y-[#1E3A5F] border-r border-r-[#1E3A5F] flex items-center justify-between group">
                                        <div>
                                            <div className="text-white font-medium">{stats.usersPendingFournisseurs} nouveau(x) fournisseur(s) à approuver</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}

                                {stats.productsPending > 0 && (
                                    <Link href="/admin/produits?filter=pending" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-4 rounded-lg border-l-4 border-l-yellow-500 border-y border-y-[#1E3A5F] border-r border-r-[#1E3A5F] flex items-center justify-between group">
                                        <div>
                                            <div className="text-white font-medium">{stats.productsPending} produit(s) à valider pour le marketplace</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}

                                {stats.introuvablesPending > 0 && (
                                    <Link href="/admin/demandes?filter=pending" className="bg-[#0F2040] hover:bg-[#152A50] transition-colors p-4 rounded-lg border-l-4 border-l-blue-500 border-y border-y-[#1E3A5F] border-r border-r-[#1E3A5F] flex items-center justify-between group">
                                        <div>
                                            <div className="text-white font-medium">{stats.introuvablesPending} demande(s) introuvable non traitée(s)</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-6">Activité récente</h2>

                        <div className="bg-[#0F2040] rounded-xl border border-[#1E3A5F] overflow-hidden">
                            {activityInfo.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">Aucune activité récente.</div>
                            ) : (
                                <div className="divide-y divide-[#1E3A5F]">
                                    {activityInfo.map((activity: { id: string; type: string; title: string; subtitle: string | null; timeAgo: string; }, i: number) => {
                                        // Determine colors based on type
                                        let dotColor = "bg-slate-500";
                                        let prefix = "";

                                        switch (activity.type) {
                                            case "client":
                                                dotColor = "bg-blue-500";
                                                prefix = "Nouveau client";
                                                break;
                                            case "fournisseur":
                                                dotColor = "bg-orange-500";
                                                prefix = "Nouveau fournisseur";
                                                break;
                                            case "product":
                                                dotColor = "bg-green-500";
                                                prefix = "Produit ajouté";
                                                break;
                                            case "order":
                                                dotColor = "bg-purple-500";
                                                prefix = `Commande ${activity.title}`;
                                                break;
                                            case "introuvable":
                                                dotColor = "bg-yellow-500";
                                                prefix = "Demande introuvable";
                                                break;
                                        }

                                        return (
                                            <div key={`${activity.type}-${activity.id}-${i}`} className="p-4 flex items-start gap-4 hover:bg-white/5 transition-colors">
                                                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${dotColor}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white">
                                                        <span className="font-semibold">{prefix}</span>
                                                        {" — "}
                                                        {activity.type === "order" ? activity.subtitle : activity.title}
                                                    </p>
                                                    {activity.subtitle && activity.type !== "order" && (
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{activity.subtitle}</p>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                                                    {activity.timeAgo}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
