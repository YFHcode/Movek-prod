import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
    return (
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-movek-card">
                <Search className="h-12 w-12 text-movek-text-secondary" />
            </div>
            <h1 className="mb-2 text-6xl font-bold text-white">404</h1>
            <h2 className="mb-2 text-xl font-semibold text-white">
                Page introuvable
            </h2>
            <p className="mb-8 max-w-md text-movek-text-secondary">
                La page que vous recherchez n&apos;existe pas ou a été déplacée.
            </p>
            <Link href="/">
                <Button className="rounded-full bg-movek-orange px-8 py-5 font-bold text-white hover:brightness-110 transition-all">
                    Retour à l&apos;accueil
                </Button>
            </Link>
        </main>
    );
}
