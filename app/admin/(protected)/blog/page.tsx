import React from "react";
import AdminBlogPage from "@/components/admin/AdminBlogPage";
import { getAdminBlogPosts } from "@/app/actions/admin_blog";

export default async function Page() {
    const posts = await getAdminBlogPosts();

    return <AdminBlogPage posts={posts} />;
}
