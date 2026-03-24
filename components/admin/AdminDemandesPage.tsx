"use client";

import React, { useTransition, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateDemandeStatus } from "@/app/actions/admin_commercial";
import { downloadCSV } from "@/lib/utils-csv";
import { Search, Eye, X } from "lucide-react";

type DemandeRow = {
    id: string;
    nom_prenom: string;
    entreprise: string;
    email: string;
    telephone: string;
    pays: string;
    description: string;
    status: string;
    created_at: string;
};

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
    pending: { label: "En attente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    in_progress: { label: "En cours de traitement", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    resolved: { label: "Trouvé / Résolu", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    closed: { label: "Fermée (Introuvable)", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

export default function AdminDemandesPage({ demandes }: { demandes: DemandeRow[] }) {
    const [isPending, startTransition] = useTransition();
    const [selectedDemande, setSelectedDemande] = useState<DemandeRow | null>(null);
    const [adminReply, setAdminReply] = useState("");

    const handleStatusChange = (demandeId: string, newStatus: string) => {
        startTransition(async () => {
            const result = await updateDemandeStatus(demandeId, newStatus, adminReply);
            if (!result.success && result.error) {
                alert(result.error);
            } else {
                if (adminReply.trim() !== "") {
                    alert("Statut mis à jour et email envoyé au client avec succès.");
                    setAdminReply(""); // clear after sending
                }
            }
            if (selectedDemande && selectedDemande.id === demandeId) {
                setSelectedDemande({ ...selectedDemande, status: newStatus });
            }
        });
    };

    const handleExport = () => {
        const exportData = demandes.map(d => ({
            "ID Demande": d.id,
            "Date": format(new Date(d.created_at), "dd/MM/yyyy HH:mm"),
            "Entreprise": d.entreprise,
            "Contact": d.nom_prenom,
            "Email": d.email,
            "Téléphone": d.telephone || "",
            "Pays": d.pays || "",
            "Description Technique": d.description,
            "Statut": STATUS_LABELS[d.status]?.label || d.status
        }));
        downloadCSV(exportData, "demandes_introuvables_movek");
    };

    const columns: ColumnDef<DemandeRow>[] = [
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-white whitespace-nowrap">{format(new Date(row.original.created_at), "dd MMM yyyy", { locale: fr })}</span>
        },
        {
            accessorKey: "entreprise",
            header: "Client / Entreprise",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-white">{row.original.entreprise}</div>
                    <div className="text-xs text-slate-400">{row.original.nom_prenom}</div>
                </div>
            )
        },
        {
            accessorKey: "description",
            header: "Produit Recherché",
            cell: ({ row }) => (
                <div className="text-slate-300 text-sm max-w-[300px] line-clamp-2" title={row.original.description}>
                    {row.original.description}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => {
                const status = row.original.status;
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
        },
        {
            id: "actions",
            header: "Détails",
            cell: ({ row }) => (
                <button
                    onClick={() => setSelectedDemande(row.original)}
                    className="flex items-center justify-center w-8 h-8 rounded shrink-0 transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                    title="Voir la demande complète"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        }
    ];

    return (
        <>
            <AdminTopBar title="Demandes Produit Introuvable" adminName="Admin" />
            <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-60px)] relative">
                <AdminDataTable
                    columns={columns}
                    data={demandes}
                    searchKey="entreprise"
                    searchPlaceholder="Rechercher par entreprise ou description..."
                    onExport={handleExport}
                />

                {/* Detail Modal */}
                {selectedDemande && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0F2040] border border-[#1E3A5F] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Search className="w-5 h-5 text-[#FF6B00]" />
                                        Détails de la demande
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Soumise le {format(new Date(selectedDemande.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSelectedDemande(null); setAdminReply(""); }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact</div>
                                            <div className="text-white font-medium">{selectedDemande.nom_prenom}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</div>
                                            <a href={`mailto:${selectedDemande.email}`} className="text-blue-400 hover:underline">{selectedDemande.email}</a>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Téléphone</div>
                                            <div className="text-white">{selectedDemande.telephone || "Non renseigné"}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Entreprise</div>
                                            <div className="text-white font-medium">{selectedDemande.entreprise}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Localisation</div>
                                            <div className="text-white">{selectedDemande.pays || "Non renseigné"}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Statut</div>
                                            <select
                                                value={selectedDemande.status}
                                                onChange={(e) => handleStatusChange(selectedDemande.id, e.target.value)}
                                                disabled={isPending}
                                                className={`mt-1 text-sm font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none appearance-none pr-8 ${STATUS_LABELS[selectedDemande.status]?.color} disabled:opacity-50 bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')] bg-[length:16px_16px] bg-[right:8px_center] w-full`}
                                            >
                                                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                                    <option key={key} value={key} className="bg-[#0F2040] text-white">
                                                        {val.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-[#1E3A5F] pt-6">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Description Technique du besoin</div>
                                    <div className="bg-[#0A1628] p-4 rounded-xl border border-[#1E3A5F] text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedDemande.description}
                                    </div>
                                </div>

                                <div className="border-t border-[#1E3A5F] pt-6 mt-6">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Répondre au client</div>
                                    <textarea
                                        value={adminReply}
                                        onChange={(e) => setAdminReply(e.target.value)}
                                        placeholder="Optionnel : Tapez votre réponse au client ici. Elle sera envoyée par email lors du prochain changement de statut."
                                        className="w-full bg-[#0A1628] p-4 rounded-xl border border-[#1E3A5F] text-slate-300 text-sm leading-relaxed resize-none h-24 focus:outline-none focus:border-[#FF6B00]"
                                    />
                                    {adminReply.trim() !== "" && (
                                        <p className="text-xs text-[#FF6B00] mt-2">
                                            ⚠️ Cette réponse sera expédiée dès que vous modifierez le statut de la demande ci-dessus.
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
