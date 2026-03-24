"use client";

import React, { useTransition } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateOrderStatus } from "@/app/actions/admin_commercial";
import { downloadCSV } from "@/lib/utils-csv";

type OrderRow = {
    id: string;
    statut: string;
    created_at: string;
    fournisseur_name?: string;
    clients: {
        entreprise: string;
        nom_prenom: string;
        email: string;
    } | null;
    products: {
        article: string;
    } | null;
};

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
    pending: { label: "En attente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    confirmed: { label: "Confirmée", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    quality_check: { label: "Contrôle Qualité", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    invoiced: { label: "Facturée", color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    shipped: { label: "Expédiée", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    delivered: { label: "Livrée", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    cancelled: { label: "Annulée", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function AdminOrdersPage({ orders }: { orders: OrderRow[] }) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (orderId: string, newStatus: string) => {
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (!result.success && result.error) {
                alert(result.error);
            }
        });
    };

    const handleExport = () => {
        const exportData = orders.map(o => ({
            "ID Commande": o.id,
            "Date": format(new Date(o.created_at), "dd/MM/yyyy HH:mm"),
            "Client (Entreprise)": o.clients?.entreprise || "Inconnu",
            "Contact Client": o.clients?.nom_prenom || "",
            "Email Client": o.clients?.email || "",
            "Produit": o.products?.article || "Produit supprimé",
            "Fournisseur": o.fournisseur_name || "Inconnu",
            "Statut": STATUS_LABELS[o.statut]?.label || o.statut
        }));
        downloadCSV(exportData, "commandes_movek");
    };

    const columns: ColumnDef<OrderRow>[] = [
        {
            accessorKey: "id",
            header: "Réf.",
            cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{row.original.id.split('-')[0]}...</span>
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-white">{format(new Date(row.original.created_at), "dd MMM yyyy", { locale: fr })}</span>
        },
        {
            accessorFn: (row) => row.clients?.entreprise || "Inconnu",
            id: "client",
            header: "Client (Acheteur)",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-white">{row.original.clients?.entreprise}</div>
                    <div className="text-xs text-slate-400">{row.original.clients?.nom_prenom}</div>
                </div>
            )
        },
        {
            accessorFn: (row) => row.products?.article || "Produit supprimé",
            id: "produit",
            header: "Produit",
            cell: ({ row }) => (
                <div className="text-white font-medium max-w-[200px] truncate" title={row.original.products?.article}>
                    {row.original.products?.article || "Produit supprimé"}
                </div>
            )
        },
        {
            accessorKey: "fournisseur_name",
            header: "Fournisseur",
            cell: ({ row }) => <span className="text-slate-300">{row.original.fournisseur_name || "Inconnu"}</span>
        },
        {
            accessorKey: "statut",
            header: "Statut",
            cell: ({ row }) => {
                const status = row.original.statut;
                const config = STATUS_LABELS[status] || { label: status, color: "bg-slate-500/10 text-slate-500" };

                return (
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
                        disabled={isPending}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer outline-none appearance-none pr-8 ${config.color} disabled:opacity-50 transition-colors bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')] bg-[length:12px_12px] bg-[right:8px_center]`}
                    >
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                            <option key={key} value={key} className="bg-[#0F2040] text-white">
                                {val.label}
                            </option>
                        ))}
                    </select>
                );
            }
        }
    ];

    return (
        <>
            <AdminTopBar title="Gestion des Commandes" adminName="Admin" />
            <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-60px)]">
                <AdminDataTable
                    columns={columns}
                    data={orders}
                    searchKey="client"
                    searchPlaceholder="Rechercher par client ou produit..."
                    onExport={handleExport}
                />
            </div>
        </>
    );
}
