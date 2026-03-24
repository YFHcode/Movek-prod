"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Mail } from "lucide-react";
import { forgotPassword } from "@/app/actions/auth";

const initialState = { success: false, error: null as string | null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-movek-orange py-5 font-bold text-white hover:brightness-110 transition-all"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                </>
            ) : (
                "ENVOYER LE LIEN"
            )}
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useFormState(forgotPassword, initialState);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="w-full max-w-[480px]">
                <div className="rounded-xl border border-movek-border bg-movek-card p-6 sm:p-8">
                    <div className="mb-8 text-center">
                        <Link href="/" className="mb-4 inline-block text-2xl font-bold text-white">
                            MOV<span className="text-movek-orange">EK</span>
                        </Link>
                        <h1 className="text-xl font-bold text-white">
                            Mot de passe oublié
                        </h1>
                        <p className="mt-2 text-sm text-movek-text-secondary">
                            Entrez votre email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>

                    {state.success ? (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <p className="mb-6 text-sm text-movek-text-secondary">
                                Un lien de réinitialisation a été envoyé à votre adresse email.
                                Vérifiez votre boîte de réception.
                            </p>
                            <Link href="/client/login">
                                <Button className="rounded-full bg-movek-orange px-8 font-semibold text-white hover:brightness-110">
                                    Retour à la connexion
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {state.error && (
                                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                                    {state.error}
                                </div>
                            )}

                            <form action={formAction} className="space-y-4">
                                <div>
                                    <Label className="text-movek-text-secondary">Email</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-movek-text-secondary" />
                                        <Input name="email" type="email" required placeholder="votre@email.com"
                                            className="border-movek-border bg-movek-navy pl-10 text-white placeholder:text-movek-text-secondary" />
                                    </div>
                                </div>
                                <SubmitButton />
                            </form>

                            <p className="mt-6 text-center text-sm text-movek-text-secondary">
                                <Link href="/client/login" className="text-movek-orange hover:underline">
                                    ← Retour à la connexion
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
