import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://movek.ma";

// ============================================================================
// BASE EMAIL TEMPLATE (MOVEK BRANDING)
// ============================================================================
function getBaseTemplate(title: string, contentHtml: string, ctaHtml: string = "") {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #0F2040; padding: 24px; text-align: center; }
            .header img { height: 40px; }
            .content { padding: 32px; }
            .title { color: #0F2040; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; }
            .text { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #475569; }
            .cta-container { text-align: center; margin: 32px 0; }
            .btn { display: inline-block; background-color: #FF6B00; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; }
            .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .accent-box { background-color: #f8fafc; border-left: 4px solid #FF6B00; padding: 16px; margin: 24px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <!-- Fallback text if logo isn't available in storage yet -->
                <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">MOVEK<span style="color: #FF6B00;">.</span></h1>
            </div>
            <div class="content">
                <h2 class="title">${title}</h2>
                <div class="text">
                    ${contentHtml}
                </div>
                ${ctaHtml ? `<div class="cta-container">${ctaHtml}</div>` : ""}
                <div class="text" style="font-size: 14px; margin-top: 40px;">
                    Cordialement,<br>
                    <strong>L'équipe MOVEK</strong>
                </div>
            </div>
            <div class="footer">
                Cet email a été envoyé automatiquement par la plateforme MOVEK.<br>
                Veuillez ne pas y répondre directement.
            </div>
        </div>
    </body>
    </html>
    `;
}

// ============================================================================
// GENERIC SENDER HELPER
// ============================================================================
async function sendEmailSafely(to: string | string[], subject: string, html: string) {
    try {
        const data = await resend.emails.send({
            from: "notifications@resend.dev", // Replace with verified domain e.g. "MOVEK <noreply@movek.ma>"
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        // We log the error but NEVER throw, to avoid blocking the main Server Action
        console.error("[MAILER ERROR] Failed to send email to", to, error);
        return { success: false, error };
    }
}

// ============================================================================
// 1. CLIENT APPROVAL EMAILS
// ============================================================================

export async function notifyClientApproved(email: string, prenom: string) {
    const title = "Votre compte Client est validé 🎉";
    const content = `
        Bonjour ${prenom},<br><br>
        Nous avons le plaisir de vous informer que votre compte acheteur MOVEK a été <strong>validé par notre équipe</strong>.
        Vous pouvez dès à présent vous connecter, consulter les prix exclusifs, ajouter des produits à vos favoris et passer commande.
    `;
    const cta = `<a href="${APP_URL}/login" class="btn">Accéder à la Marketplace</a>`;

    return sendEmailSafely(email, title, getBaseTemplate(title, content, cta));
}

export async function notifyClientDisabled(email: string, prenom: string) {
    const title = "Mise à jour de votre compte Client";
    const content = `
        Bonjour ${prenom},<br><br>
        Votre compte acheteur MOVEK a été temporairement suspendu ou désactivé par un administrateur.
        Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter afin d'obtenir plus d'informations.
    `;
    return sendEmailSafely(email, title, getBaseTemplate(title, content));
}

// ============================================================================
// 2. FOURNISSEUR APPROVAL EMAILS
// ============================================================================

export async function notifyFournisseurApproved(email: string, prenom: string) {
    const title = "Votre compte Fournisseur est validé 🚀";
    const content = `
        Bonjour ${prenom},<br><br>
        Excellente nouvelle : votre espace Fournisseur MOVEK vient d'être <strong>approuvé</strong>.
        Vous pouvez dès à présent publier vos équipements industriels sur notre plateforme de mise en relation.
    `;
    const cta = `<a href="${APP_URL}/espace-fournisseur" class="btn">Accéder à mon Espace</a>`;

    return sendEmailSafely(email, title, getBaseTemplate(title, content, cta));
}

export async function notifyFournisseurDisabled(email: string, prenom: string) {
    const title = "Mise à jour de votre compte Fournisseur";
    const content = `
        Bonjour ${prenom},<br><br>
        Votre espace fournisseur MOVEK a été suspendu par nos administrateurs.
        Vos articles ne sont actuellement plus visibles par nos acheteurs.
        Veuillez contacter le support pour résoudre la situation.
    `;
    return sendEmailSafely(email, title, getBaseTemplate(title, content));
}

// ============================================================================
// 3. PRODUCT EMAILS
// ============================================================================

export async function notifyProductApproved(email: string, prenom: string, article: string, productUrl: string) {
    const title = "Votre produit est en ligne !";
    const content = `
        Bonjour ${prenom},<br><br>
        Votre produit <strong>${article}</strong> a passé notre contrôle qualité et est désormais <strong>en ligne</strong> sur la marketplace MOVEK.
        Il est maintenant visible par l'ensemble de nos clients industriels.
    `;
    const cta = `<a href="${productUrl}" class="btn">Voir mon produit</a>`;

    return sendEmailSafely(email, title, getBaseTemplate(title, content, cta));
}

export async function notifyProductRejected(email: string, prenom: string, article: string, adminNote: string) {
    const title = "Produit refusé : Action requise";
    const content = `
        Bonjour ${prenom},<br><br>
        Suite à l'examen de votre produit <strong>${article}</strong>, notre équipe a dû le refuser pour la raison suivante :
        <div class="accent-box">
            ${adminNote}
        </div>
        Veuillez corriger ces éléments depuis votre espace fournisseur afin que nous puissions valider votre produit.
    `;
    const cta = `<a href="${APP_URL}/espace-fournisseur/produits" class="btn">Modifier mon produit</a>`;

    return sendEmailSafely(email, title, getBaseTemplate(title, content, cta));
}

// ============================================================================
// 4. ORDER EMAILS
// ============================================================================

export async function notifyOrderStatusUpdate(email: string, prenom: string, orderRef: string, newStatus: string, notes: string = "") {
    const title = "Mise à jour de votre commande";
    const content = `
        Bonjour ${prenom},<br><br>
        Le statut de votre commande <strong>#${orderRef}</strong> a évolué.
        <br><br>
        <strong>Nouveau statut :</strong> <span style="color: #FF6B00; font-weight: 600;">${newStatus.toUpperCase()}</span>
        ${notes ? `<div class="accent-box"><strong>Note :</strong><br>${notes}</div>` : ""}
    `;
    const cta = `<a href="${APP_URL}/espace-client/commandes" class="btn">Suivre ma commande</a>`;

    return sendEmailSafely(email, title, getBaseTemplate(title, content, cta));
}

// ============================================================================
// 5. INTROUVABLE REQUESTS
// ============================================================================

export async function notifyIntrouvableReply(email: string, prenom: string, originalDescription: string, adminReply: string) {
    const title = "Réponse à votre demande d'équipement spécial";
    const content = `
        Bonjour ${prenom},<br><br>
        Notre équipe sourcing a traité votre besoin spécifique :
        <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
            "...${originalDescription.slice(0, 100)}..."
        </div>
        <br>
        <div class="accent-box">
            <strong>Voici notre réponse :</strong><br><br>
            ${adminReply.replace(/\n/g, "<br>")}
        </div>
        Nous restons à votre disposition pour concrétiser cette commande.
    `;

    return sendEmailSafely(email, title, getBaseTemplate(title, content));
}

// ============================================================================
// 6. ADMIN ALERT EMAILS (Sent to super admins)
// ============================================================================

const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || "yousseffh88@gmail.com";

export async function alertAdminNewClient(clientDetails: Record<string, unknown>) {
    const title = "🔔 Nouvel Acheteur Inscrit";
    const content = `
        Un nouveau client s'est inscrit et attend validation :<br><br>
        <strong>Nom :</strong> ${clientDetails.nom_prenom}<br>
        <strong>Entreprise :</strong> ${clientDetails.entreprise}<br>
        <strong>Email :</strong> ${clientDetails.email}<br>
    `;
    const cta = `<a href="${APP_URL}/admin/clients" class="btn">Voir dans l'Admin</a>`;
    return sendEmailSafely(ADMIN_EMAIL, title, getBaseTemplate(title, content, cta));
}

export async function alertAdminNewFournisseur(fournisseurDetails: Record<string, unknown>) {
    const title = "🔔 Nouveau Fournisseur Inscrit";
    const content = `
        Un nouveau fournisseur s'est inscrit et attend validation :<br><br>
        <strong>Nom :</strong> ${fournisseurDetails.nom_prenom}<br>
        <strong>Entreprise :</strong> ${fournisseurDetails.entreprise}<br>
        <strong>Email :</strong> ${fournisseurDetails.email}<br>
    `;
    const cta = `<a href="${APP_URL}/admin/fournisseurs" class="btn">Voir dans l'Admin</a>`;
    return sendEmailSafely(ADMIN_EMAIL, title, getBaseTemplate(title, content, cta));
}

export async function alertAdminNewProduct(productDetails: Record<string, unknown>) {
    const title = "🔔 Nouveau Produit en Attente";
    const content = `
        Un fournisseur a soumis un nouveau produit pour validation :<br><br>
        <strong>Article :</strong> ${productDetails.article}<br>
        <strong>Marque :</strong> ${productDetails.marque || 'N/A'}<br>
        <strong>Fournisseur ID :</strong> ${productDetails.fournisseur_id}<br>
    `;
    const cta = `<a href="${APP_URL}/admin/produits" class="btn">Voir dans l'Admin</a>`;
    return sendEmailSafely(ADMIN_EMAIL, title, getBaseTemplate(title, content, cta));
}

// Generic admin alert — used for custom notifications (interest, etc.)
export async function notifyAdminAlert(subject: string, htmlBody: string) {
    return sendEmailSafely(ADMIN_EMAIL, subject, htmlBody);
}

