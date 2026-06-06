import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Linkedin,
    Instagram,
} from "lucide-react";

const quickLinks = [
    { href: "/produits", label: "Produits" },
    { href: "/services", label: "Services" },
    { href: "/partenaires", label: "Partenaires" },
    { href: "/introuvable", label: "Produit Introuvable" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
];

const legalLinks = [
    { href: "/legal/mentions-legales", label: "Mentions Légales" },
    { href: "/legal/cgv", label: "CGV" },
    { href: "/legal/confidentialite", label: "Politique de Confidentialité" },
    { href: "/legal/retour-garantie", label: "Politique de Retour" },
    { href: "/legal/livraison", label: "Politique de Livraison" },
    { href: "/legal/paiement", label: "Modes de Paiement" },
];

const portalLinks = [
    { href: "/client/register", label: "Créer un Compte Client" },
    { href: "/fournisseur/register", label: "Devenir Fournisseur" },
    { href: "/client/login", label: "Connexion Client" },
    { href: "/fournisseur/login", label: "Connexion Fournisseur" },
];

export default function Footer() {
    return (
        <footer className="border-t border-movek-border bg-[#060F1E]">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1 – Brand + Contact */}
                    <div>
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold text-white">
                                MO<span className="text-movek-orange">V</span>EK
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-movek-text-secondary">
                            Marketplace B2B dédiée aux produits industriels. Opérée par ETREND
                            dans le cadre du modèle FBE (Fulfilled By ETREND).
                        </p>
                        <div className="mt-4 space-y-2">
                            <a
                                href="mailto:contact@etrend-maroc.com"
                                className="flex items-center gap-2 text-sm text-movek-text-secondary transition-colors hover:text-movek-orange"
                            >
                                <Mail className="h-4 w-4 shrink-0" />
                                contact@etrend-maroc.com
                            </a>
                            <a
                                href="tel:+212000000000"
                                className="flex items-center gap-2 text-sm text-movek-text-secondary transition-colors hover:text-movek-orange"
                            >
                                <Phone className="h-4 w-4 shrink-0" />
                                +212 000 000 000
                            </a>
                            <p className="flex items-center gap-2 text-sm text-movek-text-secondary">
                                <MapPin className="h-4 w-4 shrink-0" />
                                Maroc
                            </p>
                        </div>
                    </div>

                    {/* Column 2 – Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Liens Rapides
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-movek-text-secondary transition-colors hover:text-movek-orange"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 – Portals */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Espace Utilisateur
                        </h3>
                        <ul className="space-y-2">
                            {portalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-movek-text-secondary transition-colors hover:text-movek-orange"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4 – Legal */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Informations Légales
                        </h3>
                        <ul className="space-y-2">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-movek-text-secondary transition-colors hover:text-movek-orange"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="my-8 bg-movek-border" />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-movek-text-secondary">
                        © {new Date().getFullYear()} MOVEK — Opéré par{" "}
                        <span className="font-semibold text-white">ETREND</span>. Tous
                        droits réservés.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            aria-label="Facebook"
                            className="text-movek-text-secondary transition-colors hover:text-movek-orange"
                        >
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a
                            href="#"
                            aria-label="LinkedIn"
                            className="text-movek-text-secondary transition-colors hover:text-movek-orange"
                        >
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a
                            href="#"
                            aria-label="Instagram"
                            className="text-movek-text-secondary transition-colors hover:text-movek-orange"
                        >
                            <Instagram className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
