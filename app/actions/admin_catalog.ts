"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { notifyProductApproved } from "@/lib/mailer";

export async function getAdminProducts() {
    const { adminClient } = await verifyAdmin();

    const { data: products, error } = await adminClient
        .from("products")
        .select(`
            *,
            fournisseurs (
                entreprise
            ),
            product_families (
                nom
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin products:", error);
        return [];
    }

    return products;
}

export async function toggleProductStatus(productId: string, field: 'is_approved' | 'is_active', currentValue: boolean) {
    const { adminClient } = await verifyAdmin();

    const newValue = !currentValue;

    let productDetails = null;
    if (field === 'is_approved' && newValue === true) {
        const { data } = await adminClient
            .from("products")
            .select(`
                article,
                fournisseurs!inner ( email, nom_prenom )
            `)
            .eq("id", productId)
            .single();
        productDetails = data;
    }

    const { error } = await adminClient
        .from("products")
        .update({ [field]: newValue })
        .eq("id", productId);

    if (error) {
        return { success: false, error: "Erreur lors de la modification du statut du produit." };
    }

    // Trigger non-blocking email notification
    try {
        if (field === 'is_approved' && newValue === true && productDetails && productDetails.fournisseurs) {
            const fournisseur = Array.isArray(productDetails.fournisseurs) ? productDetails.fournisseurs[0] : productDetails.fournisseurs;
            if (fournisseur && fournisseur.email) {
                const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://movek.ma'}/produit/${productId}`;
                await notifyProductApproved(fournisseur.email, fournisseur.nom_prenom, productDetails.article, productUrl);
            }
        }
    } catch (emailError) {
        console.error("Failed to send product approval email:", emailError);
    }

    revalidatePath("/admin/produits");
    revalidatePath("/admin");
    return { success: true };
}

export async function getAdminFamilies() {
    const { adminClient } = await verifyAdmin();

    const { data: families, error } = await adminClient
        .from("product_families")
        .select(`
            *,
            product_subcategories (
                id,
                nom,
                slug
            )
        `)
        .order("ordre", { ascending: true });

    if (error) {
        console.error("Error fetching admin families:", error);
        return [];
    }

    return families;
}

// ── Family CRUD ──────────────────────────────────────────────

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function createFamily(nom: string) {
    const { adminClient } = await verifyAdmin();
    const slug = toSlug(nom);

    const { error } = await adminClient
        .from("product_families")
        .insert({ nom, slug, created_by_admin: true });

    if (error) {
        console.error("Create family error:", error);
        return { success: false, error: error.code === "23505" ? "Une famille avec ce nom existe déjà." : "Erreur lors de la création." };
    }

    revalidatePath("/admin/familles");
    return { success: true };
}

export async function updateFamily(familyId: string, nom: string) {
    const { adminClient } = await verifyAdmin();
    const slug = toSlug(nom);

    const { error } = await adminClient
        .from("product_families")
        .update({ nom, slug })
        .eq("id", familyId);

    if (error) {
        console.error("Update family error:", error);
        return { success: false, error: "Erreur lors de la mise à jour." };
    }

    revalidatePath("/admin/familles");
    revalidatePath("/produits");
    return { success: true };
}

export async function deleteFamily(familyId: string) {
    const { adminClient } = await verifyAdmin();

    // Check if products exist in this family
    const { count } = await adminClient
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("family_id", familyId);

    if (count && count > 0) {
        return { success: false, error: `Impossible de supprimer : ${count} produit(s) utilisent cette famille.` };
    }

    const { error } = await adminClient
        .from("product_families")
        .delete()
        .eq("id", familyId);

    if (error) {
        console.error("Delete family error:", error);
        return { success: false, error: "Erreur lors de la suppression." };
    }

    revalidatePath("/admin/familles");
    return { success: true };
}

// ── Subcategory CRUD ─────────────────────────────────────────

export async function createSubcategory(familyId: string, nom: string) {
    const { adminClient } = await verifyAdmin();
    const slug = toSlug(nom);

    const { error } = await adminClient
        .from("product_subcategories")
        .insert({ family_id: familyId, nom, slug });

    if (error) {
        console.error("Create subcategory error:", error);
        return { success: false, error: "Erreur lors de la création de la sous-catégorie." };
    }

    revalidatePath("/admin/familles");
    return { success: true };
}

export async function updateSubcategory(subId: string, nom: string) {
    const { adminClient } = await verifyAdmin();
    const slug = toSlug(nom);

    const { error } = await adminClient
        .from("product_subcategories")
        .update({ nom, slug })
        .eq("id", subId);

    if (error) {
        console.error("Update subcategory error:", error);
        return { success: false, error: "Erreur lors de la mise à jour." };
    }

    revalidatePath("/admin/familles");
    revalidatePath("/produits");
    return { success: true };
}

export async function deleteSubcategory(subId: string) {
    const { adminClient } = await verifyAdmin();

    const { count } = await adminClient
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("subcategory_id", subId);

    if (count && count > 0) {
        return { success: false, error: `Impossible de supprimer : ${count} produit(s) utilisent cette sous-catégorie.` };
    }

    const { error } = await adminClient
        .from("product_subcategories")
        .delete()
        .eq("id", subId);

    if (error) {
        console.error("Delete subcategory error:", error);
        return { success: false, error: "Erreur lors de la suppression." };
    }

    revalidatePath("/admin/familles");
    return { success: true };
}

