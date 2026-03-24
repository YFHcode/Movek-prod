import React from "react";
import AdminFamiliesPage from "@/components/admin/AdminFamiliesPage";
import { getAdminFamilies } from "@/app/actions/admin_catalog";

export default async function Page() {
    const families = await getAdminFamilies();

    return <AdminFamiliesPage families={families} />;
}
