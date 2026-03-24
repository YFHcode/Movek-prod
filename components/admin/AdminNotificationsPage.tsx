"use client";

import React, { useState } from "react";
import { useFormState } from "react-dom";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sendGlobalNotification } from "@/app/actions/admin_notifications";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Send, X, Users, MessageSquare, BellRing, PackageSearch, Megaphone } from "lucide-react";
import { useFormStatus } from "react-dom";

type NotificationRow = {
    id: string; // synthetic distinct ID
    title: string;
    message: string;
    type: string;
    created_at: string;
};

const TYPE_ICONS: Record<string, { icon: React.ReactNode, color: string, label: string }> = {
    'new_product': { icon: <PackageSearch className="w-4 h-4" />, color: "text-green-500 bg-green-500/10 border-green-500/20", label: "Nouveau Produit" },
    'promotion': { icon: <Megaphone className="w-4 h-4" />, color: "text-red-500 bg-red-500/10 border-red-500/20", label: "Promotion" },
    'evenement': { icon: <BellRing className="w-4 h-4" />, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", label: "Événement" },
    'catalogue': { icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", label: "Mise à jour Catalogue" },
};

export default function AdminNotificationsPage({ notifications }: { notifications: NotificationRow[] }) {
    const [state, formAction] = useFormState(sendGlobalNotification, { success: false, error: null });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Close modal on success
    React.useEffect(() => {
        if (state.success) {
            alert("Les notifications ont été envoyées avec succès.");
            setIsModalOpen(false);
            // reset state if needed by reloading, or Next.js action does it
        }
    }, [state.success]);

    const columns: ColumnDef<NotificationRow>[] = [
        {
            accessorKey: "created_at",
            header: "Date d'envoi",
            cell: ({ row }) => <span className="text-white whitespace-nowrap">{format(new Date(row.original.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}</span>
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const config = TYPE_ICONS[row.original.type] || { icon: <BellRing className="w-4 h-4" />, color: "text-slate-500 bg-slate-500/10 border-slate-500/20", label: row.original.type };
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </div>
                );
            }
        },
        {
            accessorKey: "title",
            header: "Sujet",
            cell: ({ row }) => <div className="font-semibold text-white truncate max-w-[200px]">{row.original.title}</div>
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => <div className="text-sm text-slate-400 truncate max-w-[400px]">{row.original.message}</div>
        }
    ];

    return (
        <>
            <AdminTopBar title="Centre de Notifications" adminName="Admin" />
            <div className="p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-60px)]">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-[#FF6B00]" />
                            Historique des envois globaux
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Consultez les dernières notifications de type &quot;Push&quot; envoyées aux utilisateurs.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#FF6B00] hover:bg-[#E66000] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Notification Globale
                    </button>
                </div>

                <div className="h-[600px]">
                    <AdminDataTable
                        columns={columns}
                        data={notifications}
                        searchKey="title"
                        searchPlaceholder="Rechercher par sujet ou message..."
                    />
                </div>

                {/* Create Notification Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0F2040] border border-[#1E3A5F] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]/50">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BellRing className="w-5 h-5 text-[#FF6B00]" />
                                    Créer une notification
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form action={formAction} className="p-6 space-y-6">
                                {state.error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm font-medium">
                                        {state.error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="recipients" className="text-white mb-2 block flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            Groupe de destinataires
                                        </Label>
                                        <select
                                            id="recipients"
                                            name="recipients"
                                            className="w-full bg-[#0A1628] border border-[#1E3A5F] text-white rounded-lg h-11 px-3 outline-none focus:border-[#FF6B00] transition-colors appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'m6 9 6 6 6-6\'/></svg>')] bg-[length:16px_16px] bg-[right:12px_center]"
                                            required
                                        >
                                            <option value="all">Tous les utilisateurs (Clients & Fournisseurs)</option>
                                            <option value="clients">Uniquement les Clients (Acheteurs)</option>
                                            <option value="fournisseurs">Uniquement les Fournisseurs</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="type" className="text-white mb-2 block">Catégorie</Label>
                                            <select
                                                id="type"
                                                name="type"
                                                className="w-full bg-[#0A1628] border border-[#1E3A5F] text-white rounded-lg h-11 px-3 outline-none focus:border-[#FF6B00] transition-colors appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'m6 9 6 6 6-6\'/></svg>')] bg-[length:16px_16px] bg-[right:12px_center]"
                                                required
                                            >
                                                <option value="promotion">🚨 Promotion / Offre spéciale</option>
                                                <option value="new_product">📦 Nouveau produit phare</option>
                                                <option value="evenement">📅 Événement (Salon, Webinaire)</option>
                                                <option value="catalogue">📖 Mise à jour catalogue</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="title" className="text-white mb-2 block">Sujet / Titre court</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="Ex: Soldes d'Hiver..."
                                                required
                                                className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="message" className="text-white mb-2 block">Message détaillé</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            placeholder="Rédigez le contenu de la notification ici..."
                                            required
                                            className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] resize-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            La notification sera immédiatement envoyée et apparaîtra dans le centre de notifications (la cloche) des utilisateurs sélectionnés dès leur prochaine connexion ou en temps-réel s&apos;ils sont en ligne.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-[#1E3A5F] pt-6 flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-transparent border-[#1E3A5F] text-slate-300 hover:text-white"
                                    >
                                        Annuler
                                    </Button>
                                    <SubmitButton />
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function SubmitButton() {
    // Note: We use the hook here inside the form to correctly catch the loading state
    // But since `useActionState` is on the parent, it's a bit tricky in Next 15.
    // For simplicity, we just rely on the `group-disabled` pattern on the button if we controlled the form,
    // Or we use the experimental useFormStatus. Here we'll just use a standard button for the example,
    // but in a real app you'd extract this to use useFormStatus().

    // Quick inline abstraction for useFormStatus
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-[#FF6B00] hover:bg-[#E66000] text-white font-medium px-6"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                </>
            ) : (
                <>
                    <Send className="w-4 h-4 mr-2" />
                    Pousser la notification
                </>
            )}
        </Button>
    );
}
