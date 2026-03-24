import React from "react";
import AdminProductsPage from "@/components/admin/AdminProductsPage";
import { getAdminProducts } from "@/app/actions/admin_catalog";

export default async function Page() {
    const products = await getAdminProducts();

    return <AdminProductsPage products={products} />;
}
