"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { updateFournisseurProfile } from "@/app/actions/fournisseur_auth";

// Temporary standalone component for simplicity, relying on the client side data fetching 
// or server side initial data injection. Since it's a client component let's just create a shell
// that works for the MVP, or better, we can inject it from a server layout.
// Actually, here we can just write the basic UI shell and assume the data comes later, or use SWC.

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                </>
            ) : (
                "Enregistrer les modifications"
            )}
        </Button>
    );
}

export default function FournisseurProfilePage() {
    const [state, formAction] = useFormState(updateFournisseurProfile, {
        success: false,
        error: null,
    });
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Mon Profil Fournisseur</h1>
                <p className="mt-1 text-sm text-movek-text-secondary">
                    Gérez vos informations de contact professionnelles.
                </p>
            </div>

            <div className="max-w-2xl rounded-xl border border-movek-border bg-movek-card p-6">
                {state.success && (
                    <div className="mb-6 rounded-lg bg-green-500/10 p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <p className="font-medium text-green-400">
                                Profil mis à jour avec succès
                            </p>
                        </div>
                    </div>
                )}

                {state.error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 p-4">
                        <p className="text-sm font-medium text-red-500">{state.error}</p>
                    </div>
                )}

                <form ref={formRef} action={formAction} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Nom</Label>
                            <Input name="nom" required className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Prénom</Label>
                            <Input name="prenom" required className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Entreprise</Label>
                            <Input name="entreprise" required className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Fonction</Label>
                            <Input name="fonction" className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Téléphone</Label>
                        <Input name="telephone" required className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-movek-text-secondary">Adresse</Label>
                        <Input name="adresse" className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Ville</Label>
                            <Input name="ville" className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-movek-text-secondary">Pays</Label>
                            <Input name="pays" className="border-movek-border bg-movek-navy text-white placeholder:text-gray-500" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-movek-border">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
