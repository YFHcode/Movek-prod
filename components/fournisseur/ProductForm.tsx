"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, UploadCloud, X, AlertTriangle, FileText,
    Trash2
} from "lucide-react";
import { addProduct, updateProduct } from "@/app/actions/products";

// ─── Types ─────────────────────────────────────────────────────────────
export type Category = { id: string; nom: string; ordre?: number; has_brands?: boolean };

export type ProductImageData = {
    id: string;
    url: string;
    ordre: number;
};

export type TechnicalSheetData = {
    id: string;
    file_url: string;
    file_name: string;
};

export type InitialProductData = {
    id: string;
    article: string;
    designation: string;
    marque?: string | null;
    reference?: string | null;
    origine?: string | null;
    quantite?: number | null;
    unite: string;
    lieu_expedition: string;
    garantie: boolean;
    garantie_mois?: number | null;
    etat: string;
    prix?: number | null;
    devise: string;
    family_id: string;
    subcategory_id: string;
    images?: ProductImageData[];
    technical_sheet?: TechnicalSheetData | null;
};

interface ProductFormProps {
    families: Category[];
    subcategories: Category[];
    isEditMode?: boolean;
    initialData?: InitialProductData;
}

// ─── Helper Components ──────────────────────────────────────────────────
function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-movek-orange py-6 text-lg font-bold text-white hover:brightness-110 transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enregistrement...
                </>
            ) : isEdit ? (
                "METTRE À JOUR LE PRODUIT"
            ) : (
                "PUBLIER LE PRODUIT"
            )}
        </Button>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function ProductForm({ families, subcategories, isEditMode = false, initialData }: ProductFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    // Form Server Action
    const actionToUse = isEditMode ? updateProduct : addProduct;
    const [state, formAction] = useFormState(actionToUse, { success: false, error: null });

    // Local State
    const [garantie, setGarantie] = useState(initialData?.garantie || false);

    // Images State
    const [keptImages, setKeptImages] = useState<ProductImageData[]>(
        initialData?.images?.sort((a, b) => a.ordre - b.ordre) || []
    );
    const [deletedImages, setDeletedImages] = useState<ProductImageData[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    // PDF State
    const [keptPdf, setKeptPdf] = useState<TechnicalSheetData | null>(initialData?.technical_sheet || null);
    const [newPdf, setNewPdf] = useState<File | null>(null);

    // Subcategories filtering
    const [selectedFamilyId, setSelectedFamilyId] = useState(initialData?.family_id || "");
    const filteredSubcategories = subcategories.filter(s => (s as Category & { family_id?: string }).family_id === selectedFamilyId || true); // Adjust if subcat has family_id

    useEffect(() => {
        if (state.success) {
            router.push("/espace-fournisseur/produits");
        }
    }, [state.success, router]);

    // ─── Image Handlers ──────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...filesArray]);
        }
    };

    const removeNewImage = (indexToRemove: number) => {
        setNewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const removeKeptImage = (img: ProductImageData) => {
        setKeptImages(prev => prev.filter(i => i.id !== img.id));
        setDeletedImages(prev => [...prev, img]);
    };

    // Very simple up/down reordering for MVP
    const moveKeptImgUp = (index: number) => {
        if (index === 0) return;
        const copy = [...keptImages];
        const temp = copy[index - 1];
        copy[index - 1] = copy[index];
        copy[index] = temp;
        // Re-assign ordre
        const reordered = copy.map((img, i) => ({ ...img, ordre: i + 1 }));
        setKeptImages(reordered);
    };

    const moveKeptImgDown = (index: number) => {
        if (index === keptImages.length - 1) return;
        const copy = [...keptImages];
        const temp = copy[index + 1];
        copy[index + 1] = copy[index];
        copy[index] = temp;
        // Re-assign ordre
        const reordered = copy.map((img, i) => ({ ...img, ordre: i + 1 }));
        setKeptImages(reordered);
    };

    // ─── PDF Handlers ────────────────────────────────────────────────────
    const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewPdf(e.target.files[0]);
            setKeptPdf(null); // Overwriting old pdf
        }
    };

    const removeNewPdf = () => {
        setNewPdf(null);
        if (pdfInputRef.current) pdfInputRef.current.value = "";
    };

    const removeKeptPdf = () => {
        setKeptPdf(null);
    };

    return (
        <form ref={formRef} action={formAction} className="space-y-8 pb-12">
            {isEditMode && initialData && <input type="hidden" name="productId" value={initialData.id} />}

            {/* Kept & Deleted Images Payloads */}
            <input type="hidden" name="keptImages" value={JSON.stringify(keptImages)} />
            <input type="hidden" name="deletedImages" value={JSON.stringify(deletedImages)} />

            {/* Global Error Banner */}
            {state.error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                        <p className="text-sm font-medium text-red-400">{state.error}</p>
                    </div>
                </div>
            )}

            {/* Re-approval Warning */}
            {isEditMode && (
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                        <div>
                            <p className="text-sm font-bold text-orange-400">Attention</p>
                            <p className="mt-1 text-xs text-movek-text-secondary">
                                Toute modification de ce produit le retirera temporairement du marketplace
                                jusqu&apos;à ce que l&apos;équipe ETREND valide les nouvelles informations.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 1: Informations Principales */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h2 className="mb-6 text-lg font-bold text-white">1. Informations Principales</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Titre de l&apos;article *</Label>
                        <Input name="article" required defaultValue={initialData?.article}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500"
                            placeholder="Ex: Moteur électrique 220V" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Famille *</Label>
                        <select name="family_id" required value={selectedFamilyId} onChange={(e) => setSelectedFamilyId(e.target.value)}
                            className="w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-movek-orange">
                            <option value="">Sélectionner une famille</option>
                            {families.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Sous-catégorie *</Label>
                        <select name="subcategory_id" required defaultValue={initialData?.subcategory_id || ""}
                            className="w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-movek-orange">
                            <option value="">Sélectionner une sous-catégorie</option>
                            {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-movek-text-secondary">Description détaillée *</Label>
                        <Textarea name="designation" required defaultValue={initialData?.designation} rows={4}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500"
                            placeholder="Décrivez précisément les caractéristiques de ce produit..." />
                    </div>
                </div>
            </div>

            {/* Section 2: Spécifications */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h2 className="mb-6 text-lg font-bold text-white">2. Spécifications & Origine</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Marque</Label>
                        <Input name="marque" defaultValue={initialData?.marque || ""}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500" placeholder="Ex: Siemens" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Référence fabricant</Label>
                        <Input name="reference" defaultValue={initialData?.reference || ""}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500" placeholder="Ex: S7-1200" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Pays d&apos;origine</Label>
                        <Input name="origine" defaultValue={initialData?.origine || ""}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500" placeholder="Ex: Allemagne" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">État du produit *</Label>
                        <select name="etat" required defaultValue={initialData?.etat || "neuf"}
                            className="w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-movek-orange">
                            <option value="neuf">Neuf</option>
                            <option value="neuf-ancien">Neuf (ancien stock)</option>
                            <option value="utilise">Utilisé / Occasion</option>
                            <option value="reconditionne">Reconditionné</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 3: Commercial & Logistique */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h2 className="mb-6 text-lg font-bold text-white">3. Commercial & Logistique</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Quantité disponible *</Label>
                        <Input name="quantite" type="number" min="0" required defaultValue={initialData?.quantite ?? ""}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500" placeholder="Ex: 50" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Unité *</Label>
                        <select name="unite" required defaultValue={initialData?.unite || "Pièce"}
                            className="w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-movek-orange">
                            <option value="Pièce">Pièce</option>
                            <option value="Lot">Lot</option>
                            <option value="Kg">Kg</option>
                            <option value="Mètre">Mètre</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Prix Unitaire (HT) - Optionnel</Label>
                        <div className="flex gap-2">
                            <Input name="prix" type="number" step="0.01" min="0" defaultValue={initialData?.prix ?? ""}
                                className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500" placeholder="0.00" />
                            <select name="devise" defaultValue={initialData?.devise || "MAD"}
                                className="rounded-md border border-movek-border bg-movek-navy px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-movek-orange">
                                <option value="MAD">MAD</option>
                                <option value="EUR">€</option>
                                <option value="USD">$</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label className="text-movek-text-secondary">Lieu d&apos;expédition (Ville) *</Label>
                        <Input name="lieu_expedition" required defaultValue={initialData?.lieu_expedition || ""}
                            className="bg-movek-navy border-movek-border text-white placeholder:text-gray-500 max-w-sm" placeholder="Ex: Casablanca" />
                    </div>

                    {/* Garantie */}
                    <div className="space-y-4 md:col-span-3 rounded-lg border border-movek-border p-4 bg-movek-navy/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-white text-base">Garantie incluse</Label>
                                <p className="text-xs text-movek-text-secondary">Ce produit bénéficie-t-il d&apos;une garantie vendeur ?</p>
                            </div>
                            <input type="checkbox" checked={garantie} onChange={(e) => setGarantie(e.target.checked)} name="garantie" value="true" className="h-5 w-5 accent-movek-orange" />
                        </div>
                        {garantie && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-movek-text-secondary">Durée de garantie (Mois)</Label>
                                <Input name="garantie_mois" type="number" min="1" required={garantie} defaultValue={initialData?.garantie_mois ?? ""}
                                    className="mt-1 bg-movek-navy border-movek-border text-white max-w-[200px]" placeholder="Ex: 12" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 4: Médias & Fiche Technique */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h2 className="mb-6 text-lg font-bold text-white">4. Photos & Fiche Technique</h2>

                {/* Images */}
                <div className="mb-8">
                    <Label className="mb-2 block text-movek-text-secondary">Photos du produit (Format carré recommandé)</Label>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {/* Render Kept Images */}
                        {keptImages.map((img, idx) => (
                            <div key={img.id} className="group relative aspect-square rounded-lg border border-movek-border bg-movek-navy overflow-hidden">
                                <Image src={img.url} alt={`Image ${idx}`} fill className="object-cover" />
                                <div className="absolute inset-x-0 top-0 flex justify-between p-1 bg-gradient-to-b from-black/60 to-transparent">
                                    <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">#{idx + 1} (En ligne)</span>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => moveKeptImgUp(idx)} disabled={idx === 0}
                                            className="p-1.5 bg-white/20 rounded hover:bg-white/40 disabled:opacity-30">
                                            <span className="text-white text-xs">&larr;</span>
                                        </button>
                                        <button type="button" onClick={() => moveKeptImgDown(idx)} disabled={idx === keptImages.length - 1}
                                            className="p-1.5 bg-white/20 rounded hover:bg-white/40 disabled:opacity-30">
                                            <span className="text-white text-xs">&rarr;</span>
                                        </button>
                                    </div>
                                    <button type="button" onClick={() => removeKeptImage(img)}
                                        className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Render New Images */}
                        {newImages.map((file, idx) => {
                            const url = URL.createObjectURL(file);
                            const orderIndex = keptImages.length + idx + 1;
                            return (
                                <div key={`new-${idx}`} className="group relative aspect-square rounded-lg border-2 border-dashed border-movek-orange bg-movek-orange/5 overflow-hidden">
                                    <Image src={url} alt={`New upload ${idx}`} fill className="object-cover" />
                                    <input type="hidden" name={`newImagesOrder_${idx}`} value={orderIndex} />
                                    <div className="absolute inset-x-0 top-0 flex justify-between p-1 bg-gradient-to-b from-black/60 to-transparent">
                                        <span className="text-[10px] font-bold text-movek-orange bg-black/50 px-1.5 py-0.5 rounded">Nouveau #{orderIndex}</span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => removeNewImage(idx)}
                                            className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 text-white shadow-lg">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Upload Button */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-movek-border bg-movek-navy/50 flex flex-col items-center justify-center cursor-pointer hover:border-movek-orange hover:bg-movek-orange/5 transition-colors"
                        >
                            <UploadCloud className="h-6 w-6 text-movek-text-secondary mb-2" />
                            <span className="text-xs font-medium text-movek-text-secondary text-center px-2">Ajouter des photos</span>
                            <input
                                type="file"
                                name="newImages"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageSelect}
                            />
                        </div>
                    </div>
                    {keptImages.length === 0 && newImages.length === 0 && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Au moins une photo est recommandée.</p>
                    )}
                </div>

                {/* Technical Sheet PDF */}
                <div>
                    <Label className="mb-2 block text-movek-text-secondary">Fiche Technique (PDF uniquement)</Label>

                    {keptPdf && !newPdf && (
                        <div className="flex items-center justify-between rounded-lg border border-movek-border bg-movek-navy p-3 max-w-md">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="rounded bg-blue-500/20 p-2">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="truncate">
                                    <p className="truncate text-sm font-medium text-white">{keptPdf.file_name}</p>
                                    <p className="text-xs text-movek-text-secondary">Document actuel (En ligne)</p>
                                </div>
                            </div>
                            <button type="button" onClick={removeKeptPdf} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {newPdf && (
                        <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-3 max-w-md mt-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="rounded bg-green-500/20 p-2">
                                    <FileText className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="truncate">
                                    <p className="truncate text-sm font-medium text-green-400">{newPdf.name}</p>
                                    <p className="text-xs text-green-500/70">Nouveau document (à uploader)</p>
                                </div>
                            </div>
                            <button type="button" onClick={removeNewPdf} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {!keptPdf && !newPdf && (
                        <div
                            onClick={() => pdfInputRef.current?.click()}
                            className="flex max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-movek-border bg-movek-navy/50 p-6 transition-colors hover:border-movek-orange hover:bg-movek-orange/5"
                        >
                            <UploadCloud className="mb-2 h-6 w-6 text-movek-text-secondary" />
                            <p className="text-sm font-medium text-white">Importer un PDF technique</p>
                            <p className="text-xs text-movek-text-secondary">Max 10 MB</p>
                        </div>
                    )}

                    <input
                        type="file"
                        name="newPdf"
                        ref={pdfInputRef}
                        className="hidden"
                        accept="application/pdf"
                        onChange={handlePdfSelect}
                    />
                </div>
            </div>

            <SubmitButton isEdit={isEditMode} />
        </form>
    );
}
