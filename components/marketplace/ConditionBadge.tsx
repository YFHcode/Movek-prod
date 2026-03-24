import { Badge } from "@/components/ui/badge";
import type { ProductCondition } from "@/lib/types";

const conditionConfig: Record<
    ProductCondition,
    { label: string; className: string }
> = {
    neuf: {
        label: "Neuf",
        className: "bg-movek-success/20 text-movek-success border-movek-success/30",
    },
    "neuf-ancien": {
        label: "Neuf-Ancien",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    reconditionne: {
        label: "Reconditionné",
        className: "bg-movek-orange/20 text-movek-orange border-movek-orange/30",
    },
    utilise: {
        label: "Utilisé",
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
};

interface ConditionBadgeProps {
    condition: ProductCondition | null;
    className?: string;
}

export default function ConditionBadge({
    condition,
    className = "",
}: ConditionBadgeProps) {
    if (!condition) return null;

    const config = conditionConfig[condition];
    if (!config) return null;

    return (
        <Badge
            variant="outline"
            className={`text-xs font-semibold ${config.className} ${className}`}
        >
            {config.label}
        </Badge>
    );
}
