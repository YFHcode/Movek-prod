import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import ProductForm from "@/components/fournisseur/ProductForm";
import { getCategories } from "@/app/actions/categories";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Modifier un Produit | Espace Fournisseur | MOVEK",
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/fournisseur/login");
    }

    const { data: fournisseur } = await supabase
        .from("fournisseurs")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!fournisseur) {
        redirect("/fournisseur/login");
    }

    const { data: product } = await supabase
        .from("products")
        .select(`
            *,
            product_images ( id, image_url, ordre ),
            technical_sheets ( id, file_url, file_name )
        `)
        .eq("id", params.id)
        .eq("fournisseur_id", fournisseur.id)
        .single();

    if (!product) {
        notFound();
    }

    const { families, subcategories } = await getCategories();

    // Map data to InitialProductData format
    const initialData = {
        ...product,
        images: product.product_images
            ?.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
            .map((img: { id: string; image_url: string; ordre: number }) => ({
                id: img.id,
                url: img.image_url,
                ordre: img.ordre,
            })),
        technical_sheet: product.technical_sheets?.[0] || null,
    };

    // Client action for delete
    const deleteAction = async () => {
        "use server";
        await deleteProduct(params.id);
        redirect("/espace-fournisseur/produits");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/espace-fournisseur/produits"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-movek-border bg-movek-card text-movek-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Modifier Produit</h1>
                        <p className="mt-1 text-sm text-movek-text-secondary">
                            Réf: {product.article}
                        </p>
                    </div>
                </div>

                <form action={deleteAction}>
                    <Button variant="destructive" type="submit" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Supprimer le produit
                    </Button>
                </form>
            </div>

            <ProductForm
                families={families}
                subcategories={subcategories}
                isEditMode={true}
                initialData={initialData}
            />
        </div>
    );
}
