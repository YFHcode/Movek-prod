"use client";

import React, { useState, useTransition } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { FolderTree, Plus, ChevronRight, Tags, Pencil, Trash2, X, Loader2 } from "lucide-react";
import {
    createFamily, updateFamily, deleteFamily,
    createSubcategory, updateSubcategory, deleteSubcategory
} from "@/app/actions/admin_catalog";

type Subcategory = {
    id: string;
    nom: string;
    slug: string;
};

type Family = {
    id: string;
    nom: string;
    slug: string;
    ordre: number;
    created_by_admin: boolean;
    product_subcategories: Subcategory[];
};

type ModalType = "createFamily" | "editFamily" | "createSub" | "editSub" | null;

export default function AdminFamiliesPage({ families }: { families: Family[] }) {
    const [expandedFamily, setExpandedFamily] = useState<string | null>(families[0]?.id || null);
    const [isPending, startTransition] = useTransition();

    // Modal state
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalInput, setModalInput] = useState("");
    const [modalError, setModalError] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    const openModal = (type: ModalType, defaultValue = "", id: string | null = null) => {
        setModalType(type);
        setModalInput(defaultValue);
        setModalError(null);
        setEditId(id);
    };

    const closeModal = () => {
        setModalType(null);
        setModalInput("");
        setModalError(null);
        setEditId(null);
    };

    const handleModalSubmit = () => {
        if (!modalInput.trim()) {
            setModalError("Le nom est requis.");
            return;
        }

        startTransition(async () => {
            let result;

            switch (modalType) {
                case "createFamily":
                    result = await createFamily(modalInput.trim());
                    break;
                case "editFamily":
                    if (editId) result = await updateFamily(editId, modalInput.trim());
                    break;
                case "createSub":
                    if (expandedFamily) result = await createSubcategory(expandedFamily, modalInput.trim());
                    break;
                case "editSub":
                    if (editId) result = await updateSubcategory(editId, modalInput.trim());
                    break;
            }

            if (result && !result.success && result.error) {
                setModalError(result.error);
            } else {
                closeModal();
            }
        });
    };

    const handleDeleteFamily = (familyId: string, familyName: string) => {
        if (!confirm(`Supprimer la famille "${familyName}" et toutes ses sous-catégories ?`)) return;

        startTransition(async () => {
            const result = await deleteFamily(familyId);
            if (!result.success && result.error) {
                alert(result.error);
            } else if (expandedFamily === familyId) {
                setExpandedFamily(null);
            }
        });
    };

    const handleDeleteSub = (subId: string, subName: string) => {
        if (!confirm(`Supprimer la sous-catégorie "${subName}" ?`)) return;

        startTransition(async () => {
            const result = await deleteSubcategory(subId);
            if (!result.success && result.error) {
                alert(result.error);
            }
        });
    };

    const getModalTitle = () => {
        switch (modalType) {
            case "createFamily": return "Nouvelle Famille";
            case "editFamily": return "Modifier la Famille";
            case "createSub": return "Nouvelle Sous-catégorie";
            case "editSub": return "Modifier la Sous-catégorie";
            default: return "";
        }
    };

    return (
        <>
            <AdminTopBar title="Familles & Catégories" adminName="Admin" />
            <div className="p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-60px)]">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-[#FF6B00]" />
                            Arborescence de l&apos;Industrie
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Gérez l&apos;organisation hiérarchique des produits sur la plateforme.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal("createFamily")}
                        disabled={isPending}
                        className="bg-[#FF6B00] hover:bg-[#E66000] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Famille
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Families List */}
                    <div className="md:col-span-1 bg-[#0F2040] rounded-xl border border-[#1E3A5F] overflow-hidden">
                        <div className="p-4 border-b border-[#1E3A5F] bg-[#0A1628]/50">
                            <h3 className="font-semibold text-white">Familles ({families.length})</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {families.map((family) => (
                                <div
                                    key={family.id}
                                    className={`group w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${expandedFamily === family.id
                                        ? "bg-white/10 text-white"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    onClick={() => setExpandedFamily(family.id)}
                                >
                                    <span className="font-medium truncate flex-1">{family.nom}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openModal("editFamily", family.nom, family.id); }}
                                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Modifier"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFamily(family.id, family.nom); }}
                                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedFamily === family.id ? "text-[#FF6B00]" : ""}`} />
                                    </div>
                                </div>
                            ))}
                            {families.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    Aucune famille créée.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subcategories View */}
                    <div className="md:col-span-2">
                        {expandedFamily ? (
                            <div className="bg-[#0F2040] rounded-xl border border-[#1E3A5F] overflow-hidden">
                                {families.filter(f => f.id === expandedFamily).map(family => (
                                    <div key={family.id}>
                                        <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{family.nom}</h3>
                                                <p className="text-sm text-slate-400 font-mono mt-1">/{family.slug}</p>
                                            </div>
                                            <button
                                                onClick={() => openModal("createSub")}
                                                disabled={isPending}
                                                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Sous-catégorie
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {family.product_subcategories.map(sub => (
                                                    <div key={sub.id} className="bg-[#0A1628] p-4 rounded-lg border border-[#1E3A5F] flex items-center gap-3 group hover:border-[#FF6B00]/50 transition-colors">
                                                        <Tags className="w-5 h-5 text-slate-500 group-hover:text-[#FF6B00] transition-colors shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-white">{sub.nom}</div>
                                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{sub.slug}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => openModal("editSub", sub.nom, sub.id)}
                                                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                                                                title="Modifier"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSub(sub.id, sub.nom)}
                                                                className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {family.product_subcategories.length === 0 && (
                                                    <div className="col-span-2 text-center py-8 text-slate-500">
                                                        Aucune sous-catégorie pour cette famille.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#0F2040] rounded-xl border border-[#1E3A5F] p-8 text-center h-full flex flex-col items-center justify-center text-slate-400">
                                <FolderTree className="w-12 h-12 mb-4 text-slate-500/50" />
                                <p>Sélectionnez une famille pour voir ses sous-catégories.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CRUD Modal */}
                {modalType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0F2040] border border-[#1E3A5F] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]/50">
                                <h3 className="text-lg font-bold text-white">{getModalTitle()}</h3>
                                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {modalError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {modalError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nom</label>
                                    <input
                                        type="text"
                                        value={modalInput}
                                        onChange={(e) => setModalInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleModalSubmit()}
                                        placeholder={modalType?.includes("Family") || modalType?.includes("createFamily") ? "Ex: Automatisme Industriel" : "Ex: Capteurs de pression"}
                                        autoFocus
                                        className="w-full bg-[#0A1628] px-4 py-3 rounded-xl border border-[#1E3A5F] text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleModalSubmit}
                                        disabled={isPending || !modalInput.trim()}
                                        className="flex-1 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl hover:bg-[#E66000] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> En cours...</>
                                        ) : (
                                            modalType?.includes("edit") || modalType?.includes("Edit") ? "Enregistrer" : "Créer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
