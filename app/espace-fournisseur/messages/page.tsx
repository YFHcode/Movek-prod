import React from "react";
import { Mail } from "lucide-react";

export const metadata = {
    title: "Messages | Espace Fournisseur | MOVEK",
};

export default function FournisseurMessagesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Messages ETREND</h1>
                <p className="mt-1 text-sm text-movek-text-secondary">
                    Retrouvez ici les communications de l&apos;équipe ETREND concernant votre compte et vos produits.
                </p>
            </div>

            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-movek-border bg-movek-navy/50 p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                    <Mail className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-white">Aucun message pour le moment</h2>
                <p className="max-w-md text-sm text-movek-text-secondary">
                    Vous n&apos;avez reçu aucun message de l&apos;équipe ETREND.
                    Nous vous contacterons ici si nous avons besoin de précisions sur vos produits.
                </p>
            </div>
        </div>
    );
}
