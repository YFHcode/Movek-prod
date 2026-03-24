"use server";

import { verifyAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function getAdminBlogPosts() {
    const { adminClient } = await verifyAdmin();

    const { data: posts, error } = await adminClient
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }

    return posts;
}

export type BlogPostState = {
    success: boolean;
    error: string | null;
};

export async function updateBlogPost(
    _prev: BlogPostState,
    formData: FormData
): Promise<BlogPostState> {
    const { adminClient } = await verifyAdmin();

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    // Basic slug generation: lower case, replace spaces with hyphens, remove special chars
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const is_published = formData.get("is_published") === "on";

    if (!title || !content || !slug) {
        return { success: false, error: "Titre, slug et contenu sont obligatoires." };
    }

    if (id) {
        // Update existing
        const { error } = await adminClient
            .from("blog_posts")
            .update({ title, content, slug, is_published, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) return { success: false, error: "Erreur lors de la modification de l'article." };
    } else {
        // Create new (assuming we have author_id in the table, or we omit if not strictly required)
        const { data: user } = await adminClient.auth.getUser();

        const { error } = await adminClient
            .from("blog_posts")
            .insert({
                title,
                content,
                slug,
                is_published,
                author_id: user.user?.id
            });

        if (error) return { success: false, error: error.message || "Erreur lors de la création de l'article." };
    }

    revalidatePath("/admin/blog");
    return { success: true, error: null };
}

export async function deleteBlogPost(id: string) {
    const { adminClient } = await verifyAdmin();

    const { error } = await adminClient
        .from("blog_posts")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: "Erreur lors de la suppression." };
    }

    revalidatePath("/admin/blog");
    return { success: true };
}
