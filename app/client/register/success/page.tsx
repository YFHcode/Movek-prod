import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inscription réussie",
};

export default function RegisterSuccessPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="max-w-md rounded-xl border border-movek-border bg-movek-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="mb-2 text-xl font-bold text-white">
                    Inscription envoyée !
                </h1>
                <p className="mb-6 text-sm text-movek-text-secondary">
                    Votre demande a bien été reçue. Notre équipe ETREND va valider
                    votre compte et vous recevrez un email de confirmation.
                </p>
                <Link href="/">
                    <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110 transition-all">
                        Retour à l&apos;accueil
                    </Button>
                </Link>
            </div>
        </div>
    );
}
