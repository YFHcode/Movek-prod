import { verifyAdmin } from "@/lib/auth/admin";
import AdminDocumentsPage from "@/components/admin/AdminDocumentsPage";
import { getAdminDocuments } from "@/app/actions/admin_documents";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documents Techniques | MOVEK Admin",
    description: "Gestion des fiches techniques, catalogues et documents",
};

export default async function DocumentsRoute() {
    await verifyAdmin();
    const documents = await getAdminDocuments();

    return <AdminDocumentsPage initialDocuments={documents || []} />;
}
