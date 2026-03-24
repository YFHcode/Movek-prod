"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart, Trash2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeInterest } from "@/app/actions/interests";
import { useToast } from "@/hooks/use-toast";
import ConditionBadge from "@/components/marketplace/ConditionBadge";
import type { ProductCondition } from "@/lib/types";

interface InterestProduct {
    id: string;
    article: string;
    designation: string;
    marque: string | null;
    reference: string | null;
    etat: string;
}

interface Interest {
    id: string;
    created_at: string;
    expires_at: string;
    product_id: string;
    public_products: InterestProduct;
}

function getDaysLeft(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function InterestCard({ interest, onRemove }: { interest: Interest; onRemove: (id: string) => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const product = interest.public_products;
    const daysLeft = getDaysLeft(interest.expires_at);

    function handleRemove() {
        startTransition(async () => {
            const result = await removeInterest(interest.id);
            if (result.success) {
                onRemove(interest.id);
                toast({ description: "Retiré de vos intérêts" });
            } else {
                toast({ variant: "destructive", description: result.error || "Une erreur est survenue." });
            }
        });
    }

    if (!product) return null;

    return (
        <div className="rounded-xl border border-movek-border bg-movek-card overflow-hidden transition-all hover:border-movek-orange/30">
            <div className="p-4">
                {/* Top: condition + expiry */}
                <div className="mb-3 flex items-center justify-between">
                    <ConditionBadge condition={product.etat as ProductCondition} />
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${daysLeft < 2
                            ? "bg-red-500/20 text-red-400"
                            : daysLeft < 5
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-movek-navy text-movek-text-secondary"
                            }`}
                    >
                        Expire dans {daysLeft}j
                    </span>
                </div>

                {/* Product info */}
                <Link href={`/produits/${product.id}`} className="group">
                    <h3 className="mb-1 text-sm font-bold text-white group-hover:text-movek-orange transition-colors">
                        {product.article}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-xs text-movek-text-secondary">
                        {product.designation}
                    </p>
                </Link>

                <div className="mb-4 space-y-1 text-xs text-movek-text-secondary">
                    {product.marque && (
                        <p>
                            <span className="text-movek-text-secondary">Marque:</span>{" "}
                            <span className="text-white">{product.marque}</span>
                        </p>
                    )}
                    {product.reference && (
                        <p>
                            <span className="text-movek-text-secondary">Réf:</span>{" "}
                            <span className="text-white">{product.reference}</span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/produits/${product.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-movek-border text-movek-text-secondary hover:border-movek-orange hover:text-white"
                        >
                            Voir le produit
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={handleRemove}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function InterestsClient({
    initialInterests,
}: {
    initialInterests: Interest[];
}) {
    const [interests, setInterests] = useState(initialInterests);

    function handleRemove(id: string) {
        setInterests((prev) => prev.filter((i) => i.id !== id));
    }

    if (interests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-movek-border bg-movek-card py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-movek-navy">
                    <Heart className="h-10 w-10 text-movek-text-secondary" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-white">
                    Aucun produit intéressé
                </h2>
                <p className="mb-6 text-sm text-movek-text-secondary">
                    Explorez notre catalogue et marquez les produits qui vous intéressent.
                </p>
                <Link href="/produits">
                    <Button className="rounded-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110">
                        Explorer le catalogue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {interests.map((interest) => (
                <InterestCard key={interest.id} interest={interest} onRemove={handleRemove} />
            ))}
        </div>
    );
}
