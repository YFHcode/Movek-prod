// ============================================================
// MOVEK — TypeScript Type Definitions
// Matches the Supabase PostgreSQL schema exactly
// ============================================================

// ---------- Enums ----------

export type UserRole = "admin" | "client" | "fournisseur";

export type ProductCondition =
    | "neuf"
    | "neuf-ancien"
    | "utilise"
    | "reconditionne";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "quality_check"
    | "invoiced"
    | "shipped"
    | "delivered"
    | "cancelled";

export type IntrouvableStatus =
    | "pending"
    | "in_progress"
    | "resolved"
    | "closed";

export type NotificationType =
    | "new_product"
    | "catalogue"
    | "promotion"
    | "evenement"
    | "commande"
    | "technique";

// ---------- Tables ----------

export interface Profile {
    id: string; // UUID, references auth.users(id)
    role: UserRole;
    created_at: string;
}

export interface Client {
    id: string;
    user_id: string | null;
    nom_prenom: string;
    fonction: string | null;
    entreprise: string;
    adresse: string | null;
    ville: string | null;
    pays: string | null;
    email: string;
    telephone: string | null;
    message: string | null;
    is_approved: boolean;
    created_at: string;
}

export interface Fournisseur {
    id: string;
    user_id: string | null;
    nom_prenom: string;
    fonction: string | null;
    entreprise: string;
    adresse: string | null;
    ville: string | null;
    pays: string | null;
    email: string;
    telephone: string | null;
    message: string | null;
    is_approved: boolean;
    created_at: string;
}

export interface ProductFamily {
    id: string;
    nom: string;
    slug: string;
    ordre: number | null;
    created_by_admin: boolean;
}

export interface ProductSubcategory {
    id: string;
    family_id: string;
    nom: string;
    slug: string;
}

export interface Product {
    id: string;
    fournisseur_id: string;
    article: string;
    designation: string;
    marque: string | null;
    reference: string | null;
    origine: string | null;
    quantite: number | null;
    unite: string | null;
    lieu_expedition: string | null;
    garantie: boolean;
    garantie_mois: number | null;
    etat: ProductCondition | null;
    prix: number | null;
    devise: string;
    family_id: string | null;
    subcategory_id: string | null;
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
}

/**
 * Public-facing product — prix and fournisseur_id are EXCLUDED.
 * Always use this type for non-admin views.
 */
export interface PublicProduct {
    id: string;
    article: string;
    designation: string;
    marque: string | null;
    reference: string | null;
    origine: string | null;
    quantite: number | null;
    unite: string | null;
    lieu_expedition: string | null;
    garantie: boolean;
    garantie_mois: number | null;
    etat: ProductCondition | null;
    family_id: string | null;
    subcategory_id: string | null;
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    image_url: string;
    ordre: number;
}

export interface TechnicalSheet {
    id: string;
    product_id: string;
    file_url: string;
    file_name: string | null;
}

export interface Interest {
    id: string;
    client_id: string;
    product_id: string;
    created_at: string;
    expires_at: string;
    is_deleted: boolean;
}

export interface IntrouvableRequest {
    id: string;
    nom_prenom: string;
    fonction: string | null;
    entreprise: string;
    adresse: string | null;
    pays: string | null;
    email: string;
    telephone: string | null;
    description: string;
    status: IntrouvableStatus;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType | null;
    is_read: boolean;
    created_at: string;
}

export interface Service {
    id: string;
    nom: string;
    slug: string;
    description: string | null;
    is_active: boolean;
}

export interface BlogPost {
    id: string;
    titre: string;
    slug: string;
    contenu: string;
    category: string | null;
    image_url: string | null;
    is_published: boolean;
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
}

export interface TechnicalDocument {
    id: string;
    reference: string | null;
    marque: string | null;
    produit: string | null;
    file_url: string;
    file_name: string | null;
    is_downloadable: boolean;
    created_at: string;
}

export interface Order {
    id: string;
    client_id: string;
    product_id: string;
    statut: OrderStatus;
    notes: string | null;
    created_at: string;
}

// ---------- Extended types with relations ----------

export interface PublicProductWithImages extends PublicProduct {
    product_images: ProductImage[];
    technical_sheets: TechnicalSheet[];
    product_families: Pick<ProductFamily, "nom" | "slug"> | null;
    product_subcategories: Pick<ProductSubcategory, "nom" | "slug"> | null;
}

export interface ProductWithDetails extends Product {
    product_images: ProductImage[];
    technical_sheets: TechnicalSheet[];
    product_families: Pick<ProductFamily, "nom" | "slug"> | null;
    product_subcategories: Pick<ProductSubcategory, "nom" | "slug"> | null;
    fournisseurs: Pick<Fournisseur, "nom_prenom" | "entreprise"> | null;
}

export interface ProductFamilyWithSubcategories extends ProductFamily {
    product_subcategories: ProductSubcategory[];
}

// ---------- Form input types ----------

export interface ClientRegistrationInput {
    nom_prenom: string;
    fonction?: string;
    entreprise: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    email: string;
    telephone?: string;
    message?: string;
    password: string;
}

export interface FournisseurRegistrationInput {
    nom_prenom: string;
    fonction?: string;
    entreprise: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    email: string;
    telephone?: string;
    message?: string;
    password: string;
}

export interface IntrouvableRequestInput {
    nom_prenom: string;
    fonction?: string;
    entreprise: string;
    adresse?: string;
    pays?: string;
    email: string;
    telephone?: string;
    description: string;
}

export interface AddProductInput {
    article: string;
    designation: string;
    marque?: string;
    reference?: string;
    origine?: string;
    quantite?: number;
    unite?: string;
    lieu_expedition?: string;
    garantie: boolean;
    garantie_mois?: number;
    etat: ProductCondition;
    prix?: number;
    devise?: string;
    family_id: string;
    subcategory_id?: string;
}
