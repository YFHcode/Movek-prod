"use client";

import { useRef, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "@/app/actions/auth";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
    nom_prenom: string;
    fonction: string | null;
    entreprise: string;
    adresse: string | null;
    ville: string | null;
    pays: string;
    email: string;
    telephone: string;
    created_at: string;
}

const countries = [
    "Maroc", "Algérie", "Tunisie", "France", "Belgique",
    "Sénégal", "Côte d'Ivoire", "Espagne", "Canada", "Autre",
];

const profileInitialState = { success: false, error: null as string | null };
const passwordInitialState = { success: false, error: null as string | null };

function ProfileSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110 transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                </>
            ) : (
                "METTRE À JOUR MON PROFIL"
            )}
        </Button>
    );
}

function PasswordSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            variant="outline"
            className="rounded-full border-movek-border text-white hover:border-movek-orange transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                </>
            ) : (
                "MODIFIER LE MOT DE PASSE"
            )}
        </Button>
    );
}

export default function ProfileClient({ client }: { client: ClientData }) {
    const [profileState, profileAction] = useFormState(updateProfile, profileInitialState);
    const [passwordState, passwordAction] = useFormState(changePassword, passwordInitialState);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const passwordFormRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    const nameParts = client.nom_prenom?.split(" ") || [];
    const prenom = nameParts[0] || "";
    const nom = nameParts.slice(1).join(" ") || "";
    const initials = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();

    useEffect(() => {
        if (profileState.success) {
            toast({ description: "Profil mis à jour ✓" });
        }
        if (profileState.error) {
            toast({ variant: "destructive", description: profileState.error });
        }
    }, [profileState, toast]);

    useEffect(() => {
        if (passwordState.success) {
            toast({ description: "Mot de passe modifié ✓" });
            passwordFormRef.current?.reset();
        }
        if (passwordState.error) {
            toast({ variant: "destructive", description: passwordState.error });
        }
    }, [passwordState, toast]);

    const memberSince = new Date(client.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="flex items-center gap-4 rounded-xl border border-movek-border bg-movek-card p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-movek-orange text-xl font-bold text-white">
                    {initials}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">{client.nom_prenom}</h2>
                    <p className="text-sm text-movek-text-secondary">{client.entreprise}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-movek-text-secondary">
                            Membre depuis {memberSince}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                            ✅ Compte actif
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h3 className="mb-4 font-bold text-white">Informations professionnelles</h3>
                <form action={profileAction} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-movek-text-secondary">Nom</Label>
                            <Input name="nom" defaultValue={nom} required
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                        <div>
                            <Label className="text-movek-text-secondary">Prénom</Label>
                            <Input name="prenom" defaultValue={prenom} required
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-movek-text-secondary">Fonction</Label>
                            <Input name="fonction" defaultValue={client.fonction || ""}
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                        <div>
                            <Label className="text-movek-text-secondary">Entreprise *</Label>
                            <Input name="entreprise" defaultValue={client.entreprise} required
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-movek-text-secondary">Adresse</Label>
                            <Input name="adresse" defaultValue={client.adresse || ""}
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                        <div>
                            <Label className="text-movek-text-secondary">Ville</Label>
                            <Input name="ville" defaultValue={client.ville || ""}
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-movek-text-secondary">Pays</Label>
                            <select name="pays" defaultValue={client.pays}
                                className="mt-1 w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white">
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-movek-text-secondary">Téléphone</Label>
                            <Input name="telephone" defaultValue={client.telephone}
                                className="mt-1 border-movek-border bg-movek-navy text-white" />
                        </div>
                    </div>

                    {/* Email: read only */}
                    <div>
                        <Label className="text-movek-text-secondary">Email</Label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-movek-text-secondary" />
                            <Input value={client.email} disabled readOnly
                                className="border-movek-border bg-movek-navy/50 pl-10 text-movek-text-secondary" />
                        </div>
                        <p className="mt-1 text-xs text-movek-text-secondary">
                            Pour modifier votre email, contactez contact@etrend-maroc.com
                        </p>
                    </div>

                    <ProfileSubmitButton />
                </form>
            </div>

            {/* Change Password */}
            <div className="rounded-xl border border-movek-border bg-movek-card p-6">
                <h3 className="mb-4 font-bold text-white">Changer mon mot de passe</h3>
                <form ref={passwordFormRef} action={passwordAction} className="space-y-4">
                    <div>
                        <Label className="text-movek-text-secondary">Nouveau mot de passe</Label>
                        <div className="relative mt-1">
                            <Input name="newPassword" type={showNew ? "text" : "password"}
                                required minLength={8} placeholder="Min. 8 caractères"
                                className="border-movek-border bg-movek-navy pr-10 text-white placeholder:text-movek-text-secondary" />
                            <button type="button" onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-movek-text-secondary hover:text-white">
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <Label className="text-movek-text-secondary">Confirmer le nouveau mot de passe</Label>
                        <div className="relative mt-1">
                            <Input name="confirmNewPassword" type={showConfirm ? "text" : "password"}
                                required minLength={8} placeholder="Confirmez le mot de passe"
                                className="border-movek-border bg-movek-navy pr-10 text-white placeholder:text-movek-text-secondary" />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-movek-text-secondary hover:text-white">
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <PasswordSubmitButton />
                </form>
            </div>
        </div>
    );
}
