"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to generate a unique filename
function generateUniqueFilename(originalName: string) {
    const ext = originalName.split('.').pop() || '';
    const nameStr = originalName.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '-');
    return `${Date.now()}-${nameStr}.${ext}`;
}

export interface AddProductState {
    success: boolean;
    error: string | null;
}

export async function addProduct(
    _prev: AddProductState,
    formData: FormData
): Promise<AddProductState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Non authentifié." };

        const { data: fournisseur } = await supabase
            .from("fournisseurs")
            .select("id, is_approved, entreprise")
            .eq("user_id", user.id)
            .single();

        if (!fournisseur || !fournisseur.is_approved) {
            return { success: false, error: "Compte fournisseur non validé." };
        }

        const article = formData.get("article") as string;
        const designation = formData.get("designation") as string;
        const marque = (formData.get("marque") as string) || null;
        const reference = (formData.get("reference") as string) || null;
        const origine = (formData.get("origine") as string) || null;
        const quantite = parseInt(formData.get("quantite") as string, 10);
        const unite = formData.get("unite") as string;
        const lieu_expedition = formData.get("lieu_expedition") as string;
        const garantie = formData.get("garantie") === "true";
        const garantie_mois = garantie ? parseInt(formData.get("garantie_mois") as string, 10) : null;
        const etat = formData.get("etat") as string;
        const prixStr = formData.get("prix") as string;
        const prix = prixStr ? parseFloat(prixStr) : null;
        const devise = (formData.get("devise") as string) || "MAD";
        const family_id = formData.get("family_id") as string;
        const subcategory_id = formData.get("subcategory_id") as string;

        if (!article || !designation || !etat || !family_id || !subcategory_id) {
            return { success: false, error: "Champs obligatoires manquants." };
        }

        // 1. Create Product
        const { data: product, error: insertError } = await supabase
            .from("products")
            .insert({
                fournisseur_id: fournisseur.id,
                article,
                designation,
                marque,
                reference,
                origine,
                quantite: isNaN(quantite) ? null : quantite,
                unite,
                lieu_expedition,
                garantie,
                garantie_mois: isNaN(garantie_mois as number) ? null : garantie_mois,
                etat,
                prix: isNaN(prix as number) ? null : prix,
                devise,
                family_id,
                subcategory_id,
                is_active: true,
                is_approved: false, // Must be approved by admin
            })
            .select("id")
            .single();

        if (insertError || !product) {
            console.error("Product insert error:", insertError);
            return { success: false, error: "Erreur lors de la création du produit." };
        }

        const adminSupabase = createAdminClient();

        // 2. Upload Images
        const images = formData.getAll("newImages") as File[];
        const imageInsertData = [];
        let order = 1;

        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            if (image.size === 0) continue;
            const uniqueName = generateUniqueFilename(image.name);
            const path = `${fournisseur.id}/${product.id}/${uniqueName}`;

            const { error: uploadError } = await adminSupabase.storage
                .from("product-images")
                .upload(path, image);

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from("product-images")
                    .getPublicUrl(path);

                imageInsertData.push({
                    product_id: product.id,
                    image_url: publicUrl,
                    ordre: parseInt((formData.get(`imagesOrder_${index}`) as string) || String(order), 10)
                });
                order++;
            } else {
                console.error("Image upload error:", uploadError);
            }
        }

        if (imageInsertData.length > 0) {
            await adminSupabase.from("product_images").insert(imageInsertData);
        }

        // 3. Upload PDF
        const pdf = formData.get("newPdf") as File;
        if (pdf && pdf.size > 0) {
            const uniqueName = generateUniqueFilename(pdf.name);
            const path = `${fournisseur.id}/${product.id}/${uniqueName}`;

            const { error: uploadError } = await adminSupabase.storage
                .from("technical-sheets")
                .upload(path, pdf);

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from("technical-sheets")
                    .getPublicUrl(path);

                await adminSupabase.from("technical_sheets").insert({
                    product_id: product.id,
                    file_url: publicUrl,
                    file_name: pdf.name,
                });
            } else {
                console.error("PDF upload error:", uploadError);
            }
        }

        // 4. Send Email to Admin
        try {
            await resend.emails.send({
                from: "notifications@resend.dev",
                to: "yousseffh88@gmail.com",
                subject: `📦 Nouveau Produit à valider: ${article}`,
                html: `
                  <div style="background:#0A1628;padding:40px;font-family:Arial;">
                    <h2 style="color:white;">Nouveau Produit Ajouté</h2>
                    <p style="color:#94A3B8;">Le fournisseur <b>${fournisseur.entreprise}</b> vient d'ajouter un nouveau produit.</p>
                    <table style="width:100%;color:white;">
                      <tr><td style="padding:8px;">Article</td><td>${article}</td></tr>
                      <tr><td style="padding:8px;">Désignation</td><td>${designation}</td></tr>
                      <tr><td style="padding:8px;">Marque</td><td>${marque || "—"}</td></tr>
                    </table>
                    <p style="color:#94A3B8;">Veuillez vous connecter à l'interface d'administration pour valider ce produit.</p>
                  </div>
                `
            });
        } catch (e) {
            console.error("Resend error:", e);
        }

        revalidatePath("/espace-fournisseur/produits");
        return { success: true, error: null };
    } catch (e) {
        console.error("Add product catch:", e);
        return { success: false, error: "Une erreur interne est survenue." };
    }
}

// ─── Delete Product ──────────────────────────────────────────────────
export interface DeleteProductState {
    success: boolean;
    error: string | null;
}

export async function deleteProduct(productId: string): Promise<DeleteProductState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Non authentifié." };

        const { data: fournisseur } = await supabase
            .from("fournisseurs")
            .select("id, entreprise")
            .eq("user_id", user.id)
            .single();

        if (!fournisseur) return { success: false, error: "Accès refusé." };

        // Verify ownership
        const { data: product } = await supabase
            .from("products")
            .select("id, article")
            .eq("id", productId)
            .eq("fournisseur_id", fournisseur.id)
            .single();

        if (!product) return { success: false, error: "Produit introuvable ou vous n'en êtes pas propriétaire." };

        const adminSupabase = createAdminClient();

        // Check active interests before deleting
        const { count: interestsCount } = await adminSupabase
            .from("interests")
            .select("id", { count: "exact", head: true })
            .eq("product_id", productId);

        if (interestsCount && interestsCount > 0) {
            // Notify admin
            try {
                await resend.emails.send({
                    from: "notifications@resend.dev",
                    to: "yousseffh88@gmail.com",
                    subject: `⚠️ Produit supprimé par fournisseur — avait ${interestsCount} intérêts`,
                    html: `
                      <div style="background:#0A1628;padding:40px;font-family:Arial;">
                        <h2 style="color:white;color:red;">Attention : Produit avec intérêts supprimé</h2>
                        <p style="color:#94A3B8;">Le fournisseur <b>${fournisseur.entreprise}</b> a supprimé le produit <b>${product.article}</b>.</p>
                        <p style="color:#94A3B8;">Ce produit était dans la liste d'intérêts de ${interestsCount} acheteur(s).</p>
                      </div>
                    `
                });
            } catch (e) {
                console.error("Resend error inside deleteProduct:", e);
            }
        }

        // The user explicitly requested to delete in this exact order to avoid orphaned records:
        // 1. product_images (DB row)
        // 2. technical_sheets (DB row)
        // 3. interests (DB row)
        // 4. Storage files
        // 5. Product (implicit, at the end)

        // 1. Delete product_images DB rows
        await adminSupabase.from("product_images").delete().eq("product_id", productId);

        // 2. Delete technical_sheets DB rows
        await adminSupabase.from("technical_sheets").delete().eq("product_id", productId);

        // 3. Delete interests DB rows
        await adminSupabase.from("interests").delete().eq("product_id", productId);

        // 4. Delete Storage Files (list files first)
        const imagePath = `${fournisseur.id}/${productId}`;
        const { data: imageFiles } = await adminSupabase.storage.from("product-images").list(imagePath);
        if (imageFiles && imageFiles.length > 0) {
            const filesToRemove = imageFiles.map((x) => `${imagePath}/${x.name}`);
            await adminSupabase.storage.from("product-images").remove(filesToRemove);
        }

        const sheetPath = `${fournisseur.id}/${productId}`;
        const { data: sheetFiles } = await adminSupabase.storage.from("technical-sheets").list(sheetPath);
        if (sheetFiles && sheetFiles.length > 0) {
            const filesToRemove = sheetFiles.map((x) => `${sheetPath}/${x.name}`);
            await adminSupabase.storage.from("technical-sheets").remove(filesToRemove);
        }

        // 5. Delete Product DB row
        const { error: deleteError } = await adminSupabase
            .from("products")
            .delete()
            .eq("id", productId);

        if (deleteError) {
            console.error("Product deletion error:", deleteError);
            return { success: false, error: "Erreur lors de la suppression en base de données." };
        }

        revalidatePath("/espace-fournisseur/produits");
        return { success: true, error: null };
    } catch (e) {
        console.error("Delete product catch error:", e);
        return { success: false, error: "Une erreur est survenue lors de la suppression." };
    }
}

// ─── Update Product ──────────────────────────────────────────────────
export interface UpdateProductState {
    success: boolean;
    error: string | null;
}

export async function updateProduct(
    _prev: UpdateProductState,
    formData: FormData
): Promise<UpdateProductState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Non authentifié." };

        const { data: fournisseur } = await supabase
            .from("fournisseurs")
            .select("id, entreprise")
            .eq("user_id", user.id)
            .single();

        if (!fournisseur) return { success: false, error: "Accès refusé." };

        const productId = formData.get("productId") as string;
        if (!productId) return { success: false, error: "ID du produit manquant." };

        // Verify ownership
        const { data: existingProduct } = await supabase
            .from("products")
            .select("id")
            .eq("id", productId)
            .eq("fournisseur_id", fournisseur.id)
            .single();

        if (!existingProduct) return { success: false, error: "Produit introuvable." };

        const article = formData.get("article") as string;
        const designation = formData.get("designation") as string;
        const marque = (formData.get("marque") as string) || null;
        const reference = (formData.get("reference") as string) || null;
        const origine = (formData.get("origine") as string) || null;
        const quantite = parseInt(formData.get("quantite") as string, 10);
        const unite = formData.get("unite") as string;
        const lieu_expedition = formData.get("lieu_expedition") as string;
        const garantie = formData.get("garantie") === "true";
        const garantie_mois = garantie ? parseInt(formData.get("garantie_mois") as string, 10) : null;
        const etat = formData.get("etat") as string;
        const prixStr = formData.get("prix") as string;
        const prix = prixStr ? parseFloat(prixStr) : null;
        const devise = (formData.get("devise") as string) || "MAD";
        const family_id = formData.get("family_id") as string;
        const subcategory_id = formData.get("subcategory_id") as string;

        if (!article || !designation || !etat || !family_id || !subcategory_id) {
            return { success: false, error: "Champs obligatoires manquants." };
        }

        const adminSupabase = createAdminClient();

        // 1. Update Product Row
        const { error: updateError } = await adminSupabase
            .from("products")
            .update({
                article,
                designation,
                marque,
                reference,
                origine,
                quantite: isNaN(quantite) ? null : quantite,
                unite,
                lieu_expedition,
                garantie,
                garantie_mois: isNaN(garantie_mois as number) ? null : garantie_mois,
                etat,
                prix: isNaN(prix as number) ? null : prix,
                devise,
                family_id,
                subcategory_id,
                is_approved: false, // Force re-validation
                rejection_reason: null, // Clear any previous rejection
            })
            .eq("id", productId);

        if (updateError) {
            console.error("Product update error:", updateError);
            return { success: false, error: "Erreur lors de la mise à jour." };
        }

        // 2. Handle Kept Images (reordering existing ones)
        const keptImagesStr = formData.get("keptImages") as string;
        if (keptImagesStr) {
            try {
                const keptImages: { id: string, ordre: number }[] = JSON.parse(keptImagesStr);
                // Update order for each kept image
                for (const img of keptImages) {
                    await adminSupabase.from("product_images").update({ ordre: img.ordre }).eq("id", img.id);
                }
            } catch (e) {
                console.error("Kept images parse error:", e);
            }
        }

        // 3. Handle Deleted Images
        const deletedImagesStr = formData.get("deletedImages") as string;
        if (deletedImagesStr) {
            try {
                const deletedImages: { id: string, url: string }[] = JSON.parse(deletedImagesStr);
                for (const img of deletedImages) {
                    // Extract filename from URL
                    const filename = img.url.split('/').pop();
                    if (filename) {
                        const path = `${fournisseur.id}/${productId}/${filename}`;
                        await adminSupabase.storage.from("product-images").remove([path]);
                    }
                    // Delete from DB (though DB cascading might handle if product deleted, here we are manually deleting images)
                    await adminSupabase.from("product_images").delete().eq("id", img.id);
                }
            } catch (e) {
                console.error("Deleted images parse error:", e);
            }
        }

        // 4. Handle New Images
        const newImages = formData.getAll("newImages") as File[];
        const imageInsertData = [];

        for (let index = 0; index < newImages.length; index++) {
            const image = newImages[index];
            if (image.size === 0) continue;
            const uniqueName = generateUniqueFilename(image.name);
            const path = `${fournisseur.id}/${productId}/${uniqueName}`;

            const { error: uploadError } = await adminSupabase.storage
                .from("product-images")
                .upload(path, image);

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from("product-images")
                    .getPublicUrl(path);

                imageInsertData.push({
                    product_id: productId,
                    image_url: publicUrl,
                    ordre: parseInt((formData.get(`newImagesOrder_${index}`) as string) || "99", 10)
                });
            }
        }

        if (imageInsertData.length > 0) {
            await adminSupabase.from("product_images").insert(imageInsertData);
        }

        // 5. Handle PDF Replacement
        const newPdf = formData.get("newPdf") as File;
        if (newPdf && newPdf.size > 0) {
            // Find existing PDF
            const { data: existingPdf } = await adminSupabase
                .from("technical_sheets")
                .select("id, file_url")
                .eq("product_id", productId)
                .single();

            if (existingPdf) {
                const filename = existingPdf.file_url.split('/').pop();
                if (filename) {
                    const oldPath = `${fournisseur.id}/${productId}/${filename}`;
                    await adminSupabase.storage.from("technical-sheets").remove([oldPath]);
                }
                await adminSupabase.from("technical_sheets").delete().eq("id", existingPdf.id);
            }

            const uniqueName = generateUniqueFilename(newPdf.name);
            const path = `${fournisseur.id}/${productId}/${uniqueName}`;

            const { error: uploadError } = await adminSupabase.storage
                .from("technical-sheets")
                .upload(path, newPdf);

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from("technical-sheets")
                    .getPublicUrl(path);

                await adminSupabase.from("technical_sheets").insert({
                    product_id: productId,
                    file_url: publicUrl,
                    file_name: newPdf.name,
                });
            }
        }

        // 6. Send Email to Admin (Re-validation)
        try {
            await resend.emails.send({
                from: "notifications@resend.dev",
                to: "yousseffh88@gmail.com",
                subject: `📦 Produit modifié (à re-valider): ${article}`,
                html: `
                  <div style="background:#0A1628;padding:40px;font-family:Arial;">
                    <h2 style="color:white;color:orange;">Produit Modifié par le Fournisseur</h2>
                    <p style="color:#94A3B8;">Le fournisseur <b>${fournisseur.entreprise}</b> a modifié le produit <b>${article}</b>.</p>
                    <p style="color:#94A3B8;">Le produit a été automatiquement retiré du marché public.</p>
                    <p style="color:#94A3B8;">Veuillez le vérifier et le re-valider depuis l'interface d'administration.</p>
                  </div>
                `
            });
        } catch (e) {
            console.error("Resend error inside updateProduct:", e);
        }

        revalidatePath("/espace-fournisseur/produits");
        revalidatePath(`/produits/${productId}`);
        revalidatePath("/produits");

        return { success: true, error: null };
    } catch (e) {
        console.error("Update product catch:", e);
        return { success: false, error: "Une erreur interne est survenue." };
    }
}
