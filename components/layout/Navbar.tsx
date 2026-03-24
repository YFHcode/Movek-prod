import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { Menu, User, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NotificationBell from "@/components/dashboard/NotificationBell";

const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/produits", label: "Produits" },
    { href: "/services", label: "Services" },
    { href: "/partenaires", label: "Partenaires" },
    { href: "/blog", label: "Blog" },
    { href: "/introuvable", label: "Produit Introuvable" },
    { href: "/contact", label: "Contact" },
];

export default async function Navbar() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let isClient = false;
    let unreadCount = 0;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === "client") {
            isClient = true;
            const { count } = await supabase
                .from("notifications")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_read", false);
            unreadCount = count || 0;
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-movek-border bg-movek-navy/95 backdrop-blur supports-[backdrop-filter]:bg-movek-navy/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-white">
                            MOV<span className="text-movek-orange">EK</span>
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-movek-text-secondary transition-colors hover:text-white hover:bg-white/5"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 lg:flex">
                    {isClient && user ? (
                        <>
                            <NotificationBell userId={user.id} initialCount={unreadCount} />
                            <Link href="/mon-compte">
                                <Button className="rounded-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110 transition-all">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Mon Compte
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/fournisseur/register">
                                <Button className="rounded-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110 transition-all">
                                    Espace Fournisseur
                                </Button>
                            </Link>
                            <Link href="/client/login">
                                <Button
                                    variant="outline"
                                    className="rounded-full border-movek-border text-white hover:bg-white/5 hover:border-movek-orange transition-all"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Connexion
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon" className="text-white">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-80 border-movek-border bg-movek-navy"
                    >
                        <SheetTitle className="text-white">
                            MOV<span className="text-movek-orange">EK</span>
                        </SheetTitle>
                        <nav className="mt-8 flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-md px-4 py-3 text-sm font-medium text-movek-text-secondary transition-colors hover:bg-movek-card hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-4 flex flex-col gap-3 border-t border-movek-border pt-4">
                                {isClient && user ? (
                                    <>
                                        <Link href="/mon-compte">
                                            <Button className="w-full rounded-full bg-movek-orange font-semibold text-white hover:brightness-110">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Mon Compte
                                            </Button>
                                        </Link>
                                        <div className="flex justify-center">
                                            <NotificationBell userId={user.id} initialCount={unreadCount} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/fournisseur/register">
                                            <Button className="w-full rounded-full bg-movek-orange font-semibold text-white hover:brightness-110">
                                                Espace Fournisseur
                                            </Button>
                                        </Link>
                                        <Link href="/client/login">
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-full border-movek-border text-white hover:bg-white/5"
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Connexion
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
