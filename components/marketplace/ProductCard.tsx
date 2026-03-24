import Link from "next/link";
import Image from "next/image";
import type { PublicProduct, ProductImage } from "@/lib/types";
import ConditionBadge from "./ConditionBadge";
import IndustrialPlaceholder from "./IndustrialPlaceholder";
import InterestButton from "./InterestButton";

interface ProductCardProps {
    product: PublicProduct & { product_images?: ProductImage[] };
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImage = product.product_images?.sort(
        (a, b) => a.ordre - b.ordre
    )[0];

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-movek-border bg-movek-card transition-all hover:border-movek-orange">
            {/* Image */}
            <Link href={`/produits/${product.id}`} className="relative aspect-square">
                {mainImage ? (
                    <Image
                        src={mainImage.image_url}
                        alt={product.article}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <IndustrialPlaceholder className="h-full w-full" />
                )}
                {product.etat && (
                    <div className="absolute right-3 top-3">
                        <ConditionBadge condition={product.etat} />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/produits/${product.id}`} className="flex-1">
                    <h3 className="line-clamp-1 text-sm font-bold text-white">
                        {product.article}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-movek-text-secondary">
                        {product.designation}
                    </p>
                    {(product.marque || product.reference) && (
                        <p className="mt-2 line-clamp-1 text-xs text-movek-text-secondary">
                            {product.marque && <span>Marque: {product.marque}</span>}
                            {product.marque && product.reference && <span> · </span>}
                            {product.reference && <span>Réf: {product.reference}</span>}
                        </p>
                    )}
                </Link>

                {/* Interest button — NO PRICE, NO SUPPLIER */}
                <div className="mt-4">
                    <InterestButton productId={product.id} />
                </div>
            </div>
        </div>
    );
}
