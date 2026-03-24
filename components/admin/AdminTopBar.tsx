"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AdminTopBar({
    title,
    adminName
}: {
    title: string;
    adminName: string | undefined;
}) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        // Set initial time
        setCurrentTime(new Date());

        // Update every minute instead of every second to match typical dashboard clocks
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="h-[60px] bg-[#0F2040] border-b border-[#1E3A5F] flex items-center justify-between px-6 sticky top-0 z-40">
            <div>
                <h1 className="text-lg font-semibold text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-slate-300">
                    {currentTime ? format(currentTime, "EEEE d MMMM yyyy, HH:mm", { locale: fr }) : "Chargement..."}
                </div>

                <div className="h-6 w-px bg-[#1E3A5F] hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-white">{adminName || "Administrateur"}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-green-400 font-medium">En ligne</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
