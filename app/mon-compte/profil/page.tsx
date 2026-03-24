import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mon Profil",
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: client } = await supabase
        .from("clients")
        .select("nom_prenom, fonction, entreprise, adresse, ville, pays, email, telephone, created_at")
        .eq("user_id", user!.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Mon Profil</h1>
                <p className="text-sm text-movek-text-secondary">
                    Gérez vos informations professionnelles
                </p>
            </div>

            {client && <ProfileClient client={client} />}
        </div>
    );
}
