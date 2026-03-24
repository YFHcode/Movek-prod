import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Clock, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FournisseurLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/fournisseur/login");
    }

    // Check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "fournisseur") {
        redirect("/");
    }

    // Check email confirmation
    if (!user.email_confirmed_at) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <div className="max-w-md rounded-xl border border-movek-border bg-movek-card p-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
                        <Mail className="h-10 w-10 text-blue-400" />
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-white">
                        Confirmez votre email
                    </h1>
                    <p className="mb-6 text-sm text-movek-text-secondary">
                        Veuillez confirmer votre email professionnel avant de continuer.
                        Vérifiez votre boîte de réception et cliquez sur le lien
                        de confirmation.
                    </p>
                    <Link href="/">
                        <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110">
                            Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Check is_approved
    const { data: fournisseur } = await supabase
        .from("fournisseurs")
        .select("is_approved")
        .eq("user_id", user.id)
        .single();

    if (!fournisseur || !fournisseur.is_approved) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <div className="max-w-md rounded-xl border border-movek-border bg-movek-card p-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20">
                        <Clock className="h-10 w-10 text-orange-400" />
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-white">
                        Compte en attente de validation
                    </h1>
                    <p className="mb-2 text-sm text-movek-text-secondary">
                        Notre équipe ETREND est en train d&apos;étudier votre demande de compte partenaire.
                        Vous recevrez un email dès que votre accès fournisseur sera activé.
                    </p>
                    <p className="mb-6 text-xs text-movek-text-secondary">
                        Contact :{" "}
                        <a
                            href="mailto:contact@etrend-maroc.com"
                            className="text-movek-orange hover:underline"
                        >
                            contact@etrend-maroc.com
                        </a>
                    </p>
                    <Link href="/">
                        <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110">
                            Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex gap-6">
                <DashboardSidebar />
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
