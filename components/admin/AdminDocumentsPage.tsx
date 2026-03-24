"use client";

import React, { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { uploadTechnicalDocument, deleteTechnicalDocument } from "@/app/actions/admin_documents";
import { downloadCSV } from "@/lib/utils-csv";
import { FileText, Plus, X, Trash2, Download, AlertCircle, Loader2 } from "lucide-react";

type DocumentRow = {
    id: string;
    file_name: string;
    file_url: string;
    reference: string | null;
    marque: string | null;
    produit: string | null;
    created_at: string;
};

// Form submit button with loading state
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FF6B00] hover:bg-[#e66000] text-white font-semibold rounded-xl transition-all disabled:opacity-70"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                </>
            ) : (
                "Sauvegarder le document"
            )}
        </button>
    );
}

export default function AdminDocumentsPage({ initialDocuments }: { initialDocuments: DocumentRow[] }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Setup form action state
    const [state, formAction] = useFormState(uploadTechnicalDocument, {
        success: false,
        error: null,
    });

    // Close modal on success
    React.useEffect(() => {
        if (state.success) {
            setIsUploadModalOpen(false);
        }
    }, [state.success]);

    const handleDelete = (id: string, fileUrl: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.")) {
            startTransition(async () => {
                const res = await deleteTechnicalDocument(id, fileUrl);
                if (!res.success && res.error) {
                    alert(res.error);
                }
            });
        }
    };

    const handleExport = () => {
        const exportData = initialDocuments.map(d => ({
            "ID": d.id,
            "Date d'ajout": format(new Date(d.created_at), "dd/MM/yyyy HH:mm"),
            "Nom Fichier": d.file_name,
            "Marque": d.marque || "",
            "Produit": d.produit || "",
            "Référence": d.reference || "",
            "Lien": d.file_url
        }));
        downloadCSV(exportData, "documents_techniques_movek");
    };

    const columns: ColumnDef<DocumentRow>[] = [
        {
            accessorKey: "created_at",
            header: "Date d'ajout",
            cell: ({ row }) => <span className="text-slate-300 whitespace-nowrap text-sm">{format(new Date(row.original.created_at), "dd MMM yyyy", { locale: fr })}</span>
        },
        {
            accessorKey: "file_name",
            header: "Nom du document",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-white max-w-[200px] truncate" title={row.original.file_name}>
                            {row.original.file_name}
                        </div>
                        <a href={row.original.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#FF6B00] hover:underline flex items-center gap-1 mt-0.5">
                            <Download className="w-3 h-3" /> Télécharger
                        </a>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "marque",
            header: "Marque",
            cell: ({ row }) => <span className="text-slate-300 text-sm">{row.original.marque || "-"}</span>
        },
        {
            accessorKey: "produit",
            header: "Produit",
            cell: ({ row }) => <span className="text-slate-300 text-sm">{row.original.produit || "-"}</span>
        },
        {
            accessorKey: "reference",
            header: "Référence",
            cell: ({ row }) => <span className="text-slate-300 text-sm font-mono">{row.original.reference || "-"}</span>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleDelete(row.original.id, row.original.file_url)}
                        disabled={isPending}
                        className="flex items-center justify-center w-8 h-8 rounded transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50"
                        title="Supprimer le document"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <AdminTopBar title="Documents Techniques" adminName="Admin" />
            <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-60px)] relative">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Bibliothèque de Documents</h2>
                        <p className="text-slate-400 text-sm">Gérez les fiches techniques et catalogues téléchargeables.</p>
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg font-medium hover:bg-[#e66000] transition-colors shadow-lg shadow-[#FF6B00]/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau Document
                    </button>
                </div>

                {/* Data Table */}
                <AdminDataTable
                    columns={columns}
                    data={initialDocuments}
                    searchKey="file_name"
                    searchPlaceholder="Rechercher par nom de fichier..."
                    onExport={handleExport}
                />

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0F2040] border border-[#1E3A5F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]/50">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#FF6B00]" />
                                    Ajouter un Document
                                </h3>
                                <button
                                    onClick={() => { setIsUploadModalOpen(false); state.error = null; }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form action={formAction} className="p-6 space-y-5">
                                {state.error && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>{state.error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Fichier PDF <span className="text-red-400">*</span></label>
                                    <input
                                        type="file"
                                        name="file"
                                        accept=".pdf"
                                        required
                                        className="w-full bg-[#0A1628] rounded-xl border border-[#1E3A5F] text-slate-300 text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A5F] file:text-white hover:file:bg-[#2A4A7F] transition-all"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Taille maximale : 10 Mo. Format : .pdf uniquement.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Marque</label>
                                        <input
                                            type="text"
                                            name="marque"
                                            placeholder="Ex: Siemens"
                                            className="w-full bg-[#0A1628] px-4 py-3 rounded-xl border border-[#1E3A5F] text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Série / Produit</label>
                                        <input
                                            type="text"
                                            name="produit"
                                            placeholder="Ex: S7-1200"
                                            className="w-full bg-[#0A1628] px-4 py-3 rounded-xl border border-[#1E3A5F] text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Référence catalogue</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        placeholder="Optionnel"
                                        className="w-full bg-[#0A1628] px-4 py-3 rounded-xl border border-[#1E3A5F] text-white focus:outline-none focus:border-[#FF6B00] transition-colors font-mono"
                                    />
                                </div>

                                <div className="pt-4 border-t border-[#1E3A5F]">
                                    <SubmitButton />
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
