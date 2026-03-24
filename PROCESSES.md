# MOVEK — Documentation des Processus
## Plateforme B2B Industrielle | FBE by ETREND

**Version:** 1.0  
**Date:** 4 Mars 2026  
**Projet:** MOVEK — FBE by ETREND  
**Stack:** Next.js 14 + Supabase + Resend + Vercel  

---

## Table des Matières
- [1. Architecture Générale](#1-architecture-générale)
- [2. Processus d'Authentification](#2-processus-dauthentification)
- [3. Processus Client (Acheteur)](#3-processus-client-acheteur)
- [4. Processus Fournisseur (Vendeur)](#4-processus-fournisseur-vendeur)
- [5. Processus Produits](#5-processus-produits)
- [6. Processus Commandes](#6-processus-commandes)
- [7. Processus Notifications](#7-processus-notifications)
- [8. Processus Email (Resend)](#8-processus-email-resend)
- [9. Processus Admin (Back-office)](#9-processus-admin-back-office)
- [10. Processus Fichiers & Storage](#10-processus-fichiers--storage)
- [11. Sécurité & Permissions](#11-sécurité--permissions)
- [12. Flux de Données (RLS)](#12-flux-de-données-rls)

---

## 1. Architecture Générale
La plateforme MOVEK est une marketplace B2B industrielle divisée en trois espaces distincts :
- **Espace Public** : Découverte du catalogue anonymisée (sans prix ni identité des vendeurs).
- **Espaces Utilisateurs (Client & Fournisseur)** : Portails dédiés après authentification et approbation de l'administrateur. Différenciés par des rôles stricts et de grandes barrières de sécurité (Row Level Security).
- **Espace Admin** : Back-office complet pour la modération, la gestion des workflows, et le "sourcing" de la marketplace.

---

## 2. Processus d'Authentification

### 2.1 Inscription Client
**Déclencheur:** Le visiteur soumet le formulaire `/client/register`  
**Acteur:** Client

**Étapes:**
1. Validation des champs du formulaire.
2. Exécution de `signUp()`.
3. Le trigger PostgreSQL crée automatiquement la ligne profil (rôle `client`).
4. Insertion des données métier en base avec le statut `is_approved = false`.
5. Envoi des 2 emails de confirmation (alertes admin + client).
6. Redirection vers une page de succès explicative.

**Emails envoyés:**
- To: Admin | Subject: "🔔 Nouvel Acheteur Inscrit" | Trigger: Succès de l'insertion DB
- To: Client | Subject: "Bienvenue sur MOVEK" | Trigger: Automatique via Resend dans le Server Action

**Tables affectées:**
- `auth.users` → INSERT
- `profiles` → INSERT (via Trigger)
- `clients` → INSERT

**Résultat attendu:**
L'utilisateur est créé mais placé en file d'attente d'approbation.

**Cas d'erreur:**
- *Email déjà utilisé* → Message d'erreur clair "Compte existant".
- *Échec Base de données* → Action annulée élégamment.

### 2.2 Connexion Client
**Déclencheur:** L'utilisateur soumet `/client/login`  
**Acteur:** Client

**Étapes:**
1. Validation `signInWithPassword()`.
2. Vérification rigoureuse `role = 'client'`.
3. Vérification du statut de validation `is_approved`.
4. Si `true`, redirection vers `/mon-compte`. Sinon, redirection vers une page d'attente.

**Tables affectées:**
- `profiles` → READ
- `clients` → READ

**Résultat attendu:**
Session initialisée et route sécurisée autorisée.

**Cas d'erreur:**
- *Identifiants erronés* → Avertissement UI.
- *Compte non approuvé/désactivé* → Blocage d'accès au dashboard.

### 2.3 Inscription Fournisseur
**Déclencheur:** Soumission de `/fournisseur/register`  
**Acteur:** Fournisseur

*(Processus rigoureusement similaire à 2.1, orienté Vendeur)*

**Tables affectées:**
- `auth.users` → INSERT
- `profiles` → INSERT (`role = 'fournisseur'`)
- `fournisseurs` → INSERT

**Emails envoyés:**
- To: Admin | Subject: "🔔 Nouveau Fournisseur Inscrit"
- To: Fournisseur | Subject: "Bienvenue — Espace Fournisseur"

### 2.4 Connexion Fournisseur
**Déclencheur:** Soumission de `/fournisseur/login`  
**Acteur:** Fournisseur

*(Processus similaire à 2.2, vérifie le rôle `fournisseur` et redirige vers `/espace-fournisseur`)*

### 2.5 Réinitialisation mot de passe
**Déclencheur:** Clic sur "Mot de passe oublié"  
**Acteur:** Client / Fournisseur

**Étapes:**
1. L'utilisateur saisit son email (`resetPasswordForEmail()`).
2. Supabase envoie un email contenant un lien sécurisé.
3. L'utilisateur accède au formulaire de mise à jour.
4. Validation via `updateUser({ password: newPassword })`.

**Résultat attendu:** L'utilisateur modifie son accès et recouvre son profil.

### 2.6 Déconnexion
**Déclencheur:** Clic sur le bouton de Déconnexion  
**Acteur:** Tout utilisateur connecté

**Étapes:**
1. Appel à `supabase.auth.signOut()`.
2. Redirection immédiate vers `/` (Accueil public).

---

## 3. Processus Client (Acheteur)

### 3.1 Recherche de produits
**Déclencheur:** Le client saisit un terme dans la barre de recherche  
**Acteur:** Client

**Étapes:**
1. Les paramètres d'URL sont mis à jour (URL state).
2. Requête en Full-Text Search (FTS) sur la vue `public_products` de Supabase.
3. Les résultats conditionnés sont affichés en temps réel avec la pagination.

**Tables affectées:**
- `public_products` (Vue) → READ

**Résultat attendu:** Moteur de recherche rapide et efficace excluant les brouillons.

### 3.2 Filtrage des produits
**Déclencheur:** Le client applique un ou plusieurs filtres (Catégorie, Marque...)  
**Acteur:** Client

**Étapes:**
1. L'état du filtre modifie les Query Params.
2. Supabase combine les clauses `.eq()`, `.in()`, et la recherche texte.
3. Les produits mis à jour s'affichent instantanément.

**Tables affectées:**
- `public_products` (Vue) → READ

**Filtres gérés:** Famille, Sous-catégorie, Condition (Neuf, etc.), Marque, Référence, Garantie.

### 3.3 Marquer un produit "Intéressé"
**Déclencheur:** Le client clique sur "Je suis intéressé" depuis la fiche produit  
**Acteur:** Client

**Étapes:**
1. Vérification de session active et que le rôle est `client`.
2. Vérification d'unicité (pour ne pas insérer de doublons).
3. Insertion dans la base avec expiration à `NOW() + 7 days`.
4. Toast de succès affiché au client.

**Tables affectées:**
- `interests` → INSERT (On Conflict Ignore)

**Résultat attendu:** Le produit est ajouté au dashboard client et le fournisseur est implicitement informé.

**Cas d'erreur:**
- *Non connecté* → Redirection login.
- *Déjà intéressé* → Toast informatif.

### 3.4 Retirer un intérêt
**Déclencheur:** Le client clique sur "Retirer" dans son espace personnel  
**Acteur:** Client

**Étapes:**
1. Mise à jour Optimistic UI (disparaît immédiatement pour le client).
2. Action Serveur exécute `UPDATE interests SET is_deleted = true`.

**Tables affectées:**
- `interests` → UPDATE

### 3.5 Soumettre une demande "Introuvable"
**Déclencheur:** Le client soumet le formulaire `/introuvable`  
**Acteur:** Client

**Étapes:**
1. Validation Zod/Form-Data côté client et serveur.
2. Vérification Rate-Limiting IP / Email (Anti-Spam : 3 essais par heure).
3. Insertion de la demande dans la DB.
4. Envoi asynchrone d'une alerte email sécurisée à l'Admin.
5. État de succès restitué à l'interface.

**Emails envoyés:**
- To: Admin | Subject: "[MOVEK] Nouvelle demande introuvable" | Trigger: Succès DB.

**Tables affectées:**
- `introuvable_requests` → INSERT

**Cas d'erreur:** Rate-limit dépassé (affichage message d'erreur et blocage).

### 3.6 Consulter ses intérêts
**Déclencheur:** Visite de `/mon-compte/interesses`  
**Acteur:** Client

**Étapes:**
1. Requête sécurisée par RLS : `JOIN` entre `interests` et `public_products`.
2. Filtre fort : `is_deleted = false AND expires_at > NOW()`.

**Tables affectées:** `interests`, `public_products` → READ

### 3.7 Consulter ses commandes
**Déclencheur:** Visite de `/mon-compte/commandes`  
**Acteur:** Client

**Étapes:**
1. Fetch des commandes liées au `client_id` actuel protégé par RLS.
2. Affichage avec badges couleurs par statut.

**Tables affectées:** `orders` → READ

### 3.8 Mettre à jour son profil
**Déclencheur:** Soumission du profil éditable  
**Acteur:** Client

**Étapes:**
1. Validation des champs modifiés.
2. `UPDATE clients` pour la ligne appartenant à l'utilisateur.

**Tables affectées:** `clients` → UPDATE

### 3.9 Expiration automatique des intérêts
**Déclencheur:** Tâche planifiée `pg_cron` chaque nuit/heure  
**Acteur:** Système (Automatique)

**Étapes:**
1. La base PostgreSQL supprime d'elle-même les lignes de la table.
`DELETE FROM interests WHERE expires_at < NOW() AND is_deleted = false`

**Tables affectées:** `interests` → DELETE

---

## 4. Processus Fournisseur (Vendeur)

### 4.1 Soumettre un produit
**Déclencheur:** Soumission du formulaire Ajouter un Produit  
**Acteur:** Fournisseur

**Étapes:**
1. Validation rigoureuse du formulaire Serveur + Client.
2. Upload asynchrone des médias vers Supabase Storage (`product-images`). Pathway: `fournisseur_id/product_id/[timestamp]_[filename]`.
3. Upload asynchrone du document technique PDF (Optionnel) vers `technical-sheets`.
4. Insertion base de données du Parent : `products` en forçant l'anonymisation temporaire `is_approved = false`.
5. Insertions séquentielles des rows `product_images` et `technical_sheets` associées.
6. Envoi de la notification Email aux Modérateurs (Admins).
7. Redirection utilisateur avec Message de Succès.

**Emails envoyés:**
- To: Admin | Subject: "🔔 Nouveau Produit en Attente"

**Tables affectées:**
- `products`, `product_images`, `technical_sheets` → INSERT

**Cas d'erreur:**
- Échec de l'upload d'un fichier annule élégamment l'opération sans orpheliner des données SQL.

### 4.2 Modifier un produit
**Déclencheur:** Édition et soumission via le Dashboard Vendeur  
**Acteur:** Fournisseur

**Étapes:**
1. Validation Propriété absolue (`fournisseur_id === user.id`).
2. Calcul des deltas sur les fichiers annexes (Suppression Storage/DB des images enlevées, Upload des nouvelles).
3. Substitution de la Fiche Document technique le cas échéant.
4. Mise à jour de la table `products`.
5. **Critique** : Réinitialisation forcée de `is_approved = false` — Le produit disparaît publiquement de la marketplace instantanément jusqu'à re-validation.
6. Alerte Admin envoyée.

**Emails envoyés:**
- To: Admin | Subject: "🔔 Nouveau Produit en Attente" (Re-validation requise)

**Tables affectées:**
- `products`, `technical_sheets` → UPDATE
- `product_images` → INSERT/DELETE

### 4.3 Supprimer un produit
**Déclencheur:** Clic "Supprimer" et Validation par Confirmation Modale  
**Acteur:** Fournisseur

**Étapes:**
1. Vérification d'identité RLS du produit concerné.
2. Suppression par cascade DB prioritaire (`interests`, `product_images`, `technical_sheets`).
3. Appels de Destructions des Fichiers vers l'API Supabase Storage.
4. Suppression définitive du parent sur `products`.

**Tables affectées:**
- `interests`, `products`, `product_images`, `technical_sheets` → DELETE
- Storage Buckets → DELETE FILES

### 4.4 Consulter ses statistiques
**Déclencheur:** Accès à la Home `/espace-fournisseur`  
**Acteur:** Fournisseur

**Étapes:**
1. Requêtes analytiques avec agrégations `COUNT()`.
2. Calcul des totaux par statuts : `total`, `is_approved=true`, `is_approved=false`.
3. Comptabilisation des `interests` captés sur son inventaire de produits.

**Tables affectées:** `products`, `interests` → READ

---

## 5. Processus Produits

### 5.1 Cycle de vie d'un produit

```text
Fournisseur soumet produit
           ↓
   is_approved = false
    is_active = true
[INVISIBLE sur marketplace]
           ↓
   Admin reçoit email
           ↓
 Admin examine le produit
       ↙       ↘
   APPROUVE    REJETTE
      ↓            ↓
is_approved  is_approved = false
   = true     is_active = false
  [VISIBLE]   Email fournisseur
      ↓        avec motif rejet
 Fournisseur       ↓
 reçoit email   Fournisseur
 "En ligne"     corrige et
      ↓         resoumet → Repart au début du cycle
  Si modifié:
  is_approved
 = false again
  [INVISIBLE]
      ↓
 Admin re-valide
```

### 5.2 Approbation d'un produit
**Déclencheur:** L'admin clique sur le toggle "Approuver"  
**Acteur:** Admin

**Étapes:**
1. Validation de sécurité stricte `verifyAdmin()`.
2. Exécution `UPDATE products SET is_approved = true`.
3. Notification Email non-bloquante déclenchée via `lib/mailer.ts`.
4. Signalisation côté interface par revalidation du cache en direct (Next.js Path Revalidation).

**Emails envoyés:**
- To: Fournisseur | Subject: "Votre produit est en ligne !"

**Tables affectées:** `products` → UPDATE

### 5.3 Rejet d'un produit
**Déclencheur:** L'admin soumet la modale "Refuser le produit" en motivant le rejet  
**Acteur:** Admin

**Étapes:**
1. Contrôle administrateur.
2. Analyse de présence du motif textuel obligatoire.
3. Requête DB de désactivation (`is_approved = false`, `is_active = false`).
4. Notification Email avec template d'accentuation (Boîte orange incluant la note Admin directe).

**Emails envoyés:**
- To: Fournisseur | Subject: "Produit refusé : Action requise" (Inclus Feedback Admin)

**Tables affectées:** `products` → UPDATE

### 5.4 Visibilité publique d'un produit
*Règles strictes régissant l'affichage sur le portail `/produits` grâce à la Vue Limitée `public_products`*

| Condition | Visible sur /produits? |
|---|---|
| `is_approved=true` + `is_active=true` | ✅ Oui |
| `is_approved=false` | ❌ Non |
| `is_active=false` | ❌ Non |
| En cours de modification | ❌ Non |

---

## 6. Processus Commandes

### 6.1 Création d'une commande
**Déclencheur:** L'admin crée une entité order via la modale "Générer Commande"  
**Acteur:** Admin

**Étapes:**
1. Sélection experte de l'Acheteur (`client_id`) et de l'Article (`product_id`).
2. Requête d'insertion base de données avec statut originel `pending` (En Attente de Confirmation).

**Tables affectées:** `orders` → INSERT

### 6.2 Mise à jour statut commande
**Déclencheur:** L'admin alterne l'état de validation de la commande via le menu déroulant  
**Acteur:** Admin

**Étapes:**
1. Protection Backend `verifyAdmin()`.
2. Actualisation du `statut` (Exemple: de `pending` à `invoiced`).
3. Routine asynchrone Email déclenchée. Le système requiert dynamiquement le Mail du client et produit le mail de statut formelisé.

**Emails envoyés:**
- To: Client | Subject: "Mise à jour de votre commande"

**Tables affectées:** `orders` → UPDATE

### 6.3 Cycle de vie commande

```text
pending (En attente) 
   ↓ 
confirmed (Confirmée) 
   ↓ 
quality_check (Contrôle Qualité ETREND) 
   ↓ 
invoiced (Facturée) 
   ↓ 
shipped (Expédiée) 
   ↓ 
delivered (Livrée)

           OU DÉVIATION GLOBALE VERS:
------------------------------------------→ cancelled (Annulée - n'importe quelle étape)
```

---

## 7. Processus Notifications

### 7.1 Envoi notification individuelle
**Déclencheur:** Formulaire ciblé de notification unitaire dans `/admin/notifications`  
**Acteur:** Admin

**Étapes:**
1. Sélection de l'identifiant Utilisateur (`UUID`).
2. Insertion Data en base.
3. Affichage sur le profil du client instantanément.

**Tables affectées:** `notifications` → INSERT

### 7.2 Envoi notification globale
**Déclencheur:** Bouton "Diffuser à [Tous les Clients | Tous les Fournisseurs | Tous]"  
**Acteur:** Admin

**Étapes:**
1. Procédure Serveur récupère les IDs concernés via sous-requête Rôles.
2. Mécanisme de Boucle Batch : Insertion multi-lines par grappes dans `notifications`.

**Tables affectées:** `notifications` → INSERT (Bulk)

### 7.3 Réception en temps réel
**Déclencheur:** Écriture fraîche sur la base.  
**Acteur:** Client / Fournisseur

**Étapes:**
1. Application Client est couplée à un Listener Socket (Supabase Realtime Channel).
2. L'événement DB `INSERT` pousse le Payload JSON vers les Navigateurs des visiteurs.
3. La cloche Notification `Bell` affiche un compteur +1 dynamiquement *sans besoin de rechargement page*.

### 7.4 Marquer comme lu
**Déclencheur:** Ouvre le panel Notifications / Clic  
**Acteur:** Utilisateur Connecté

**Étapes:**
1. Appel RPC ou Update direct modifiant le booléen `is_read = true`.

**Tables affectées:** `notifications` → UPDATE

### 7.5 Expiration automatique
Les notifications expirent silencieusement si la logique Cron est étendue pour libérer la surcharge DB.

---

## 8. Processus Email (Resend)

*Ce module central est factorisé sous forme d'une librairie singleton robuste localisée à l'adresse root `/lib/mailer.ts`. Tous les incidents de transmission sont absorbés dans des directives Try/Catch afin de garantir que des ratés externes API ne brisent pas la cohérence interne Supabase.*

| # | Déclencheur Backend | Expéditeur (De) | Destinataire (A) | Sujet Standardisé |
|---|---|---|---|---|
| 1 | Client inscription | MOVEK System | Admin Alert | 🔔 Nouvel Acheteur Inscrit |
| 2 | Client approuvé | Admin System | Client | Votre compte Client est validé 🎉 |
| 3 | Client désactivé | Admin System | Client | Mise à jour de votre compte Client |
| 4 | Fournisseur inscription | MOVEK System | Admin Alert | 🔔 Nouveau Fournisseur Inscrit |
| 5 | Fournisseur approuvé | Admin System | Fournisseur | Votre compte Fournisseur est validé 🚀 |
| 6 | Fournisseur désactivé | Admin System | Fournisseur | Mise à jour de votre compte Fournisseur |
| 7 | Produit soumis | MOVEK System | Admin Alert | 🔔 Nouveau Produit en Attente |
| 8 | Produit approuvé | Admin System | Fournisseur | Votre produit est en ligne ! |
| 9 | Produit rejeté | Admin System | Fournisseur | Produit refusé : Action requise |
| 10 | Commande statut update | Admin System | Client | Mise à jour de votre commande |
| 11 | Demande introuvable (C) | MOVEK System | Admin Alert | [MOVEK] Nouvelle demande introuvable |
| 12 | Demande introuv. réponse | Admin System | Demandeur | Réponse à votre demande d'équipement spécial |
| 13 | Reset password | Supabase Native | Utilisateur | Reset Your Password (Template Supabase) |

**Mécanismes Techniques:**
- Service d'envoi API : **Resend**
- Point d'origine expéditeur par défaut : *notifications@resend.dev (remplacé par domaine PROD lors de la bascule technique)*.
- **Fail-Safe** : Tous les appels aux triggers d'emailing (`notifyProductApproved`, etc.) dans Server Actions avalent les blocs d'erreurs d'acheminement, inscrivent dans `console.error` le motif, mais terminent l'action principale sur `.success(true)`. 

---

## 9. Processus Admin (Back-office)

### 9.1 Approbation utilisateurs
**Vérification:** Système fort `verifyAdmin()`. Processus modifiant le booléen binaire `is_approved`. Gérant les flux Emails en écho. Applicable unilatéralement Clients & Fournisseurs.

### 9.2 Gestion des familles (Arborescence)
Mécanique visuelle en grille des Catégories et des Sous-familles. Exécution de vérifications d'intégrités référentielles SQL avant destruction (impossibilité absolue d'anéantir une branche Famille si un Produit en dépend intimement).

### 9.3 Gestion du blog & Actualités
Création d'articles MarkDown riches. Processus de statuts Brouillon (`is_published: false`) Vs Publié. Inclut métadonnées techniques SEO. Index public optimisé SSG/ISR côté Next.js App Router pour le référencement.

### 9.4 Documents techniques partagés
1. Admin sélectionne PDF `< 10 Mo`.
2. Processus téléverse de façon asynchrone le cache buffer à destination du bucket `technical-documents`.
3. Récuperation de l'URL brute et stockage associé à la table Metadata `technical_documents`.
4. Visualisation disponible sous forme de grid datatable avec icônes "Télécharger".

### 9.5 Activité temps réel (Urgent Dashboard)
L'intelligence de la plateforme s'appuie sur le composant `<RealtimeListener />`. 
**Processus:**
1. Souscription Websockets persistante sur les schémas Tables (x5: clients, fournisseurs, products, requests, orders).
2. Au moindre trigger `INSERT` de la DB, le Listener Web s'active via Callback.
3. Injection du *Debouncer* : Pour éviter les rechargements React cycliques qui feraient fondre le navigateur (e.g. 5 inscriptions conjointes déclenchant 5 requêtes), on instaure un délai `Timeout 1500ms`.
4. Ordre système `router.refresh()` forcé : L'Overview récupère la donnée Serveur actualisée. Une pastille Orange clignote au Dashboard, informant du Flux.

### 9.6 Export de Données Administratives (CSV)
Librairie centralisée `lib/utils-csv.ts`. 
Support complet UTF-8 & BOM octets forçant Excel FR Europe à lire avec justesse les "é, à, è". 
Outil omniprésent dans toutes les grilles `AdminDataTable` : exportant d'un clic tout rapport Client, Inventaire Fournisseur, Demandes B2B en listes maniables (nommage auto-daté).

---

## 10. Processus Fichiers & Storage

Supabase contrôle une architecture à compartiments de stockage sécurisés ou publics. L'entièreté est accessible `Public` aux utilisateurs, tout en exigeant une Auth Session Backend pour leurs créations/mutations.

### Architectures de Buckets

| Bucket Name | Contenu | Modèle de lien / Pathing | Public? |
|---|---|---|---|
| `product-images` | Médias Galerie (Photos) | `[fournisseur_id]/[product_id]/[hash_filename]` | ✅ Oui |
| `technical-sheets` | Fiches Produits (Datasheet) | `[fournisseur_id]/[product_id]/[hash_filename]` | ✅ Oui |
| `technical-documents` | Bibliothèque de Docs Globale | `documents/[hash_filename]` | ✅ Oui |
| `blog-images` | Couvertures Actualités | `blog/[post_id]/[hash_filename]` | ✅ Oui |

### Conformité & Validation Uploads

| Type de Fichier | Limite Poids | Formats Légaux | Allocation Max par Entité |
|---|---|---|---|
| Photos Produit | 5 Mo / Unité | JPG, PNG, WEBP | Limite Soft = 5 photos |
| Datasheet technique | 10 Mo | Seul : PDF | 1 document / Produit |
| Documents Global Admin | 10 Mo | Seul : PDF | 1 fichier / Record |
| Médias d'Information (Blog)| 5 Mo | JPG, PNG, WEBP | 1 header principal / Post |

### Rétention et Effacement Politique
- **Action de Substitution :** Toute altération sur fiche génère un `storage.remove([vieil_url])` de prévention avant inscription de la base et Upload.
- **Principe d'évacuation:** La destruction du composant maitre (ex: Produit) provoque inexorablement l'altération physique des fichiers du Storage et les dissipe dans l'éther (gain écologique data & finances Cloud).

---

## 11. Sécurité & Permissions

### 11.1 Infrastructure Générale Authentification
- Pilier Supabase Auth combiné au pack Server-Side Render de Next.js (`@supabase/ssr`).
- L'intégrité Session s'établit exclusivement sur format **httpOnly secure Cookies** pour annuler les vulnérabilités XSS standards.
- Middleware Next.js scrutant les routes, assurant la vérification continue des identifiants Rôle.

### 11.2 Classification Matrice Rôles & Privilèges

| Périmètre d'Action | Public / Visiteur | Utilisateur Client | Fournisseur | Agent Administrateur |
|---|---|---|---|---|
| *Consultation Vitrine* | ✅ | ✅ | ✅ | ✅ |
| **Accès Privilège Tarifs (Prix)** | ❌ Anonymisé | ❌ *(Hors phase 2)* | ✅ Seules ses fiches | ✅ Intégralité Visible |
| *Signaler Intérêt / Panier* | ❌ Interdit | ✅ Permis | ❌ Refus logique | ✅ Actions débridées |
| **Opérations Inventaire (Stock)** | ❌ Indisponible | ❌ Indisponible | ✅ Opérateur Actif | ✅ Tout Puissant |
| *Validation Sécurité Catalogues* | ❌ Brouillard | ❌ Brouillard | ❌ Brouillard | ✅ Pouvoir Validant |
| **Gestion Flotte Utilisateurs** | ❌ Refus | ❌ Refus | ❌ Refus | ✅ Maître Absolu |

### 11.3 Isolation Physique des Zones (Routing)
* Pare-feu 1: `/mon-compte/*` > Contrôle de rôle stricte `client`. Redirect Login en cas d'intrusion Fournisseur.
* Pare-feu 2: `/espace-fournisseur/*` > Contrôle opposé Rôle stricte `fournisseur`.
* Pare-feu 3: `/admin/*` > Contrôle Suprême Rôle `admin`.

### 11.4 Ligne Garde de Row Level Security (RLS) PostgreSQL
La base de données protège elle-même le fond et l'accès API réseau cru s'il survenait.

| Entité Base Structure | Lecture Public / Auth | Écriture Propriétaire (Vendeur/Client) | Admin Power (Service Key) |
|---|---|---|---|
| `clients` / `fournisseurs` | ❌ Verrouillé | ✅ CRUD limité Identité | ✅ Sans Limitation |
| `products` | Vue Filtrée Uniquement | ✅ Update Limité (Désactive Approval) | ✅ ByPass total |
| `interests` / `orders` / `notifs` | ❌ Strict Interdit | ✅ Lecture limitatif identité propre | ✅ Libre Gestion |
| `blog_posts` | `is_published = true` | ❌ N/A | ✅ Pleins Droits |
| `introuvable_requests` | ❌ Hermétique | ❌ Dépôt Anonyme possible | ✅ Propriétaire Logique |

### 11.5 Rempart Défensif Mutateur Actions Serveurs
- L'architecture `verifyAdmin()` intercepte chaque API Server Actions à exécution. Une tentative de script falsifiant une validation produit de l'extérieur est rejetée en Layer 0 avant requête Supabase.
- Trusting Modèle: Zéro-Confiance FrontEnd (Formulaires Zod Serveurs inébranlables).
- Formulaires Critiques Externes: Intégration Rate-Limiting anti DDoS local map (Max: 3 tentatives heures IP/Email).

---

## 12. Flux de Données (RLS & Filtres)

### 12.1 Expérience de Vue Diffractée par Profil

**Visiteur EXTERNE (Public)**
- Univers Data perçu par la lorgnette d'une "Vue Postgres" (`View: public_products`).
- Les Datas `prix`, `devise`, ou identité Vendeurs `fournisseur_id` demeurent cachées. L'écran de la donnée demeure stérile des secrets d'affaires ETREND.

**Client CONNECTÉ**
- Consistance de Session assurée et un accès étendu de son périmètre propre: Dashboard `interests`, `notifs`.
- La matrice des achats garde secret les catalogues et prix à conditionnement global.

**Fournisseur CONNECTÉ**
- Hub de Productivité. Son "Inventaire" est la projection exacte de la clause WHERE (`fournisseur_id === id`); aucune transversalité possible d'espionnage catalogue Fournisseur Concurrence. Les statistiques de performance (`Home Counter`) calculent la popularité brute sur ces stricts articles restreints.

**Dieu ADMIN (Super-viseur)**
- Clé d'API `Service_Role`. Efface volontairement le concept de RLS par élévation de privilièges. Vision matricielle absolue et modératrice totale des informations brutes Supabase.

### 12.2 Mécanique des "Vues" Protectrices (public_products)

**Anatomie du Code Protection Cœur:**
La `public_products VIEW` est la grande muraille architecturale de MOVEK B2B.

*Filtres Exécutés sans contournement possible :*
- Les colonnes tarifaires et identities fournisseurs se voient amputées `SELECT sans prix, devise, etc`.
- Conditions restrictives `WHERE is_active = TRUE AND is_approved = TRUE`.

*Effet Domino de la Vue :* Au moindre rejet Administratif (Modération), ou suspension Client fournisseur, la logique coupe le flux électrique des Tables mères. Le Catalogue perçu disparait automatiquement et sans latences, protégeant le patrimoine visuel global ETREND de tout incident qualité.

---

### Contact & Support
Pour toute question technique:
📧 contact@etrend-maroc.com
📞 00212 666 18 12 69
🌐 MOVEK Industrial Marketplace
