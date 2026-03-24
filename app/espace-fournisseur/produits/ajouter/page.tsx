import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/fournisseur/ProductForm";
import { getCategories } from "@/app/actions/categories";

export const metadata = {
    title: "Ajouter un Produit | Espace Fournisseur | MOVEK",
};

export default async function AddProductPage() {
    const { families, subcategories } = await getCategories();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/espace-fournisseur/produits"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-movek-border bg-movek-card text-movek-text-secondary hover:bg-white/5 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Nouveau Produit</h1>
                    <p className="mt-1 text-sm text-movek-text-secondary">
                        Complétez les informations ci-dessous pour publier un nouveau produit.
                    </p>
                </div>
            </div>

            <ProductForm
                families={families}
                subcategories={subcategories}
                isEditMode={false}
            />
        </div>
    );
}
