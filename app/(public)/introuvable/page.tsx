"use client";

import { useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Clock, Settings, ShieldCheck } from "lucide-react";
import { submitIntrouvableRequest } from "@/app/actions/introuvable";
import { useToast } from "@/hooks/use-toast";

const initialState = { success: false, error: null as string | null };

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
                    Envoi...
                </>
            ) : (
                "ENVOYER MA DEMANDE"
            )}
        </Button>
    );
}

export default function IntrouvablePage() {
    const [state, formAction] = useFormState(
        submitIntrouvableRequest,
        initialState
    );
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
        if (state.error) {
            toast({ variant: "destructive", description: state.error });
        }
    }, [state, toast]);

    return (
        <>
            {/* Hero Banner */}
            <section className="border-l-4 border-movek-orange bg-movek-card px-4 py-12 sm:border-l-0 sm:border-t-4">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Vous ne trouvez pas votre pièce ?
                    </h1>
                    <p className="mt-2 text-movek-text-secondary">
                        Soumettez votre demande — Notre équipe d&apos;experts la trouve pour
                        vous.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="bg-movek-navy px-4 py-12">
                <div className="mx-auto max-w-[800px]">
                    {state.success ? (
                        <div className="rounded-xl border border-movek-success/30 bg-movek-card p-8 text-center">
                            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-movek-success" />
                            <h2 className="mb-2 text-xl font-bold text-white">
                                Votre demande a bien été envoyée !
                            </h2>
                            <p className="text-movek-text-secondary">
                                Notre équipe vous contactera dans les plus brefs délais.
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="mt-6 rounded-full bg-movek-orange font-semibold text-white hover:brightness-110"
                            >
                                Soumettre une autre demande
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-movek-border bg-movek-card p-6 sm:p-8">
                            <h2 className="mb-6 text-lg font-bold text-white">
                                Formulaire de demande de recherche de produit
                            </h2>

                            <form ref={formRef} action={formAction} className="space-y-4">
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="nom_prenom" className="text-movek-text-secondary">
                                            Nom et Prénom *
                                        </Label>
                                        <Input
                                            id="nom_prenom"
                                            name="nom_prenom"
                                            required
                                            minLength={2}
                                            placeholder="Votre nom complet"
                                            className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="fonction" className="text-movek-text-secondary">
                                            Fonction
                                        </Label>
                                        <Input
                                            id="fonction"
                                            name="fonction"
                                            placeholder="Votre fonction"
                                            className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                        />
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="entreprise" className="text-movek-text-secondary">
                                            Entreprise *
                                        </Label>
                                        <Input
                                            id="entreprise"
                                            name="entreprise"
                                            required
                                            minLength={2}
                                            placeholder="Nom de votre entreprise"
                                            className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="adresse" className="text-movek-text-secondary">
                                            Adresse
                                        </Label>
                                        <Input
                                            id="adresse"
                                            name="adresse"
                                            placeholder="Votre adresse"
                                            className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="pays" className="text-movek-text-secondary">
                                            Pays
                                        </Label>
                                        <select
                                            id="pays"
                                            name="pays"
                                            className="mt-1 w-full rounded-md border border-movek-border bg-movek-navy px-3 py-2 text-sm text-white"
                                        >
                                            <option value="">Sélectionnez un pays</option>
                                            <option value="Maroc">Maroc</option>
                                            <option value="France">France</option>
                                            <option value="Algérie">Algérie</option>
                                            <option value="Tunisie">Tunisie</option>
                                            <option value="Espagne">Espagne</option>
                                            <option value="Belgique">Belgique</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Sénégal">Sénégal</option>
                                            <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="telephone" className="text-movek-text-secondary">
                                            Téléphone
                                        </Label>
                                        <Input
                                            id="telephone"
                                            name="telephone"
                                            placeholder="+212 600 000 000"
                                            className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                        />
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div>
                                    <Label htmlFor="email" className="text-movek-text-secondary">
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="votre@email.com"
                                        className="mt-1 border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                    />
                                </div>

                                {/* Row 5 */}
                                <div>
                                    <Label htmlFor="description" className="text-movek-text-secondary">
                                        Description du besoin *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        required
                                        minLength={20}
                                        placeholder="Décrivez votre besoin (Article, Désignation, Marque, Référence, Quantité...)"
                                        className="mt-1 min-h-[150px] border-movek-border bg-movek-navy text-white placeholder:text-movek-text-secondary"
                                    />
                                </div>

                                <SubmitButton />
                            </form>
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="bg-movek-navy px-4 pb-20 pt-8">
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
                    {[
                        {
                            icon: <Clock className="h-8 w-8 text-movek-orange" />,
                            title: "RÉPONSE RAPIDE",
                            text: "Notre équipe vous répond dans les plus brefs délais",
                        },
                        {
                            icon: <Settings className="h-8 w-8 text-movek-orange" />,
                            title: "EXPERTISE DEPUIS 2007",
                            text: "Plus de 17 ans d'expérience dans le domaine industriel",
                        },
                        {
                            icon: <ShieldCheck className="h-8 w-8 text-movek-orange" />,
                            title: "QUALITÉ GARANTIE FBE",
                            text: "Vente et garantie assurées exclusivement par ETREND",
                        },
                    ].map((badge) => (
                        <div
                            key={badge.title}
                            className="rounded-xl border border-movek-border bg-movek-card p-6 text-center"
                        >
                            <div className="mb-3 flex justify-center">{badge.icon}</div>
                            <h3 className="mb-2 text-sm font-bold text-white">{badge.title}</h3>
                            <p className="text-xs text-movek-text-secondary">{badge.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
