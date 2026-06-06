"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayoutWrapper({
    userEmail,
    children,
}: {
    userEmail: string | undefined;
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load state from localStorage on mount (for persistent UX across page refreshes)
    useEffect(() => {
        const stored = localStorage.getItem("admin-sidebar-collapsed");
        if (stored === "true") {
            setIsCollapsed(true);
        }
    }, []);

    const handleToggle = () => {
        const nextState = !isCollapsed;
        setIsCollapsed(nextState);
        localStorage.setItem("admin-sidebar-collapsed", String(nextState));
    };

    return (
        <div className="min-h-screen bg-[#0A1628] flex text-slate-300 font-sans selection:bg-[#FF6B00]/30 selection:text-white relative">
            <AdminSidebar 
                userEmail={userEmail} 
                isCollapsed={isCollapsed} 
                onToggle={handleToggle} 
            />
            {/* The main wrapper's margin-left transitions smoothly aligned with the sidebar width */}
            <div 
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
                    isCollapsed ? "ml-[80px]" : "ml-[260px]"
                }`}
            >
                <main className="flex-1 flex flex-col bg-[#0A1628]">
                    {children}
                </main>
            </div>
        </div>
    );
}
