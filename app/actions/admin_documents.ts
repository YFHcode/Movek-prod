"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function getAdminDocuments() {
    const { adminClient } = await verifyAdmin();

    const { data: documents, error } = await adminClient
        .from("technical_documents")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching technical documents:", error);
        return [];
    }

    return documents;
}

interface DocumentFormState {
    success: boolean;
    error: string | null;
}

export async function uploadTechnicalDocument(
    _prevState: DocumentFormState,
    formData: FormData
): Promise<DocumentFormState> {
    const { adminClient } = await verifyAdmin();

    try {
        const file = formData.get("file") as File | null;
        const reference = formData.get("reference") as string;
        const marque = formData.get("marque") as string;
        const produit = formData.get("produit") as string;

        if (!file || file.size === 0) {
            return { success: false, error: "Vous devez📁 sélectionner un fichier PDF." };
        }

        if (file.type !== "application/pdf") {
            return { success: false, error: "Seuls les fichiers PDF sont autorisés." };
        }

        // 1. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await adminClient.storage
            .from("technical-documents")
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return { success: false, error: "Erreur lors de l'upload du fichier vers le stockage." };
        }

        // 2. Get Public URL
        const { data: publicUrlData } = adminClient.storage
            .from("technical-documents")
            .getPublicUrl(filePath);

        // 3. Insert record into technical_documents table
        const { error: dbError } = await adminClient
            .from("technical_documents")
            .insert({
                file_name: file.name,
                file_url: publicUrlData.publicUrl,
                reference: reference || null,
                marque: marque || null,
                produit: produit || null,
                is_downloadable: true
            });

        if (dbError) {
            console.error("DB insert error:", dbError);
            // Attempt to clean up orphaned file
            await adminClient.storage.from("technical-documents").remove([filePath]);
            return { success: false, error: "Erreur lors de l'enregistrement en base de données." };
        }

        revalidatePath("/admin/documents");
        return { success: true, error: null };
    } catch (error) {
        console.error("Upload handler error:", error);
        return { success: false, error: "Une erreur inattendue est survenue." };
    }
}

export async function deleteTechnicalDocument(documentId: string, fileUrl: string) {
    const { adminClient } = await verifyAdmin();

    try {
        // Extract the file path from the public URL
        // Example URL: https://[PROJECT_ID].supabase.co/storage/v1/object/public/technical-documents/documents/123456_abc.pdf
        // We need: "documents/123456_abc.pdf"
        const urlParts = fileUrl.split("/technical-documents/");
        if (urlParts.length === 2) {
            const filePath = urlParts[1];

            // Delete from storage
            const { error: storageError } = await adminClient.storage
                .from("technical-documents")
                .remove([filePath]);

            if (storageError) {
                console.error("Error deleting from storage", storageError);
                // We don't abort, we still want to delete the DB record
            }
        }

        // Delete from database
        const { error: dbError } = await adminClient
            .from("technical_documents")
            .delete()
            .eq("id", documentId);

        if (dbError) {
            return { success: false, error: "Erreur lors de la suppression en base de données." };
        }

        revalidatePath("/admin/documents");
        return { success: true };
    } catch (error) {
        console.error("Delete handler error:", error);
        return { success: false, error: "Une erreur inattendue est survenue." };
    }
}
