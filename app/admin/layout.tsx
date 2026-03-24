import React from "react";

export const metadata = {
    title: "Tableau de Bord Administrateur | MOVEK",
    description: "Portail d'administration de la plateforme MOVEK",
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This is a simple pass-through layout.
    // Auth checks + sidebar are in app/admin/(protected)/layout.tsx
    // This allows /admin/login to render without auth checks.
    return <>{children}</>;
}
