"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Tag, Hash } from "lucide-react";

type SearchMode = "keyword" | "marque" | "reference";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [mode, setMode] = useState<SearchMode>("keyword");
    const router = useRouter();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        const paramKey =
            mode === "keyword" ? "search" : mode === "marque" ? "marque" : "reference";
        router.push(`/produits?${paramKey}=${encodeURIComponent(query.trim())}`);
    }

    const modes: { key: SearchMode; label: string; icon: React.ReactNode }[] = [
        { key: "keyword", label: "MOT-CLÉ", icon: <Search className="h-3.5 w-3.5" /> },
        { key: "marque", label: "MARQUE", icon: <Tag className="h-3.5 w-3.5" /> },
        { key: "reference", label: "RÉFÉRENCE", icon: <Hash className="h-3.5 w-3.5" /> },
    ];

    return (
        <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-0">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                        mode === "keyword"
                            ? "Rechercher par mot-clé (ex: Moteur, Compresseur...)"
                            : mode === "marque"
                                ? "Rechercher par marque (ex: Bosch, Siemens...)"
                                : "Rechercher par référence (ex: 452-A, REF-123...)"
                    }
                    className="h-12 flex-1 rounded-l-full rounded-r-none border-movek-border bg-white/95 px-6 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-movek-orange"
                />
                <Button
                    type="submit"
                    className="h-12 rounded-l-none rounded-r-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110 transition-all"
                >
                    <Search className="mr-2 h-4 w-4" />
                    RECHERCHER
                </Button>
            </form>

            {/* Search mode tabs */}
            <div className="mt-3 flex items-center justify-center gap-2">
                {modes.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setMode(key)}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${mode === key
                                ? "bg-movek-orange text-white"
                                : "bg-movek-card text-movek-text-secondary hover:text-white border border-movek-border"
                            }`}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
