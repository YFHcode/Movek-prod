import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    showIntrouvableLink?: boolean;
}

export default function EmptyState({
    title = "Aucun produit trouvé",
    description = "Vous ne trouvez pas ce que vous cherchez ?",
    showIntrouvableLink = true,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-full bg-movek-card p-6">
                <SearchX className="h-12 w-12 text-movek-text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
            <p className="mb-6 max-w-md text-movek-text-secondary">{description}</p>
            {showIntrouvableLink && (
                <Link href="/introuvable">
                    <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110 transition-all">
                        SOUMETTRE UNE DEMANDE
                    </Button>
                </Link>
            )}
        </div>
    );
}
