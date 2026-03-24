"use client";

import React, { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateBlogPost, deleteBlogPost } from "@/app/actions/admin_blog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, PenSquare, Trash2, X, FileText, Globe } from "lucide-react";
import { useFormStatus } from "react-dom";

type BlogPostRow = {
    id: string;
    title: string;
    slug: string;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

export default function AdminBlogPage({ posts }: { posts: BlogPostRow[] }) {
    const [state, formAction] = useFormState(updateBlogPost, { success: false, error: null });
    const [isPending, startTransition] = useTransition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPostRow | null>(null);

    // Close modal on success
    React.useEffect(() => {
        if (state.success) {
            setIsModalOpen(false);
            setEditingPost(null);
            // State resets automatically on revalidatePath
        }
    }, [state.success]);

    const handleOpenCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (post: BlogPostRow) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${title}" ? Cette action est irréversible.`)) {
            startTransition(async () => {
                const result = await deleteBlogPost(id);
                if (!result.success && result.error) {
                    alert(result.error);
                }
            });
        }
    };

    const columns: ColumnDef<BlogPostRow>[] = [
        {
            accessorKey: "title",
            header: "Titre",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-white max-w-[300px] truncate" title={row.original.title}>{row.original.title}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">/{row.original.slug}</div>
                </div>
            )
        },
        {
            accessorKey: "is_published",
            header: "Statut",
            cell: ({ row }) => {
                const isPublished = row.original.is_published;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isPublished
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                        {isPublished ? <Globe className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        {isPublished ? "Publié" : "Brouillon"}
                    </div>
                );
            }
        },
        {
            accessorKey: "updated_at",
            header: "Dernière modification",
            cell: ({ row }) => <span className="text-slate-300 whitespace-nowrap">{format(new Date(row.original.updated_at || row.original.created_at), "dd MMM yyyy", { locale: fr })}</span>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const post = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {/* Future: link to preview
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors" title="Voir l'article">
                            <Eye className="w-4 h-4" />
                        </a>
                        */}
                        <button
                            onClick={() => handleOpenEdit(post)}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors border border-blue-500/20"
                            title="Modifier"
                        >
                            <PenSquare className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={isPending}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors border border-red-500/20 disabled:opacity-50"
                            title="Supprimer"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <AdminTopBar title="Blog & Actualités" adminName="Admin" />
            <div className="p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-60px)]">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#FF6B00]" />
                            Gestion des Articles
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Créez et modifiez les actualités visibles sur la plateforme MOVEK.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="bg-[#FF6B00] hover:bg-[#E66000] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel Article
                    </button>
                </div>

                <div className="h-[600px]">
                    <AdminDataTable
                        columns={columns}
                        data={posts}
                        searchKey="title"
                        searchPlaceholder="Rechercher par titre..."
                    />
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0F2040] border border-[#1E3A5F] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]/50 shrink-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <PenSquare className="w-5 h-5 text-[#FF6B00]" />
                                    {editingPost ? "Modifier l'article" : "Rédiger un nouvel article"}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form action={formAction} className="space-y-6" id="blog-form">
                                    {/* Edit ID Pass */}
                                    {editingPost && <input type="hidden" name="id" value={editingPost.id} />}

                                    {state.error && (
                                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm font-medium">
                                            {state.error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="title" className="text-white mb-2 block">Titre de l&apos;article *</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                defaultValue={editingPost?.title}
                                                placeholder="Ex: Lancement de la nouvelle version..."
                                                required
                                                className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00]"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug" className="text-white mb-2 block flex items-center gap-1">
                                                Lien URL (Slug)
                                                <span className="text-xs text-slate-500 font-normal ml-1">(généré auto. si vide)</span>
                                            </Label>
                                            <Input
                                                id="slug"
                                                name="slug"
                                                defaultValue={editingPost?.slug}
                                                placeholder="ex: lancement-nouvelle-version"
                                                className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] font-mono text-sm"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">L&apos;URL sera: movek.ma/blog/<strong className="text-slate-400">votre-slug</strong></p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="content" className="text-white">Contenu (Format Markdown) *</Label>
                                            <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF6B00] hover:underline">Guide Markdown</a>
                                        </div>
                                        <Textarea
                                            id="content"
                                            name="content"
                                            defaultValue={editingPost?.content}
                                            rows={15}
                                            placeholder="# Titre 1&#10;&#10;Votre contenu ici...&#10;&#10;**Gras**, *Italique*, [Lien](https://...)"
                                            required
                                            className="bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] font-mono text-sm resize-y"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 bg-[#0A1628] border border-[#1E3A5F] p-4 rounded-lg">
                                        <div className="relative flex items-center h-5">
                                            <input
                                                id="is_published"
                                                name="is_published"
                                                type="checkbox"
                                                defaultChecked={editingPost ? editingPost.is_published : false}
                                                className="w-5 h-5 rounded border-[#1E3A5F] text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-[#0A1628] bg-transparent"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <Label htmlFor="is_published" className="font-medium text-white block cursor-pointer">
                                                Publier immédiatement
                                            </Label>
                                            <p className="text-slate-400 mt-0.5">
                                                Si décoché, l&apos;article sera enregistré comme brouillon invisible pour les utilisateurs.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-[#1E3A5F] flex justify-end gap-3 bg-[#0F2040] shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-transparent border-[#1E3A5F] text-slate-300 hover:text-white"
                                >
                                    Annuler
                                </Button>
                                <SubmitButton isEdit={!!editingPost} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            form="blog-form"
            disabled={pending}
            className="bg-[#FF6B00] hover:bg-[#E66000] text-white font-medium px-6"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                </>
            ) : (
                <>
                    {isEdit ? <PenSquare className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isEdit ? "Mettre à jour" : "Créer l'article"}
                </>
            )}
        </Button>
    );
}
