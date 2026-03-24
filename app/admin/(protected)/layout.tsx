import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
        <div className="min-h-screen bg-[#0A1628] flex text-slate-300 font-sans selection:bg-[#FF6B00]/30 selection:text-white relative">
            <RealtimeListener />
            <AdminSidebar userEmail={session.user.email} />
            <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
                <main className="flex-1 flex flex-col bg-[#0A1628]">
                    {children}
                </main>
            </div>
        </div>
    );
}
