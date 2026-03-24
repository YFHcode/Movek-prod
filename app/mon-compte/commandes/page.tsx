import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Package, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import type { OrderStatus } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes Commandes",
};

export default async function OrdersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user!.id)
        .single();

    const { data: orders } = await supabase
        .from("orders")
        .select(
            "id, reference, status, total_ttc, notes, created_at, updated_at, order_items(id, quantity, unit_price, product_id, public_products(article, designation, marque, reference))"
        )
        .eq("client_id", client!.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Mes Commandes</h1>
                <p className="text-sm text-movek-text-secondary">
                    Suivez l&apos;état de vos commandes ETREND
                </p>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-3 rounded-lg border border-movek-border bg-movek-card p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <p className="text-sm text-movek-text-secondary">
                    Les commandes sont gérées exclusivement par ETREND. Pour toute
                    question, contactez{" "}
                    <a
                        href="mailto:contact@etrend-maroc.com"
                        className="text-movek-orange hover:underline"
                    >
                        contact@etrend-maroc.com
                    </a>
                </p>
            </div>

            {orders && orders.length > 0 ? (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-hidden rounded-xl border border-movek-border lg:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-movek-border bg-movek-card">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-movek-text-secondary">
                                        Réf.
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-movek-text-secondary">
                                        Produit(s)
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-movek-text-secondary">
                                        Statut
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-movek-text-secondary">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const items = (order.order_items || []) as any[];
                                    return (
                                        <tr
                                            key={order.id}
                                            className="border-b border-movek-border bg-movek-navy last:border-0"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-white">
                                                {order.reference}
                                            </td>
                                            <td className="px-5 py-4">
                                                {items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {items.slice(0, 2).map((item) => (
                                                            <p key={item.id} className="text-xs text-movek-text-secondary">
                                                                {item.public_products?.article || "Produit"} ×{item.quantity}
                                                            </p>
                                                        ))}
                                                        {items.length > 2 && (
                                                            <p className="text-xs text-movek-text-secondary">
                                                                +{items.length - 2} autre(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-movek-text-secondary">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={order.status as OrderStatus} />
                                            </td>
                                            <td className="px-5 py-4 text-xs text-movek-text-secondary">
                                                {new Date(order.created_at).toLocaleDateString("fr-FR")}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {orders.map((order) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const items = (order.order_items || []) as any[];
                            return (
                                <div
                                    key={order.id}
                                    className="rounded-xl border border-movek-border bg-movek-card p-4"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-white">
                                            {order.reference}
                                        </span>
                                        <StatusBadge status={order.status as OrderStatus} />
                                    </div>
                                    {items.slice(0, 2).map((item) => (
                                        <p key={item.id} className="text-xs text-movek-text-secondary">
                                            {item.public_products?.article || "Produit"} ×{item.quantity}
                                        </p>
                                    ))}
                                    <p className="mt-2 text-xs text-movek-text-secondary">
                                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                                    </p>
                                    {order.notes && (
                                        <p className="mt-2 text-xs italic text-movek-text-secondary">
                                            Note: {order.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-movek-border bg-movek-card py-16 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-movek-navy">
                        <Package className="h-10 w-10 text-movek-text-secondary" />
                    </div>
                    <h2 className="mb-2 text-lg font-bold text-white">
                        Aucune commande pour le moment
                    </h2>
                    <p className="mb-6 text-sm text-movek-text-secondary">
                        Vos commandes apparaîtront ici après confirmation par ETREND.
                    </p>
                    <Link href="/produits">
                        <Button className="rounded-full bg-movek-orange px-6 font-semibold text-white hover:brightness-110">
                            Explorer le catalogue
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
