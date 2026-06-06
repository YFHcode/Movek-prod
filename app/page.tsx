import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/marketplace/SearchBar";
import {
  ShoppingCart,
  Store,
  Warehouse,
  Wrench,
  Snowflake,
  Zap,
  Settings,
  Battery,
  Package,
  HardHat,
  Factory,
  Cog,
  MousePointer,
  ShieldCheck,
  Truck,
  ArrowRight,
  Calendar,
  Award,
  Globe,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOVEK — Marketplace Industrielle B2B",
  description:
    "La solution unique pour acheter et vendre vos produits industriels. Opérée par ETREND via le modèle FBE.",
};

// Map family slug to Lucide icon
const familyIcons: Record<string, React.ReactNode> = {
  "froid-et-climatisation": <Snowflake className="h-8 w-8" />,
  electricite: <Zap className="h-8 w-8" />,
  "electromecanique-systeme-entrainement": <Settings className="h-8 w-8" />,
  energie: <Battery className="h-8 w-8" />,
  "manutention-et-levage": <Package className="h-8 w-8" />,
  "engins-chantier-btp": <HardHat className="h-8 w-8" />,
  "machines-industrielles": <Factory className="h-8 w-8" />,
  "industrie-de-transformation": <Cog className="h-8 w-8" />,
  "equipement-atelier": <Wrench className="h-8 w-8" />,
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch product families
  const { data: families } = await supabase
    .from("product_families")
    .select("*, product_subcategories(id)")
    .order("ordre", { ascending: true });

  // Fetch product counts per family
  const { data: productCounts } = await supabase
    .from("products")
    .select("family_id")
    .eq("is_active", true)
    .eq("is_approved", true);

  const countByFamily = (productCounts || []).reduce(
    (acc: Record<string, number>, p: { family_id: string | null }) => {
      if (p.family_id) {
        acc[p.family_id] = (acc[p.family_id] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Fetch blog posts
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <>
      {/* ══════════════ SECTION 1 — HERO ══════════════ */}
      <section className="relative overflow-hidden bg-movek-navy px-4 py-20 sm:py-28">
        {/* Industrial grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,107,0,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,107,0,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Faint machinery silhouette overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Crect x='50' y='100' width='60' height='100' fill='%23FF6B00'/%3E%3Crect x='120' y='60' width='40' height='140' fill='%23FF6B00'/%3E%3Crect x='200' y='80' width='80' height='120' fill='%23FF6B00'/%3E%3Ccircle cx='240' cy='60' r='30' fill='%23FF6B00'/%3E%3Crect x='350' y='120' width='100' height='80' fill='%23FF6B00'/%3E%3Crect x='500' y='90' width='50' height='110' fill='%23FF6B00'/%3E%3Crect x='600' y='50' width='30' height='150' fill='%23FF6B00'/%3E%3Crect x='700' y='100' width='90' height='100' fill='%23FF6B00'/%3E%3Crect x='850' y='70' width='60' height='130' fill='%23FF6B00'/%3E%3Crect x='950' y='110' width='70' height='90' fill='%23FF6B00'/%3E%3Crect x='1050' y='80' width='50' height='120' fill='%23FF6B00'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom",
          }}
        />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
            LA SOLUTION UNIQUE POUR ACHETER
            <br />
            ET VENDRE VOS{" "}
            <span className="text-movek-orange">PRODUITS INDUSTRIELS</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-movek-text-secondary">
            Moins de recherche. Plus d&apos;efficacité. Plus de confiance.
          </p>

          {/* Search bar */}
          <div className="mt-10 w-full flex justify-center">
            <SearchBar />
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/produits">
              <Button className="rounded-full bg-movek-orange px-12 py-6 text-lg font-bold text-white hover:brightness-110 transition-all">
                <ShoppingCart className="mr-2 h-5 w-5" />
                ACHETER
              </Button>
            </Link>
            <Link href="/fournisseur/register">
              <Button className="rounded-full bg-movek-orange px-12 py-6 text-lg font-bold text-white hover:brightness-110 transition-all">
                <Store className="mr-2 h-5 w-5" />
                VENDRE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 2 — STATS BAR ══════════════ */}
      <section className="border-y border-movek-border bg-movek-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 lg:grid-cols-4">
          {[
            {
              icon: <Calendar className="h-6 w-6 text-movek-orange" />,
              value: "Depuis 2007",
              label: "Expérience industrielle",
            },
            {
              icon: <Package className="h-6 w-6 text-movek-orange" />,
              value: "9 Familles",
              label: "De produits industriels",
            },
            {
              icon: <Award className="h-6 w-6 text-movek-orange" />,
              value: "FBE Garanti",
              label: "Fulfilled By ETREND",
            },
            {
              icon: <Globe className="h-6 w-6 text-movek-orange" />,
              value: "Maroc & International",
              label: "Expédition mondiale",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-6 py-6 ${i < 3 ? "border-r border-movek-border" : ""
                } ${i < 2 ? "border-b border-movek-border lg:border-b-0" : ""}`}
            >
              {stat.icon}
              <div>
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-xs text-movek-text-secondary">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ SECTION 3 — STRATEGIC POLES ══════════════ */}
      <section className="bg-movek-navy px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            POURQUOI CHOISIR{" "}
            <span className="text-movek-orange">MOVEK</span> ?
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                icon: <ShoppingCart className="h-8 w-8 text-movek-orange" />,
                title: "ACHETER",
                text: "Produits neufs, reconditionnés, rares ou introuvables. Réduction du temps, centralisation des achats, maîtrisés de la sélection à la livraison.",
                link: "/produits",
                linkText: "Explorer les produits",
              },
              {
                icon: <Store className="h-8 w-8 text-movek-orange" />,
                title: "VENDRE",
                text: "Surplus de production, stocks dormants, produits obsolètes. Création de valeur, transformation des stocks inutilisés en cash.",
                link: "/fournisseur/register",
                linkText: "Devenir fournisseur",
              },
              {
                icon: <Warehouse className="h-8 w-8 text-movek-orange" />,
                title: "DÉSTOCKAGE MATÉRIEL",
                text: "Liquidation d'usines, arrêt d'activité, matériel d'occasion contrôlé. Vos produits obsolètes méritent une seconde vie.",
                link: "/contact",
                linkText: "En savoir plus",
              },
              {
                icon: <Wrench className="h-8 w-8 text-movek-orange" />,
                title: "SERVICES",
                text: "Contrôle de conformité, analyse des pannes, possibilité de mise en service, maintenance SAV. Garantie de performance à chaque étape.",
                link: "/services",
                linkText: "Voir les services",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-xl border border-movek-border bg-movek-card p-6 transition-all hover:border-movek-orange"
              >
                <div className="mb-4">{card.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {card.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-movek-text-secondary">
                  {card.text}
                </p>
                <Link
                  href={card.link}
                  className="inline-flex items-center text-sm font-semibold text-movek-orange transition-all group-hover:gap-2"
                >
                  {card.linkText}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 4 — PRODUCT FAMILIES ══════════════ */}
      <section className="bg-movek-navy px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            NOS FAMILLES DE <span className="text-movek-orange">PRODUITS</span>
          </h2>
          <p className="mb-12 text-center text-movek-text-secondary">
            Explorez notre catalogue industriel complet
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(families || []).map((family) => (
              <Link
                key={family.id}
                href={`/produits?famille=${family.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-movek-border bg-movek-card p-5 transition-all hover:border-movek-orange"
              >
                <div className="text-movek-orange">
                  {familyIcons[family.slug] || (
                    <Settings className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{family.nom}</h3>
                  <p className="text-xs text-movek-text-secondary">
                    ({countByFamily[family.id] || 0} produits)
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-movek-text-secondary opacity-0 transition-all group-hover:opacity-100 group-hover:text-movek-orange" />
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/produits">
              <Button className="rounded-full bg-movek-orange px-10 py-5 font-bold text-white hover:brightness-110 transition-all">
                VOIR TOUS LES PRODUITS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 5 — FBE TRUST ══════════════ */}
      <section className="bg-[#0C1D35] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            LE MODÈLE <span className="text-movek-orange">FBE</span>
          </h2>
          <p className="mb-14 text-center text-movek-text-secondary">
            Fulfilled By ETREND — Votre partenaire industriel depuis 2007
          </p>

          <div className="relative flex flex-col items-center gap-8 md:flex-row md:gap-0">
            {/* Dashed connector line (desktop only) */}
            <div className="absolute left-[16.67%] right-[16.67%] top-12 hidden h-[2px] border-t-2 border-dashed border-movek-orange/40 md:block" />

            {[
              {
                icon: <MousePointer className="h-6 w-6 text-white" />,
                title: "Vous trouvez",
                text: "Recherchez parmi nos produits industriels disponibles",
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-white" />,
                title: "ETREND vérifie",
                text: "Contrôle qualité, validation technique et confirmation",
              },
              {
                icon: <Truck className="h-6 w-6 text-white" />,
                title: "Livraison garantie",
                text: "Expédition sécurisée, suivi complet et SAV",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-movek-orange">
                  {step.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-white">
                  {step.title}
                </h3>
                <p className="max-w-[200px] text-xs text-movek-text-secondary">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/introuvable">
              <Button className="rounded-full bg-movek-orange px-10 py-5 font-bold text-white hover:brightness-110 transition-all">
                SOUMETTRE UNE DEMANDE INTROUVABLE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 6 — INTROUVABLE BANNER ══════════════ */}
      <section className="bg-movek-orange px-4 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h3 className="text-xl font-bold text-[#0A1628]">
              Vous ne trouvez pas votre pièce industrielle ?
            </h3>
            <p className="mt-1 text-sm text-[#0A1628]/80">
              Soumettez votre demande — Notre équipe d&apos;experts la trouve
              pour vous sous 24h.
            </p>
          </div>
          <Link href="/introuvable">
            <Button className="rounded-full bg-white px-8 py-5 font-bold text-[#0A1628] hover:bg-gray-100 transition-all whitespace-nowrap">
              JE SOUMETS MA DEMANDE
            </Button>
          </Link>
        </div>
      </section>

      {/* ══════════════ SECTION 7 — BLOG (conditional) ══════════════ */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="bg-movek-navy px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-2 text-center text-3xl font-bold text-white">
              BLOG TECHNIQUE{" "}
              <span className="text-movek-orange">MOVEK</span>
            </h2>
            <p className="mb-12 text-center text-movek-text-secondary">
              Expertise, conseils et actualités du secteur industriel
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-movek-border bg-movek-card transition-all hover:border-movek-orange"
                >
                  <div className="aspect-video bg-movek-navy" />
                  <div className="p-5">
                    {post.category && (
                      <span className="mb-2 inline-block rounded-full bg-movek-orange/20 px-3 py-1 text-xs font-semibold text-movek-orange">
                        {post.category}
                      </span>
                    )}
                    <h3 className="mb-2 line-clamp-2 text-sm font-bold text-white">
                      {post.titre}
                    </h3>
                    <p className="mb-3 line-clamp-3 text-xs text-movek-text-secondary">
                      {post.contenu.substring(0, 150)}...
                    </p>
                    <p className="text-xs text-movek-text-secondary">
                      {new Date(post.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <span className="mt-2 inline-flex items-center text-xs font-semibold text-movek-orange">
                      Lire l&apos;article
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="rounded-full border-movek-orange px-8 text-movek-orange hover:bg-movek-orange hover:text-white transition-all"
                >
                  VOIR TOUS LES ARTICLES
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
