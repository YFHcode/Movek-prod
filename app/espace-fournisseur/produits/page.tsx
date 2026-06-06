import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Package, Clock, CheckCircle2, Edit2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Mes Produits | Espace Fournisseur | MOVEK",
};

export default async function FournisseurProductsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: fournisseur } = await supabase
        .from("fournisseurs")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!fournisseur) return null;

    const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`
            id,
            article,
            reference,
            etat,
            is_approved,
            created_at,
            product_images (
                image_url,
                ordre
            )
        `)
        .eq("fournisseur_id", fournisseur.id)
        .order("created_at", { ascending: false });

    console.log("[Fournisseur Produits] fournisseur_id:", fournisseur.id, "| products count:", products?.length, "| error:", productsError);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mes Produits</h1>
                    <p className="mt-1 text-sm text-movek-text-secondary">
                        Gérez votre catalogue de produits industriels
                    </p>
                </div>
                <Link href="/espace-fournisseur/produits/ajouter">
                    <Button className="flex w-full items-center gap-2 rounded-full bg-movek-orange font-semibold text-white hover:brightness-110 sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Nouveau Produit
                    </Button>
                </Link>
            </div>

            {(!products || products.length === 0) ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-movek-border bg-movek-navy/50 p-8 text-center">
                    <div className="mb-4 rounded-full bg-movek-orange/10 p-4">
                        <Package className="h-8 w-8 text-movek-orange" />
                    </div>
                    <h2 className="mb-2 text-lg font-bold text-white">Aucun produit</h2>
                    <p className="mb-6 max-w-sm text-sm text-movek-text-secondary">
                        Vous n&apos;avez pas encore ajouté de produit à votre catalogue.
                        Commencez dès maintenant !
                    </p>
                    <Link href="/espace-fournisseur/produits/ajouter">
                        <Button className="rounded-full bg-movek-orange font-semibold text-white hover:brightness-110">
                            Ajouter mon premier produit
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const firstImage = product.product_images
                            ?.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)[0]?.image_url;

                        return (
                            <div key={product.id} className="group relative flex flex-col rounded-xl border border-movek-border bg-movek-card overflow-hidden hover:border-movek-orange/50 transition-colors">
                                {/* Image */}
                                <div className="relative aspect-[4/3] w-full bg-movek-navy">
                                    {firstImage ? (
                                        <Image
                                            src={firstImage}
                                            alt={product.article}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-10 w-10 text-movek-text-secondary/50" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        {product.is_approved ? (
                                            <span className="flex items-center gap-1.5 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm shadow-sm">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                En ligne
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm shadow-sm">
                                                <Clock className="h-3.5 w-3.5" />
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-4">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-white line-clamp-2" title={product.article}>
                                            {product.article}
                                        </h3>
                                    </div>
                                    <div className="mt-auto pt-4 flex flex-col gap-1 text-xs text-movek-text-secondary">
                                        {product.reference && (
                                            <p><span className="opacity-70">Réf:</span> {product.reference}</p>
                                        )}
                                        <p><span className="opacity-70">État:</span> {product.etat}</p>
                                        <p><span className="opacity-70">Ajouté le:</span> {new Date(product.created_at).toLocaleDateString("fr-FR")}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex items-center gap-2 border-t border-movek-border pt-4">
                                        <Link href={`/espace-fournisseur/produits/${product.id}/modifier`} className="flex-1">
                                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-9 border-movek-border bg-movek-navy text-white hover:bg-movek-orange/10 hover:text-movek-orange hover:border-movek-orange">
                                                <Edit2 className="h-3.5 w-3.5" />
                                                Modifier
                                            </Button>
                                        </Link>
                                    </div>


                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
