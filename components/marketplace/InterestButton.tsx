"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { registerInterest } from "@/app/actions/interests";

interface InterestButtonProps {
    productId: string;
    className?: string;
}

export default function InterestButton({
    productId,
    className = "",
}: InterestButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isInterested, setIsInterested] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        checkAuthAndInterest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    async function checkAuthAndInterest() {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsAuthenticated(false);
            setIsChecking(false);
            return;
        }

        setIsAuthenticated(true);

        // Get user role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile) {
            setUserRole(profile.role);
        }

        // If client, check existing interest
        if (profile?.role === "client") {
            const { data: client } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (client) {
                const { data: existingInterest } = await supabase
                    .from("interests")
                    .select("id, expires_at")
                    .eq("client_id", client.id)
                    .eq("product_id", productId)
                    .eq("is_deleted", false)
                    .gte("expires_at", new Date().toISOString())
                    .maybeSingle();

                if (existingInterest) {
                    setIsInterested(true);
                }
            }
        }

        setIsChecking(false);
    }

    async function handleInterest() {
        if (!isAuthenticated) {
            const currentPath = window.location.pathname;
            router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        if (isInterested || isLoading) return;

        setIsLoading(true);
        setIsInterested(true); // Optimistic

        try {
            const result = await registerInterest(productId);

            if (!result.success) {
                setIsInterested(false);
                toast({
                    variant: "destructive",
                    description: result.error || "Une erreur est survenue.",
                });
            } else if (result.alreadyExists) {
                toast({
                    description: "Vous avez déjà manifesté votre intérêt pour ce produit.",
                });
            } else {
                toast({
                    description: "✅ Intérêt enregistré ! Notre équipe vous contactera sous 24h.",
                });
            }
        } catch {
            setIsInterested(false);
            toast({
                variant: "destructive",
                description: "Une erreur est survenue. Veuillez réessayer.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Hide for fournisseur/admin
    if (!isChecking && userRole && userRole !== "client") {
        return null;
    }

    if (isChecking) {
        return (
            <Button
                disabled
                className={`w-full rounded-full bg-movek-card text-movek-text-secondary ${className}`}
            >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
            </Button>
        );
    }

    if (isInterested) {
        return (
            <Button
                disabled
                className={`w-full rounded-full bg-movek-card text-movek-text-secondary ${className}`}
            >
                <Check className="mr-2 h-4 w-4" />
                Demande envoyée — Nous vous contacterons
            </Button>
        );
    }

    return (
        <Button
            onClick={handleInterest}
            disabled={isLoading}
            className={`w-full rounded-full bg-movek-orange font-semibold text-white hover:brightness-110 transition-all ${className}`}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Heart className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Envoi en cours..." : "Je suis intéressé(e) — Contactez-moi"}
        </Button>
    );
}
