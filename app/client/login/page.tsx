"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Clock, AlertTriangle } from "lucide-react";
import { loginClient } from "@/app/actions/auth";

const initialState = {
    success: false,
    error: null as string | null,
    notApproved: false,
};

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
                    Connexion...
                </>
            ) : (
                "SE CONNECTER"
            )}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(loginClient, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/mon-compte";

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="w-full max-w-[480px]">
                <div className="rounded-xl border border-movek-border bg-movek-card p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/" className="mb-4 inline-block text-2xl font-bold text-white">
                            MOV<span className="text-movek-orange">EK</span>
                        </Link>
                        <h1 className="text-xl font-bold text-white">
                            Connexion Acheteur
                        </h1>
                    </div>

                    {/* Not approved warning */}
                    {state.notApproved && (
                        <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                            <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-400">
                                        Compte en attente de validation
                                    </p>
                                    <p className="mt-1 text-xs text-movek-text-secondary">
                                        Votre compte est en attente de validation par notre équipe
                                        ETREND. Vous recevrez un email dès que votre compte sera activé.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {state.error && (
                        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                                <p className="text-sm text-red-400">{state.error}</p>
                            </div>
                        </div>
                    )}

                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="redirect" value={redirectTo} />

                        <div>
                            <Label className="text-movek-text-secondary">Email</Label>
                            <Input name="email" type="email" required placeholder="votre@email.com"
                                className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary" />
                        </div>

                        <div>
                            <Label className="text-movek-text-secondary">Mot de passe</Label>
                            <div className="relative mt-1">
                                <Input name="password" type={showPassword ? "text" : "password"}
                                    required placeholder="Votre mot de passe"
                                    className="border-movek-border bg-movek-navy pr-10 text-white placeholder:text-movek-text-secondary" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-movek-text-secondary hover:text-white">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <Link href="/client/forgot-password"
                                className="text-xs text-movek-text-secondary hover:text-movek-orange">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <SubmitButton />
                    </form>

                    {/* Bottom link */}
                    <p className="mt-6 text-center text-sm text-movek-text-secondary">
                        Pas encore de compte ?{" "}
                        <Link href="/client/register" className="font-semibold text-movek-orange hover:underline">
                            S&apos;inscrire gratuitement
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
