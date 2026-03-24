import React from "react";
import AdminClientsPage from "@/components/admin/AdminClientsPage";
import { getAdminClients } from "@/app/actions/admin_users";

export default async function Page() {
    const clients = await getAdminClients();

    return <AdminClientsPage clients={clients} />;
}
