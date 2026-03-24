import type { OrderStatus } from "@/lib/types";

const statusConfig: Record<
    OrderStatus,
    { label: string; bgColor: string; textColor: string }
> = {
    pending: { label: "En attente", bgColor: "bg-gray-500/20", textColor: "text-gray-400" },
    confirmed: { label: "Confirmée", bgColor: "bg-blue-500/20", textColor: "text-blue-400" },
    quality_check: { label: "Contrôle qualité", bgColor: "bg-orange-500/20", textColor: "text-orange-400" },
    invoiced: { label: "Facturée", bgColor: "bg-purple-500/20", textColor: "text-purple-400" },
    shipped: { label: "Expédiée", bgColor: "bg-amber-500/20", textColor: "text-amber-400" },
    delivered: { label: "Livrée", bgColor: "bg-green-500/20", textColor: "text-green-400" },
    cancelled: { label: "Annulée", bgColor: "bg-red-500/20", textColor: "text-red-400" },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
        >
            {config.label}
        </span>
    );
}
