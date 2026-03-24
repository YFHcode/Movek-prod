"use client";

import React, { useTransition } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { approveFournisseur } from "@/app/actions/admin_users";
import { downloadCSV } from "@/lib/utils-csv";

// Type definition based on DB schema
type FournisseurRow = {
    id: string;
    nom_prenom: string;
    entreprise: string;
    email: string;
    telephone: string;
    pays: string;
    is_approved: boolean;
    created_at: string;
};

export default function AdminFournisseursPage({ fournisseurs }: { fournisseurs: FournisseurRow[] }) {
    const [isPending, startTransition] = useTransition();

    const handleToggleApproval = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const result = await approveFournisseur(id, !currentStatus);
            if (!result.success && result.error) {
                alert(result.error);
            }
        });
    };

    const handleExport = () => {
        const exportData = fournisseurs.map(f => ({
            "ID": f.id,
            "Nom Complet": f.nom_prenom,
            "Entreprise": f.entreprise,
            "Email": f.email,
            "Téléphone": f.telephone || "",
            "Pays": f.pays || "",
            "Statut": f.is_approved ? "Approuvé" : "En attente",
            "Date d'inscription": format(new Date(f.created_at), "dd/MM/yyyy HH:mm")
        }));
        downloadCSV(exportData, "fournisseurs_movek");
    };

    const columns: ColumnDef<FournisseurRow>[] = [
        {
            accessorKey: "nom_prenom",
            header: "Fournisseur",
            cell: ({ row }) => {
                return (
                    <div>
                        <div className="font-semibold text-white">{row.original.nom_prenom}</div>
                        <div className="text-xs text-slate-400">{row.original.email}</div>
                    </div>
                );
            }
        },
        {
            accessorKey: "entreprise",
            header: "Entreprise",
            cell: ({ row }) => (
                <div>
                    <div className="text-white">{row.original.entreprise}</div>
                    <div className="text-xs text-slate-400">{row.original.pays}</div>
                </div>
            )
        },
        {
            accessorKey: "telephone",
            header: "Téléphone",
        },
        {
            accessorKey: "created_at",
            header: "Inscription",
            cell: ({ row }) => format(new Date(row.original.created_at), "dd MMM yyyy", { locale: fr })
        },
        {
            accessorKey: "is_approved",
            header: "Statut",
            cell: ({ row }) => {
                const isApproved = row.original.is_approved;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isApproved
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                        {isApproved ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {isApproved ? "Approuvé" : "En attente"}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const fournisseur = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleToggleApproval(fournisseur.id, fournisseur.is_approved)}
                            disabled={isPending}
                            className={`flex items-center justify-center w-8 h-8 rounded shrink-0 transition-colors ${fournisseur.is_approved
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                                }`}
                            title={fournisseur.is_approved ? "Révoquer l'accès" : "Approuver le fournisseur"}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : fournisseur.is_approved ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <AdminTopBar title="Gestion des Fournisseurs" adminName="Admin" />
            <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-60px)]">
                <AdminDataTable
                    columns={columns}
                    data={fournisseurs}
                    searchKey="nom_prenom"
                    searchPlaceholder="Rechercher par nom ou entreprise..."
                    onExport={handleExport}
                />
            </div>
        </>
    );
}
