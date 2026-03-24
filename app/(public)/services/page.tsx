import { createClient } from "@/lib/supabase/server";
import {
    Zap, Snowflake, Droplets, Gauge, Layers, Settings2, Wind,
    Wrench, Truck, Target, Cpu, Sliders, BarChart, Factory,
    Ruler, Paintbrush, Hammer,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Services Industriels",
    description: "Découvrez nos services industriels : électricité, froid, hydraulique, mécanique, automatisme et plus. Installation, maintenance et mise en service.",
};

const serviceIcons: Record<string, React.ReactNode> = {
    "electricien-industriel": <Zap className="h-8 w-8" />,
    "technicien-frigoriste-cta": <Snowflake className="h-8 w-8" />,
    "technicien-hydraulique-industriel": <Droplets className="h-8 w-8" />,
    "tuyauteur-industriel": <Gauge className="h-8 w-8" />,
    "technicien-isolation": <Layers className="h-8 w-8" />,
    "electromecanicien-industriel": <Settings2 className="h-8 w-8" />,
    "technicien-maintenance-pneumatique": <Wind className="h-8 w-8" />,
    "mecanicien-industriel": <Wrench className="h-8 w-8" />,
    "mecanique-engins-groupe-electrogene": <Truck className="h-8 w-8" />,
    "mecanique-de-precision": <Target className="h-8 w-8" />,
    "automaticien-regulation-pilotage": <Cpu className="h-8 w-8" />,
    "specialise-variateur": <Sliders className="h-8 w-8" />,
    "technicien-instrumentation": <BarChart className="h-8 w-8" />,
    "technicien-process-industriel": <Factory className="h-8 w-8" />,
    "technicien-metrologie": <Ruler className="h-8 w-8" />,
    "peintre-industriel": <Paintbrush className="h-8 w-8" />,
    "chaudronnier-acier-inox": <Hammer className="h-8 w-8" />,
};

export default async function ServicesPage() {
    const supabase = await createClient();

    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("nom", { ascending: true });

    return (
        <>
            {/* Hero */}
            <section className="border-t-4 border-movek-orange bg-movek-navy px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <nav className="mb-4 text-sm text-movek-text-secondary">
                        <Link href="/" className="hover:text-movek-orange">Accueil</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">Services</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        NOS SERVICES <span className="text-movek-orange">INDUSTRIELS</span>
                    </h1>
                    <p className="mt-2 text-lg text-movek-text-secondary">
                        Installation, Maintenance &amp; Mise en Service
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="bg-movek-navy px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(services || []).map((service) => (
                            <div
                                key={service.id}
                                className="group rounded-xl border border-movek-border bg-movek-card p-6 transition-all hover:border-movek-orange"
                            >
                                <div className="mb-4 text-movek-orange">
                                    {serviceIcons[service.slug] || <Wrench className="h-8 w-8" />}
                                </div>
                                <h3 className="mb-2 text-sm font-bold text-white">
                                    {service.nom}
                                </h3>
                                {service.description && (
                                    <p className="text-xs text-movek-text-secondary">
                                        {service.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-movek-navy px-4 pb-20 pt-8">
                <div className="mx-auto max-w-2xl rounded-xl border border-movek-border bg-movek-card p-8 text-center">
                    <h2 className="mb-2 text-xl font-bold text-white">
                        Besoin d&apos;un service spécifique ?
                    </h2>
                    <p className="mb-6 text-sm text-movek-text-secondary">
                        Contactez notre équipe d&apos;experts industriels
                    </p>
                    <Link href="/introuvable">
                        <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110 transition-all">
                            SOUMETTRE UNE DEMANDE
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
