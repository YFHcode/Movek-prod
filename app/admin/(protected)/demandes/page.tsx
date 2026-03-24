import React from "react";
import AdminDemandesPage from "@/components/admin/AdminDemandesPage";
import { getAdminDemandes } from "@/app/actions/admin_commercial";

export default async function Page() {
    const demandes = await getAdminDemandes();

    return <AdminDemandesPage demandes={demandes} />;
}
