"use client";

import { useRef, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, EyeOff, BadgeCheck } from "lucide-react";
import { registerFournisseur } from "@/app/actions/fournisseur_auth";

const initialState = {
    success: false,
    error: null as string | null,
    fieldErrors: undefined as Record<string, string> | undefined,
};

const countries = [
    "Maroc", "Algérie", "Tunisie", "France", "Belgique",
    "Sénégal", "Côte d'Ivoire", "Espagne", "Canada", "Autre",
];

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: "Faible", color: "bg-red-500" };
    if (score <= 3) return { level: 2, label: "Moyen", color: "bg-orange-500" };
    return { level: 3, label: "Fort", color: "bg-green-500" };
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-movek-orange py-6 text-lg font-bold text-white hover:brightness-110 transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                </>
            ) : (
                "DEVENIR FOURNISSEUR"
            )}
        </Button>
    );
}

function FieldError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="mt-1 text-xs text-red-400">{error}</p>;
}

export default function FournisseurRegisterPage() {
    const [state, formAction] = useFormState(registerFournisseur, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const strength = getPasswordStrength(password);

    useEffect(() => {
        if (state.success) {
            router.push("/fournisseur/register/success");
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen bg-movek-navy px-4 py-12">
            {/* Industrial grid texture */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,107,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,0,0.3) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative mx-auto max-w-[600px]">
                <div className="rounded-xl border border-movek-border bg-movek-card p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/" className="mb-4 inline-block text-2xl font-bold text-white">
                            MOV<span className="text-movek-orange">EK</span>
                        </Link>
                        <h1 className="text-xl font-bold text-white">
                            Devenir Fournisseur
                        </h1>
                        <p className="mt-1 text-sm text-movek-text-secondary">
                            Vendez vos produits industriels sur la marketplace MOVEK
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-movek-orange/20 px-4 py-1 text-xs font-semibold text-movek-orange">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Partenaire Certifié
                        </span>
                    </div>

                    {state.error && (
                        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                            {state.error}
                        </div>
                    )}

                    <form ref={formRef} action={formAction} className="space-y-4">
                        {/* Row 1: Nom / Prénom */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-movek-text-secondary">Nom *</Label>
                                <Input name="nom" required minLength={2} placeholder="Votre nom"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.nom} />
                            </div>
                            <div>
                                <Label className="text-movek-text-secondary">Prénom *</Label>
                                <Input name="prenom" required minLength={2} placeholder="Votre prénom"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.prenom} />
                            </div>
                        </div>

                        {/* Row 2: Fonction / Entreprise */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-movek-text-secondary">Fonction *</Label>
                                <Input name="fonction" required placeholder="Votre fonction"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.fonction} />
                            </div>
                            <div>
                                <Label className="text-movek-text-secondary">Entreprise *</Label>
                                <Input name="entreprise" required minLength={2} placeholder="Nom de la société"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.entreprise} />
                            </div>
                        </div>

                        {/* Row 3: Adresse / Ville */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-movek-text-secondary">Adresse</Label>
                                <Input name="adresse" placeholder="Adresse"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                            </div>
                            <div>
                                <Label className="text-movek-text-secondary">Ville</Label>
                                <Input name="ville" placeholder="Ville"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                            </div>
                        </div>

                        {/* Row 4: Pays */}
                        <div>
                            <Label className="text-movek-text-secondary">Pays *</Label>
                            <select name="pays" required defaultValue="Maroc"
                                className="mt-1 w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white">
                                <option value="">Sélectionnez un pays</option>
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <FieldError error={state.fieldErrors?.pays} />
                        </div>

                        {/* Row 5: Email / Téléphone */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-movek-text-secondary">Email pro *</Label>
                                <Input name="email" type="email" required placeholder="contact@societe.com"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.email} />
                            </div>
                            <div>
                                <Label className="text-movek-text-secondary">Téléphone direct *</Label>
                                <Input name="telephone" required placeholder="+212 600 000 000"
                                    className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                                <FieldError error={state.fieldErrors?.telephone} />
                            </div>
                        </div>

                        {/* Row 6: Passwords */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-movek-text-secondary">Mot de passe *</Label>
                                <div className="relative mt-1">
                                    <Input name="password" type={showPassword ? "text" : "password"}
                                        required minLength={8} placeholder="Min. 8 caractères"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="border-movek-border bg-movek-navy pr-10 text-white placeholder:text-movek-text-secondary" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-movek-text-secondary hover:text-white">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {/* Password strength indicator */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((l) => (
                                                <div key={l} className={`h-1 flex-1 rounded-full ${l <= strength.level ? strength.color : "bg-movek-border"}`} />
                                            ))}
                                        </div>
                                        <p className={`mt-1 text-xs ${strength.level === 1 ? "text-red-400" : strength.level === 2 ? "text-orange-400" : "text-green-400"}`}>
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                                <FieldError error={state.fieldErrors?.password} />
                            </div>
                            <div>
                                <Label className="text-movek-text-secondary">Confirmer *</Label>
                                <div className="relative mt-1">
                                    <Input name="confirmPassword" type={showConfirm ? "text" : "password"}
                                        required minLength={8} placeholder="Confirmez le mot de passe"
                                        className="border-movek-border bg-movek-navy pr-10 text-white placeholder:text-movek-text-secondary" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-movek-text-secondary hover:text-white">
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <FieldError error={state.fieldErrors?.confirmPassword} />
                            </div>
                        </div>

                        {/* Row 7: Message */}
                        <div>
                            <Label className="text-movek-text-secondary">Secteur d&apos;activité principal</Label>
                            <Textarea name="message" placeholder="Quels types de produits proposez-vous ?"
                                className="mt-1 min-h-[80px] border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                        </div>

                        {/* CGV Checkbox */}
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" name="acceptCgv" required
                                    className="mt-1 accent-movek-orange" />
                                <span className="text-xs text-movek-text-secondary">
                                    J&apos;accepte les{" "}
                                    <Link href="/legal/cgv-fournisseurs" target="_blank" className="text-movek-orange underline">
                                        CGV Fournisseurs
                                    </Link>{" "}
                                    et la{" "}
                                    <Link href="/legal/confidentialite" target="_blank" className="text-movek-orange underline">
                                        Politique de Confidentialité
                                    </Link>
                                </span>
                            </label>
                            <FieldError error={state.fieldErrors?.acceptCgv} />
                        </div>

                        <SubmitButton />
                    </form>

                    {/* Bottom link */}
                    <p className="mt-6 text-center text-sm text-movek-text-secondary">
                        Vous avez déjà un compte ?{" "}
                        <Link href="/fournisseur/login" className="font-semibold text-movek-orange hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
