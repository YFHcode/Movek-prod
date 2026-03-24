import { createClient } from "@/lib/supabase/server";
import { Info } from "lucide-react";
import InterestsClient from "./InterestsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes Intérêts",
};

export default async function InterestsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user!.id)
        .single();

    const { data: interests } = await supabase
        .from("interests")
        .select(
            "id, created_at, expires_at, product_id, public_products(id, article, designation, marque, reference, etat)"
        )
        .eq("client_id", client!.id)
        .eq("is_deleted", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">
                    Mes Produits Intéressés
                </h1>
                <p className="text-sm text-movek-text-secondary">
                    Les intérêts sont conservés pendant 7 jours
                </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-lg border border-movek-orange/30 bg-movek-orange/10 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-movek-orange" />
                <p className="text-sm text-movek-text-secondary">
                    Vos intérêts sont automatiquement supprimés après 7 jours.
                    Contactez-nous pour concrétiser votre achat.
                </p>
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <InterestsClient initialInterests={(interests as any) || []} />
        </div>
    );
}
