"use client";

import React from "react";
import { useFormState } from "react-dom";
import { loginAdmin } from "@/app/actions/admin_auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const [state, formAction] = useFormState(loginAdmin, {
        success: false,
        error: null
    });
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <span className="text-4xl font-bold text-white tracking-tight">
                            MOV<span className="text-[#FF6B00]">EK</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Administration</h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Accès réservé au personnel ETREND
                    </p>
                </div>

                <div className="bg-[#0F2040] p-8 rounded-xl border border-[#1E3A5F] shadow-2xl">
                    <form action={formAction} className="space-y-6">
                        {state.error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm text-center font-medium">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email professionnel</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="prenom.nom@etrend-maroc.com"
                                required
                                className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] pr-12 h-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#FF6B00] hover:bg-[#E66000] text-white h-12 text-base font-semibold"
                        >
                            <span className="group-disabled:hidden">SE CONNECTER</span>
                            <span className="hidden group-disabled:flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Connexion...
                            </span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
