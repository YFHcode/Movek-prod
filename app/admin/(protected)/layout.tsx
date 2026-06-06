import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import { RealtimeListener } from "@/components/admin/RealtimeListener";
import React from "react";

export default async function AdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Check Session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/admin/login");
    }

    // 2. Check Strict Role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/");
    }

    return (
        <>
            <RealtimeListener />
            <AdminLayoutWrapper userEmail={session.user.email}>
                {children}
            </AdminLayoutWrapper>
        </>
    );
}
