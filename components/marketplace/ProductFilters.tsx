"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronRight,
    X,
} from "lucide-react";
import type { ProductFamilyWithSubcategories, ProductCondition } from "@/lib/types";

interface ProductFiltersProps {
    families: ProductFamilyWithSubcategories[];
    isMobile?: boolean;
}

const conditions: { value: ProductCondition; label: string }[] = [
    { value: "neuf", label: "Neuf" },
    { value: "neuf-ancien", label: "Neuf-Ancien" },
    { value: "reconditionne", label: "Reconditionné" },
    { value: "utilise", label: "Utilisé" },
];

function FilterContent({
    families,
    onApply,
}: {
    families: ProductFamilyWithSubcategories[];
    onApply?: () => void;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read current filters from URL
    const currentSearch = searchParams.get("search") || "";
    const currentFamille = searchParams.get("famille") || "";
    const currentConditions = searchParams.get("condition")?.split(",").filter(Boolean) || [];
    const currentMarque = searchParams.get("marque") || "";
    const currentReference = searchParams.get("reference") || "";
    const currentGarantie = searchParams.get("garantie") === "true";

    // Local state for inputs
    const [search, setSearch] = useState(currentSearch);
    const [selectedFamilles, setSelectedFamilles] = useState<string[]>(
        currentFamille ? currentFamille.split(",") : []
    );
    const [selectedConditions, setSelectedConditions] = useState<string[]>(currentConditions);
    const [marque, setMarque] = useState(currentMarque);
    const [reference, setReference] = useState(currentReference);
    const [garantie, setGarantie] = useState(currentGarantie);
    const [expandedFamilies, setExpandedFamilies] = useState<string[]>([]);

    const toggleFamily = (slug: string) => {
        setSelectedFamilles((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
        );
    };

    const toggleCondition = (val: string) => {
        setSelectedConditions((prev) =>
            prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
        );
    };

    const toggleExpanded = (familyId: string) => {
        setExpandedFamilies((prev) =>
            prev.includes(familyId)
                ? prev.filter((id) => id !== familyId)
                : [...prev, familyId]
        );
    };

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (selectedFamilles.length) params.set("famille", selectedFamilles.join(","));
        if (selectedConditions.length) params.set("condition", selectedConditions.join(","));
        if (marque) params.set("marque", marque);
        if (reference) params.set("reference", reference);
        if (garantie) params.set("garantie", "true");

        const queryString = params.toString();
        router.push(`/produits${queryString ? `?${queryString}` : ""}`);
        onApply?.();
    }, [search, selectedFamilles, selectedConditions, marque, reference, garantie, router, onApply]);

    const resetFilters = () => {
        setSearch("");
        setSelectedFamilles([]);
        setSelectedConditions([]);
        setMarque("");
        setReference("");
        setGarantie(false);
        router.push("/produits");
        onApply?.();
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <Label className="mb-2 text-xs font-semibold uppercase text-movek-text-secondary">
                    Recherche
                </Label>
                <div className="flex gap-1">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Mot-clé..."
                        className="border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    />
                </div>
            </div>

            {/* Families */}
            <div>
                <Label className="mb-2 text-xs font-semibold uppercase text-movek-text-secondary">
                    Familles de Produits
                </Label>
                <div className="space-y-1">
                    {families.map((family) => (
                        <div key={family.id}>
                            <button
                                type="button"
                                onClick={() => toggleExpanded(family.id)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${selectedFamilles.includes(family.slug)
                                        ? "bg-movek-orange/10 text-movek-orange"
                                        : "text-movek-text-secondary hover:bg-movek-navy hover:text-white"
                                    }`}
                            >
                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedFamilles.includes(family.slug)}
                                        onChange={() => toggleFamily(family.slug)}
                                        className="accent-movek-orange"
                                    />
                                    <span className="text-xs">{family.nom}</span>
                                </label>
                                {family.product_subcategories?.length > 0 && (
                                    expandedFamilies.includes(family.id) ? (
                                        <ChevronDown className="h-3 w-3 shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3 shrink-0" />
                                    )
                                )}
                            </button>
                            {expandedFamilies.includes(family.id) &&
                                family.product_subcategories?.map((sub) => (
                                    <div key={sub.id} className="pl-8 py-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-movek-text-secondary hover:text-white">
                                            <input
                                                type="checkbox"
                                                checked={selectedFamilles.includes(sub.slug)}
                                                onChange={() => toggleFamily(sub.slug)}
                                                className="accent-movek-orange"
                                            />
                                            {sub.nom}
                                        </label>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Condition */}
            <div>
                <Label className="mb-2 text-xs font-semibold uppercase text-movek-text-secondary">
                    Condition
                </Label>
                <div className="space-y-2">
                    {conditions.map((c) => (
                        <label
                            key={c.value}
                            className="flex items-center gap-2 cursor-pointer text-sm text-movek-text-secondary hover:text-white"
                        >
                            <input
                                type="checkbox"
                                checked={selectedConditions.includes(c.value)}
                                onChange={() => toggleCondition(c.value)}
                                className="accent-movek-orange"
                            />
                            {c.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Marque */}
            <div>
                <Label className="mb-2 text-xs font-semibold uppercase text-movek-text-secondary">
                    Marque
                </Label>
                <Input
                    value={marque}
                    onChange={(e) => setMarque(e.target.value)}
                    placeholder="Ex: Siemens, Bosch..."
                    className="border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
            </div>

            {/* Reference */}
            <div>
                <Label className="mb-2 text-xs font-semibold uppercase text-movek-text-secondary">
                    Référence
                </Label>
                <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: REF-123..."
                    className="border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
            </div>

            {/* Garantie */}
            <div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        className={`relative h-6 w-11 rounded-full transition-colors ${garantie ? "bg-movek-orange" : "bg-movek-border"
                            }`}
                        onClick={() => setGarantie(!garantie)}
                    >
                        <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${garantie ? "translate-x-5" : "translate-x-0.5"
                                }`}
                        />
                    </div>
                    <span className="text-sm text-movek-text-secondary">
                        Avec garantie uniquement
                    </span>
                </label>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
                <Button
                    onClick={applyFilters}
                    className="w-full rounded-full bg-movek-orange font-semibold text-white hover:brightness-110 transition-all"
                >
                    <Search className="mr-2 h-4 w-4" />
                    APPLIQUER
                </Button>
                <button
                    onClick={resetFilters}
                    className="w-full text-center text-sm text-movek-text-secondary hover:text-white transition-colors"
                >
                    Réinitialiser les filtres
                </button>
            </div>
        </div>
    );
}

export default function ProductFilters({ families, isMobile }: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button className="rounded-full bg-movek-orange font-semibold text-white hover:brightness-110 lg:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filtres
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="w-80 overflow-y-auto border-movek-border bg-movek-card"
                >
                    <SheetTitle className="text-white">Filtres</SheetTitle>
                    <div className="mt-6">
                        <FilterContent
                            families={families}
                            onApply={() => setIsOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className="sticky top-20 hidden h-fit w-72 shrink-0 overflow-y-auto rounded-xl border border-movek-border bg-movek-card p-5 lg:block">
            <h3 className="mb-4 text-sm font-bold text-white">Filtres</h3>
            <FilterContent families={families} />
        </aside>
    );
}

// Active filter pills component
export function ActiveFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const filters: { key: string; value: string; label: string }[] = [];

    const search = searchParams.get("search");
    if (search) filters.push({ key: "search", value: search, label: `Recherche: ${search}` });

    const famille = searchParams.get("famille");
    if (famille)
        famille.split(",").forEach((f) =>
            filters.push({ key: "famille", value: f, label: `Famille: ${f}` })
        );

    const condition = searchParams.get("condition");
    if (condition)
        condition.split(",").forEach((c) =>
            filters.push({ key: "condition", value: c, label: `Condition: ${c}` })
        );

    const marque = searchParams.get("marque");
    if (marque) filters.push({ key: "marque", value: marque, label: `Marque: ${marque}` });

    const reference = searchParams.get("reference");
    if (reference) filters.push({ key: "reference", value: reference, label: `Réf: ${reference}` });

    const garantie = searchParams.get("garantie");
    if (garantie === "true") filters.push({ key: "garantie", value: "true", label: "Avec garantie" });

    if (filters.length === 0) return null;

    const removeFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = params.get(key);
        if (current?.includes(",")) {
            const updated = current.split(",").filter((v) => v !== value).join(",");
            if (updated) params.set(key, updated);
            else params.delete(key);
        } else {
            params.delete(key);
        }
        params.delete("page"); // Reset pagination on filter change
        const qs = params.toString();
        router.push(`/produits${qs ? `?${qs}` : ""}`);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((f, i) => (
                <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-movek-orange/20 px-3 py-1 text-xs font-medium text-movek-orange"
                >
                    {f.label}
                    <button
                        onClick={() => removeFilter(f.key, f.value)}
                        className="ml-1 hover:text-white"
                        aria-label={`Retirer filtre ${f.label}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}
