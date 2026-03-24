import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldCheck, Handshake, Headphones, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConditionBadge from "@/components/marketplace/ConditionBadge";
import IndustrialPlaceholder from "@/components/marketplace/IndustrialPlaceholder";
import InterestButton from "@/components/marketplace/InterestButton";
import ProductCard from "@/components/marketplace/ProductCard";
import ImageGallery from "./ImageGallery";
import type { Metadata } from "next";
import type { ProductCondition } from "@/lib/types";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from("public_products")
        .select("article, designation, marque, etat, reference")
        .eq("id", id)
        .single();

    if (!product) return { title: "Produit non trouvé" };

    const title = `${product.article}${product.marque ? ` - ${product.marque}` : ""
        } | MOVEK`;

    const description = `${product.designation} - État: ${product.etat || "N/A"
        } - Réf: ${product.reference || "N/A"
        } | Disponible sur MOVEK Marketplace Industriel`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        },
    };
}

export default async function ProductDetailPage({
    params,
}: ProductPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch product from public_products view — NO prix, NO fournisseur_id
    const { data: product, error } = await supabase
        .from("public_products")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !product) {
        notFound();
    }

    // Fetch images
    const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("ordre", { ascending: true });

    // Fetch technical sheets
    const { data: technicalSheets } = await supabase
        .from("technical_sheets")
        .select("*")
        .eq("product_id", id);

    // Fetch related products (same family, different id)
    const { data: relatedProducts } = await supabase
        .from("public_products")
        .select("*, product_images(id, image_url, ordre)")
        .eq("family_id", product.family_id)
        .neq("id", product.id)
        .limit(4);

    // Fetch family & subcategory names
    let familyName = "";
    let subcategoryName = "";

    if (product.family_id) {
        const { data: family } = await supabase
            .from("product_families")
            .select("nom")
            .eq("id", product.family_id)
            .single();
        if (family) familyName = family.nom;
    }

    if (product.subcategory_id) {
        const { data: subcategory } = await supabase
            .from("product_subcategories")
            .select("nom")
            .eq("id", product.subcategory_id)
            .single();
        if (subcategory) subcategoryName = subcategory.nom;
    }

    const hasTechnicalSheet =
        technicalSheets && technicalSheets.length > 0;

    const infoRows = [
        { label: "Article", value: product.article },
        { label: "Désignation", value: product.designation },
        { label: "Marque", value: product.marque },
        { label: "Référence", value: product.reference },
        { label: "Origine", value: product.origine },
        {
            label: "Quantité",
            value:
                product.quantite != null
                    ? `${product.quantite}${product.unite ? ` ${product.unite}` : ""}`
                    : null,
        },
        {
            label: "Garantie",
            value: product.garantie
                ? `Oui${product.garantie_mois ? ` (${product.garantie_mois} mois)` : ""}`
                : "Non",
        },
        { label: "État", value: product.etat },
        { label: "Lieu d'expédition", value: product.lieu_expedition },
        { label: "Famille", value: familyName || null },
        { label: "Sous-catégorie", value: subcategoryName || null },
        // ⚠️ NO prix — intentionally excluded
        // ⚠️ NO fournisseur — intentionally excluded
    ].filter((row) => row.value);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-movek-text-secondary">
                <Link href="/" className="hover:text-movek-orange">
                    Accueil
                </Link>
                <span className="mx-2">/</span>
                <Link href="/produits" className="hover:text-movek-orange">
                    Produits
                </Link>
                <span className="mx-2">/</span>
                <span className="text-white">{product.article}</span>
            </nav>

            {/* Main content: 2 columns */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left: Image Gallery */}
                <div>
                    {images && images.length > 0 ? (
                        <ImageGallery images={images} productName={product.article} />
                    ) : (
                        <IndustrialPlaceholder className="aspect-square w-full rounded-xl" />
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                    {/* Condition badge */}
                    {product.etat && (
                        <div className="mb-4">
                            <ConditionBadge condition={product.etat as ProductCondition} />
                        </div>
                    )}

                    {/* Info grid */}
                    <div className="space-y-0">
                        {infoRows.map((row, i) => (
                            <div
                                key={row.label}
                                className={`grid grid-cols-2 gap-4 py-3 ${i < infoRows.length - 1
                                    ? "border-b border-movek-border"
                                    : ""
                                    }`}
                            >
                                <span className="text-sm text-movek-text-secondary">
                                    {row.label}
                                </span>
                                <span className="text-sm font-semibold text-white">
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-6 space-y-3">
                        <InterestButton productId={product.id} />

                        {hasTechnicalSheet ? (
                            <a
                                href={technicalSheets![0].file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="outline"
                                    className="w-full rounded-full border-movek-orange text-movek-orange hover:bg-movek-orange hover:text-white transition-all mt-3"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Télécharger la Fiche Technique
                                </Button>
                            </a>
                        ) : (
                            <Button
                                disabled
                                variant="outline"
                                className="w-full rounded-full border-movek-border text-movek-text-secondary"
                                title="Non disponible"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Fiche Technique Non Disponible
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                    {
                        icon: <ShieldCheck className="h-8 w-8 text-movek-orange" />,
                        title: "Contrôle Qualité",
                        text: "Chaque produit est vérifié et validé par l'équipe ETREND avant expédition.",
                    },
                    {
                        icon: <Handshake className="h-8 w-8 text-movek-orange" />,
                        title: "Garantie FBE",
                        text: "La vente et la garantie sont assurées exclusivement par ETREND dans le cadre du modèle FBE.",
                    },
                    {
                        icon: <Headphones className="h-8 w-8 text-movek-orange" />,
                        title: "Support Technique",
                        text: "Notre équipe d'experts techniques est disponible pour vous accompagner à chaque étape.",
                    },
                ].map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl border border-movek-border bg-movek-card p-6 text-center"
                    >
                        <div className="mb-3 flex justify-center">{card.icon}</div>
                        <h3 className="mb-2 text-sm font-bold text-white">{card.title}</h3>
                        <p className="text-xs text-movek-text-secondary">{card.text}</p>
                    </div>
                ))}
            </div>

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="mb-6 text-xl font-bold text-white">
                        Produits similaires
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((rp) => (
                            <ProductCard key={rp.id} product={rp} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
