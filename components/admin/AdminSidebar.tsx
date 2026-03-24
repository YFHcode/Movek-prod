"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Factory,
    Package,
    FolderTree,
    ShoppingCart,
    Search,
    Bell,
    FileText,
    FileCode,
    LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar({ userEmail }: { userEmail: string | undefined }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    const linkBaseClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium";
    const getLinkClass = (path: string) => {
        // Special exact match for dashboard to not highlight on subpages
        const isActive = path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

        return isActive
            ? `${linkBaseClass} text-[#FF6B00] bg-[#0F2040] border-l-4 border-[#FF6B00]`
            : `${linkBaseClass} text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent`;
    };

    return (
        <aside className="w-[260px] bg-[#060E1A] h-screen fixed left-0 top-0 border-r border-[#1E3A5F] flex flex-col z-50">
            <div className="p-6">
                <Link href="/admin" className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        MOV<span className="text-[#FF6B00]">EK</span>
                    </span>
                    <span className="text-xs font-medium text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 ml-2">
                        ADMIN
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="space-y-6">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                            Overview
                        </div>
                        <nav className="space-y-1">
                            <Link href="/admin" className={getLinkClass("/admin")}>
                                <LayoutDashboard className="w-5 h-5" />
                                Tableau de bord
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                            Gestion Utilisateurs
                        </div>
                        <nav className="space-y-1">
                            <Link href="/admin/clients" className={getLinkClass("/admin/clients")}>
                                <Users className="w-5 h-5" />
                                Clients
                            </Link>
                            <Link href="/admin/fournisseurs" className={getLinkClass("/admin/fournisseurs")}>
                                <Factory className="w-5 h-5" />
                                Fournisseurs
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                            Catalogue
                        </div>
                        <nav className="space-y-1">
                            <Link href="/admin/produits" className={getLinkClass("/admin/produits")}>
                                <Package className="w-5 h-5" />
                                Produits
                            </Link>
                            <Link href="/admin/familles" className={getLinkClass("/admin/familles")}>
                                <FolderTree className="w-5 h-5" />
                                Familles & Catégories
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                            Commercial
                        </div>
                        <nav className="space-y-1">
                            <Link href="/admin/commandes" className={getLinkClass("/admin/commandes")}>
                                <ShoppingCart className="w-5 h-5" />
                                Commandes
                            </Link>
                            <Link href="/admin/demandes" className={getLinkClass("/admin/demandes")}>
                                <Search className="w-5 h-5" />
                                Demandes Introuvables
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                            Communication
                        </div>
                        <nav className="space-y-1">
                            <Link href="/admin/notifications" className={getLinkClass("/admin/notifications")}>
                                <Bell className="w-5 h-5" />
                                Notifications
                            </Link>
                            <Link href="/admin/blog" className={getLinkClass("/admin/blog")}>
                                <FileText className="w-5 h-5" />
                                Blog
                            </Link>
                            <Link href="/admin/documents" className={getLinkClass("/admin/documents")}>
                                <FileCode className="w-5 h-5" />
                                Documents Techniques
                            </Link>
                        </nav>
                    </div>


                </div>
            </div>

            <div className="p-4 border-t border-[#1E3A5F]">
                <div className="bg-[#0F2040] rounded-lg p-3">
                    <div className="text-sm font-medium text-white break-all">
                        {userEmail || "Admin"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        Super Administrateur
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </aside>
    );
}
