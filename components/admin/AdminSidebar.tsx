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
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminSidebarProps {
    userEmail: string | undefined;
    isCollapsed: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ userEmail, isCollapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    const linkBaseClass = "flex items-center rounded-lg transition-colors text-sm font-medium border-l-4";
    const getLinkClass = (path: string) => {
        // Special exact match for dashboard to not highlight on subpages
        const isActive = path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
        const activeColors = "text-[#FF6B00] bg-[#0F2040] border-[#FF6B00]";
        const inactiveColors = "text-slate-400 hover:text-white hover:bg-white/5 border-transparent";

        return `${linkBaseClass} ${isActive ? activeColors : inactiveColors} ${
            isCollapsed ? "justify-center px-0 py-2.5 h-10 w-10 mx-auto" : "gap-3 px-4 py-2.5"
        }`;
    };

    return (
        <aside 
            className={`bg-[#060E1A] h-screen fixed left-0 top-0 border-r border-[#1E3A5F] flex flex-col z-50 transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-[80px]" : "w-[260px]"
            }`}
        >
            <div className={`p-4 flex items-center border-b border-[#1E3A5F]/40 ${
                isCollapsed ? "flex-col gap-2 justify-center" : "justify-between"
            }`}>
                {!isCollapsed ? (
                    <Link href="/admin" className="flex items-baseline gap-1 transition-all duration-300">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            MOV<span className="text-[#FF6B00]">EK</span>
                        </span>
                        <span className="text-xs font-medium text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 ml-2">
                            ADMIN
                        </span>
                    </Link>
                ) : (
                    <Link href="/admin" className="flex items-baseline transition-all duration-300">
                        <span className="text-2xl font-bold text-[#FF6B00] tracking-tight">
                            M
                        </span>
                    </Link>
                )}
                
                <button
                    onClick={onToggle}
                    className="p-1.5 bg-[#0F2040] hover:bg-[#1E3A5F] border border-[#1E3A5F] rounded-lg text-slate-400 hover:text-white transition-all duration-300"
                    title={isCollapsed ? "Déplier le menu" : "Replier le menu"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
                <div className="space-y-6">
                    <div>
                        {!isCollapsed ? (
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                                Overview
                            </div>
                        ) : (
                            <hr className="border-[#1E3A5F]/30 my-2 mx-2" />
                        )}
                        <nav className="space-y-1">
                            <Link href="/admin" className={getLinkClass("/admin")}>
                                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Tableau de bord</span>}
                            </Link>
                        </nav>
                    </div>

                    <div>
                        {!isCollapsed ? (
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                                Gestion Utilisateurs
                            </div>
                        ) : (
                            <hr className="border-[#1E3A5F]/30 my-2 mx-2" />
                        )}
                        <nav className="space-y-1">
                            <Link href="/admin/clients" className={getLinkClass("/admin/clients")}>
                                <Users className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Clients</span>}
                            </Link>
                            <Link href="/admin/fournisseurs" className={getLinkClass("/admin/fournisseurs")}>
                                <Factory className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Fournisseurs</span>}
                            </Link>
                        </nav>
                    </div>

                    <div>
                        {!isCollapsed ? (
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                                Catalogue
                            </div>
                        ) : (
                            <hr className="border-[#1E3A5F]/30 my-2 mx-2" />
                        )}
                        <nav className="space-y-1">
                            <Link href="/admin/produits" className={getLinkClass("/admin/produits")}>
                                <Package className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Produits</span>}
                            </Link>
                            <Link href="/admin/familles" className={getLinkClass("/admin/familles")}>
                                <FolderTree className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Familles & Catégories</span>}
                            </Link>
                        </nav>
                    </div>

                    <div>
                        {!isCollapsed ? (
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                                Commercial
                            </div>
                        ) : (
                            <hr className="border-[#1E3A5F]/30 my-2 mx-2" />
                        )}
                        <nav className="space-y-1">
                            <Link href="/admin/commandes" className={getLinkClass("/admin/commandes")}>
                                <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Commandes</span>}
                            </Link>
                            <Link href="/admin/demandes" className={getLinkClass("/admin/demandes")}>
                                <Search className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Demandes Introuvables</span>}
                            </Link>
                        </nav>
                    </div>

                    <div>
                        {!isCollapsed ? (
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">
                                Communication
                            </div>
                        ) : (
                            <hr className="border-[#1E3A5F]/30 my-2 mx-2" />
                        )}
                        <nav className="space-y-1">
                            <Link href="/admin/notifications" className={getLinkClass("/admin/notifications")}>
                                <Bell className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Notifications</span>}
                            </Link>
                            <Link href="/admin/blog" className={getLinkClass("/admin/blog")}>
                                <FileText className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Blog</span>}
                            </Link>
                            <Link href="/admin/documents" className={getLinkClass("/admin/documents")}>
                                <FileCode className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Documents Techniques</span>}
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-[#1E3A5F]">
                {!isCollapsed ? (
                    <div className="bg-[#0F2040] rounded-lg p-3 w-full">
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
                ) : (
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg mx-auto transition-colors"
                        title="Déconnexion"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );
}
