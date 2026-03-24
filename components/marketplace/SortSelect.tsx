"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "recent";

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "recent") {
            params.delete("sort");
        } else {
            params.set("sort", e.target.value);
        }
        params.delete("page");
        const qs = params.toString();
        router.push(`/produits${qs ? `?${qs}` : ""}`);
    }

    return (
        <select
            value={currentSort}
            onChange={handleChange}
            className="rounded-md border border-movek-border bg-movek-card px-3 py-1.5 text-xs text-white"
        >
            <option value="recent">Plus récent</option>
            <option value="az">A → Z</option>
            <option value="famille">Par famille</option>
        </select>
    );
}
