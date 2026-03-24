import React from "react";
import AdminOrdersPage from "@/components/admin/AdminOrdersPage";
import { getAdminOrders } from "@/app/actions/admin_commercial";

export default async function Page() {
    const orders = await getAdminOrders();

    return <AdminOrdersPage orders={orders} />;
}
