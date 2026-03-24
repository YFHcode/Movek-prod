import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Factory, Package, Wrench, Truck, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nos Partenaires",
    description: "Découvrez le réseau de partenaires MOVEK : fabricants, distributeurs, experts en maintenance, transporteurs et techniciens spécialisés.",
};

const partners = [
    {
        icon: <Factory className="h-10 w-10 text-movek-orange" />,
        title: "Fabricants Industriels",
        text: "Fabricants de référence proposant des produits de qualité",
    },
    {
        icon: <Package className="h-10 w-10 text-movek-orange" />,
        title: "Distributeurs Spécialisés",
        text: "Distributeurs spécialisés dans les équipements industriels",
    },
    {
        icon: <Wrench className="h-10 w-10 text-movek-orange" />,
        title: "Sociétés de Maintenance",
        text: "Experts en maintenance industrielle et SAV",
    },
    {
        icon: <Truck className="h-10 w-10 text-movek-orange" />,
        title: "Transporteurs Professionnels",
        text: "Logistique fiable pour la livraison de vos équipements",
    },
    {
        icon: <Users className="h-10 w-10 text-movek-orange" />,
        title: "Experts Techniques",
        text: "Ingénieurs et techniciens spécialisés dans l'industrie",
    },
];

export default function PartenairesPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-movek-navy px-4 py-16">
                <div className="mx-auto max-w-7xl text-center">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        NOS <span className="text-movek-orange">PARTENAIRES</span>
                    </h1>
                    <p className="mt-2 text-lg text-movek-text-secondary">
                        Un réseau de confiance au service de l&apos;industrie
                    </p>
                </div>
            </section>

            {/* Partner Categories Grid */}
            <section className="bg-movek-navy px-4 py-12">
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {partners.map((partner) => (
                        <div
                            key={partner.title}
                            className="rounded-xl border border-movek-border bg-movek-card p-8 text-center transition-all hover:border-movek-orange"
                        >
                            <div className="mb-4 flex justify-center">{partner.icon}</div>
                            <h3 className="mb-2 text-lg font-bold text-white">
                                {partner.title}
                            </h3>
                            <p className="text-sm text-movek-text-secondary">
                                {partner.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="bg-movek-orange px-4 py-12">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
                    <h3 className="text-xl font-bold text-[#0A1628]">
                        Vous souhaitez devenir partenaire ?
                    </h3>
                    <Link href="/contact">
                        <Button className="rounded-full bg-white px-8 py-5 font-bold text-[#0A1628] hover:bg-gray-100 transition-all">
                            NOUS CONTACTER
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
