import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/marketplace/ProductCard";
import ProductFilters, {
    ActiveFilters,
} from "@/components/marketplace/ProductFilters";
import EmptyState from "@/components/marketplace/EmptyState";
import SortSelect from "@/components/marketplace/SortSelect";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Produits Industriels",
    description:
        "Parcourez notre catalogue de produits industriels : froid, électricité, électromécanique, énergie, manutention et plus encore.",
};

const PRODUCTS_PER_PAGE = 12;

interface ProduitsPageProps {
    searchParams: Promise<{
        search?: string;
        famille?: string;
        condition?: string;
        marque?: string;
        reference?: string;
        garantie?: string;
        page?: string;
        sort?: string;
    }>;
}

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    // Fetch families for sidebar filters
    const { data: families } = await supabase
        .from("product_families")
        .select("*, product_subcategories(*)")
        .order("ordre", { ascending: true });

    // Build product query using public_products view
    let query = supabase
        .from("public_products")
        .select("*, product_images(id, image_url, ordre)", { count: "exact" });

    // Apply filters
    if (params.search) {
        query = query.textSearch("search_vector", params.search, {
            type: "websearch",
            config: "french",
        });
    }

    if (params.famille) {
        const familleSlugs = params.famille.split(",");
        // Check if any are family slugs or subcategory slugs
        const familyIds: string[] = [];
        const subcategoryIds: string[] = [];

        for (const slug of familleSlugs) {
            const family = families?.find((f) => f.slug === slug);
            if (family) {
                familyIds.push(family.id);
            } else {
                // Check subcategories
                for (const f of families || []) {
                    const sub = f.product_subcategories?.find(
                        (s: { slug: string }) => s.slug === slug
                    );
                    if (sub) {
                        subcategoryIds.push(sub.id);
                        break;
                    }
                }
            }
        }

        if (familyIds.length > 0 && subcategoryIds.length > 0) {
            query = query.or(
                `family_id.in.(${familyIds.join(",")}),subcategory_id.in.(${subcategoryIds.join(",")})`
            );
        } else if (familyIds.length > 0) {
            query = query.in("family_id", familyIds);
        } else if (subcategoryIds.length > 0) {
            query = query.in("subcategory_id", subcategoryIds);
        }
    }

    if (params.condition) {
        const conditions = params.condition.split(",");
        query = query.in("etat", conditions);
    }

    if (params.marque) {
        query = query.ilike("marque", `%${params.marque}%`);
    }

    if (params.reference) {
        query = query.ilike("reference", `%${params.reference}%`);
    }

    if (params.garantie === "true") {
        query = query.eq("garantie", true);
    }

    // Sorting
    switch (params.sort) {
        case "az":
            query = query.order("article", { ascending: true });
            break;
        case "famille":
            query = query.order("family_id", { ascending: true });
            break;
        default:
            query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const page = parseInt(params.page || "1", 10);
    const from = (page - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data: products, count } = await query;

    const totalProducts = count || 0;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Mobile filter button */}
            <div className="mb-4 lg:hidden">
                <Suspense>
                    <ProductFilters families={families || []} isMobile />
                </Suspense>
            </div>

            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <Suspense>
                    <ProductFilters families={families || []} />
                </Suspense>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Top bar */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-movek-text-secondary">
                            <span className="font-bold text-white">{totalProducts}</span>{" "}
                            produit{totalProducts !== 1 ? "s" : ""} trouvé
                            {totalProducts !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-movek-text-secondary">Trier par:</span>
                            <Suspense>
                                <SortSelect />
                            </Suspense>
                        </div>
                    </div>

                    {/* Active filters */}
                    <div className="mb-4">
                        <Suspense>
                            <ActiveFilters />
                        </Suspense>
                    </div>

                    {/* Product Grid */}
                    {products && products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalProducts={totalProducts}
                                    productsPerPage={PRODUCTS_PER_PAGE}
                                    searchParams={params}
                                />
                            )}
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </div>
    );
}



function Pagination({
    currentPage,
    totalPages,
    totalProducts,
    productsPerPage,
    searchParams,
}: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
    searchParams: Record<string, string | undefined>;
}) {
    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && key !== "page") params.set(key, value);
        });
        if (page > 1) params.set("page", page.toString());
        const qs = params.toString();
        return `/produits${qs ? `?${qs}` : ""}`;
    };

    const from = (currentPage - 1) * productsPerPage + 1;
    const to = Math.min(currentPage * productsPerPage, totalProducts);

    // Generate page numbers to show
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-xs text-movek-text-secondary">
                Affichage {from}-{to} sur {totalProducts} produits
            </p>
            <div className="flex items-center gap-1">
                {currentPage > 1 && (
                    <a
                        href={buildPageUrl(currentPage - 1)}
                        className="rounded-md border border-movek-border px-3 py-1.5 text-xs text-movek-text-secondary hover:border-movek-orange hover:text-white"
                    >
                        Précédent
                    </a>
                )}
                {pages.map((p) => (
                    <a
                        key={p}
                        href={buildPageUrl(p)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ${p === currentPage
                            ? "bg-movek-orange text-white"
                            : "border border-movek-border text-movek-text-secondary hover:border-movek-orange hover:text-white"
                            }`}
                    >
                        {p}
                    </a>
                ))}
                {currentPage < totalPages && (
                    <a
                        href={buildPageUrl(currentPage + 1)}
                        className="rounded-md border border-movek-border px-3 py-1.5 text-xs text-movek-text-secondary hover:border-movek-orange hover:text-white"
                    >
                        Suivant
                    </a>
                )}
            </div>
        </div>
    );
}
