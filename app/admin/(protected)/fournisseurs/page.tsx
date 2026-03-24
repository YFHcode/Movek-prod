import React from "react";
import AdminFournisseursPage from "@/components/admin/AdminFournisseursPage";
import { getAdminFournisseurs } from "@/app/actions/admin_users";

export default async function Page() {
    const fournisseurs = await getAdminFournisseurs();

    return <AdminFournisseursPage fournisseurs={fournisseurs} />;
}
