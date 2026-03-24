"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Heart,
    Package,
    Bell,
    UserCircle,
    LogOut,
    Mail,
} from "lucide-react";
import { logoutClient } from "@/app/actions/auth";

const clientMenuItems = [
    {
        href: "/mon-compte",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        exact: true,
    },
    { href: "/mon-compte/interesses", label: "Mes Intérêts", icon: Heart },
    { href: "/mon-compte/commandes", label: "Mes Commandes", icon: Package },
    {
        href: "/mon-compte/notifications",
        label: "Notifications",
        icon: Bell,
    },
    { href: "/mon-compte/profil", label: "Mon Profil", icon: UserCircle },
];

const fournisseurMenuItems = [
    {
        href: "/espace-fournisseur",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        exact: true,
    },
    { href: "/espace-fournisseur/produits", label: "Mes Produits", icon: Package },
    { href: "/espace-fournisseur/messages", label: "Messages ETREND", icon: Mail },
    { href: "/espace-fournisseur/profil", label: "Mon Profil", icon: UserCircle },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    const isFournisseur = pathname.startsWith("/espace-fournisseur");
    const menuItems = isFournisseur ? fournisseurMenuItems : clientMenuItems;

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sticky top-20 hidden h-fit w-60 shrink-0 rounded-xl border border-movek-border bg-movek-card lg:block">
                <nav className="flex flex-col py-2">
                    {menuItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${active
                                        ? "border-l-[3px] border-movek-orange bg-movek-orange/5 text-movek-orange"
                                        : "border-l-[3px] border-transparent text-movek-text-secondary hover:bg-[#1E3A5F]/50 hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Logout */}
                    <form action={logoutClient}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 border-l-[3px] border-transparent px-5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Mobile Tabs */}
            <div className="mb-4 overflow-x-auto border-b border-movek-border lg:hidden">
                <div className="flex min-w-max gap-0">
                    {menuItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-medium transition-colors ${active
                                        ? "border-b-2 border-movek-orange text-movek-orange"
                                        : "text-movek-text-secondary hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                    <form action={logoutClient}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-medium text-red-400 hover:text-red-300"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Déconnexion
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
