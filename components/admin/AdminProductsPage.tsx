"use client";

import React, { useTransition } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, X, ShieldAlert, Loader2, Play, Pause } from "lucide-react";
import { toggleProductStatus } from "@/app/actions/admin_catalog";
import { downloadCSV } from "@/lib/utils-csv";

type ProductRow = {
    id: string;
    article: string;
    designation: string;
    marque: string;
    prix: number;
    fournisseurs: { entreprise: string } | null;
    product_families: { nom: string } | null;
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
};

export default function AdminProductsPage({ products }: { products: ProductRow[] }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (id: string, field: 'is_approved' | 'is_active', currentValue: boolean) => {
        startTransition(async () => {
            const result = await toggleProductStatus(id, field, currentValue);
            if (!result.success && result.error) {
                alert(result.error);
            }
        });
    };

    const handleExport = () => {
        const exportData = products.map(p => ({
            "ID": p.id,
            "Article": p.article,
            "Désignation": p.designation,
            "Marque": p.marque || "",
            "Prix (MAD)": p.prix || "",
            "Fournisseur": p.fournisseurs?.entreprise || "Inconnu",
            "Famille": p.product_families?.nom || "",
            "Statut Admin": p.is_approved ? "Approuvé" : "En attente",
            "Statut Fournisseur": p.is_active ? "En ligne" : "En pause",
            "Date d'ajout": format(new Date(p.created_at), "dd/MM/yyyy HH:mm")
        }));
        downloadCSV(exportData, "produits_movek");
    };

    const columns: ColumnDef<ProductRow>[] = [
        {
            accessorKey: "article",
            header: "Produit",
            cell: ({ row }) => {
                return (
                    <div>
                        <div className="font-semibold text-white">{row.original.article}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]" title={row.original.designation}>
                            {row.original.designation}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorFn: (row) => row.fournisseurs?.entreprise || "Inconnu",
            id: "fournisseur",
            header: "Fournisseur",
            cell: ({ getValue }) => <div className="text-white">{getValue() as string}</div>
        },
        {
            accessorKey: "prix",
            header: "Prix",
            cell: ({ row }) => (
                <div className="text-white font-medium">
                    {row.original.prix ? `${row.original.prix.toLocaleString('fr-MA')} MAD` : "Sur devis"}
                </div>
            )
        },
        {
            accessorKey: "is_approved",
            header: "Validation Admin",
            cell: ({ row }) => {
                const isApproved = row.original.is_approved;
                return (
                    <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isApproved
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {isApproved ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            {isApproved ? "Approuvé" : "En attente"}
                        </div>

                        <button
                            onClick={() => handleToggle(row.original.id, 'is_approved', isApproved)}
                            disabled={isPending}
                            className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${isApproved
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                }`}
                            title={isApproved ? "Révoquer" : "Approuver"}
                        >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isApproved ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                );
            }
        },
        {
            accessorKey: "is_active",
            header: "Statut Fournisseur",
            cell: ({ row }) => {
                const isActive = row.original.is_active;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isActive
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                        {isActive ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        {isActive ? "En ligne" : "En pause"}
                    </div>
                );
            }
        },
        {
            accessorKey: "created_at",
            header: "Ajouté le",
            cell: ({ row }) => <div className="text-slate-300">{format(new Date(row.original.created_at), "dd MMM yyyy", { locale: fr })}</div>
        }
    ];

    return (
        <>
            <AdminTopBar title="Catalogue Produits" adminName="Admin" />
            <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-60px)]">
                <AdminDataTable
                    columns={columns}
                    data={products}
                    searchKey="article"
                    searchPlaceholder="Rechercher par article, désignation ou fournisseur..."
                    onExport={handleExport}
                />
            </div>
        </>
    );
}
