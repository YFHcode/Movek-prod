import { notFound } from "next/navigation";
import Link from "next/link";
import { getLegalPageBySlug, getAllLegalSlugs } from "@/lib/legal/content";
import type { Metadata } from "next";

interface LegalPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllLegalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: LegalPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = getLegalPageBySlug(slug);
    if (!page) return { title: "Page non trouvée" };

    return {
        title: page.title,
        description: `${page.title} — MOVEK Marketplace Industrielle B2B`,
    };
}

export default async function LegalPage({ params }: LegalPageProps) {
    const { slug } = await params;
    const page = getLegalPageBySlug(slug);

    if (!page) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-movek-text-secondary">
                <Link href="/" className="hover:text-movek-orange">
                    Accueil
                </Link>
                <span className="mx-2">/</span>
                <span className="text-white">{page.title}</span>
            </nav>

            <h1 className="mb-8 text-3xl font-bold text-white">{page.title}</h1>

            {/* Rendered markdown content */}
            <div
                className="prose prose-invert max-w-none 
          prose-headings:text-white prose-headings:font-bold prose-headings:border-none
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-movek-text-secondary prose-p:leading-relaxed
          prose-li:text-movek-text-secondary
          prose-strong:text-white
          prose-ul:list-disc prose-ul:pl-6
          prose-ol:list-decimal prose-ol:pl-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
            />

            {/* Back link */}
            <div className="mt-12 border-t border-movek-border pt-6">
                <Link
                    href="/"
                    className="text-sm text-movek-orange hover:underline"
                >
                    ← Retour à l&apos;accueil
                </Link>
            </div>
        </div>
    );
}

// Simple markdown to HTML renderer (no external dependency needed)
function renderMarkdown(content: string): string {
    return content
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
        .replace(/^(?!<[hulo])((?!<).+)$/gm, "<p>$1</p>")
        .replace(/<p><\/p>/g, "")
        .trim();
}
