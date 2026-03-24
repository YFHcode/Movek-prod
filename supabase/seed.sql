-- ============================================================
-- MOVEK SEED DATA
-- Product Families, Subcategories, and Services
-- Run this AFTER schema.sql and rls.sql
-- ============================================================

-- ============================================================
-- 1. FROID ET CLIMATISATION
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Froid et Climatisation', 'froid-et-climatisation', 1);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Groupe de froid / Pompe à chaleur', 'groupe-froid-pompe-chaleur'),
    ('Centrale frigorifique', 'centrale-frigorifique'),
    ('Tunnel de Refroidissement / Surgélation', 'tunnel-refroidissement-surgelation'),
    ('Traitement de l''air CTA', 'traitement-air-cta'),
    ('Compresseurs frigorifiques', 'compresseurs-frigorifiques'),
    ('Echangeur / Condenseurs / Evaporateurs', 'echangeur-condenseurs-evaporateurs'),
    ('Ventilateurs', 'ventilateurs-froid'),
    ('Equipement & Accessoires circuits Aérauliques', 'equipement-accessoires-aerauliques'),
    ('Equipement & Accessoires circuits frigorifiques', 'equipement-accessoires-frigorifiques'),
    ('Equipement & Accessoires circuits hydraulique', 'equipement-accessoires-hydraulique'),
    ('Pilotage et Mesure', 'pilotage-et-mesure'),
    ('Isolation thermique', 'isolation-thermique'),
    ('Autre', 'autre-froid')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'froid-et-climatisation';

-- ============================================================
-- 2. ELECTRICITE
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Electricité', 'electricite', 2);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Appareillage électrique', 'appareillage-electrique'),
    ('Variateur de vitesse', 'variateur-de-vitesse'),
    ('Contrôleurs', 'controleurs-electricite'),
    ('Capteurs', 'capteurs'),
    ('Actionneurs', 'actionneurs'),
    ('Freins électriques/hybride', 'freins-electriques-hybride'),
    ('Câbles', 'cables'),
    ('Chemin de câble', 'chemin-de-cable'),
    ('Accessoires électrique industriel', 'accessoires-electrique-industriel'),
    ('Autre', 'autre-electricite')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'electricite';

-- ============================================================
-- 3. ELECTROMECANIQUE / SYSTEME D'ENTRAINEMENT
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Electromécanique / Système d''Entraînement', 'electromecanique-systeme-entrainement', 3);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Moteur électrique AC/DC', 'moteur-electrique-ac-dc'),
    ('Réducteur', 'reducteur'),
    ('Motoréducteur', 'motoreducteur'),
    ('Embarillage électrique', 'embarillage-electrique'),
    ('Ventilateurs', 'ventilateurs-electromecanique'),
    ('Chaînes / Engrenages / Accouplements', 'chaines-engrenages-accouplements'),
    ('Poulies / Courroies', 'poulies-courroies'),
    ('Roulements / palier', 'roulements-palier'),
    ('Variateurs / contrôleurs', 'variateurs-controleurs'),
    ('Autre', 'autre-electromecanique')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'electromecanique-systeme-entrainement';

-- ============================================================
-- 4. ENERGIE
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Energie', 'energie', 4);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Compresseur d''air', 'compresseur-air'),
    ('Groupe électrogène', 'groupe-electrogene'),
    ('Onduleurs', 'onduleurs'),
    ('Transformateurs', 'transformateurs'),
    ('Autre', 'autre-energie')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'energie';

-- ============================================================
-- 5. MANUTENTION ET LEVAGE
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Manutention et Levage', 'manutention-et-levage', 5);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Equip & Acc Transpalette', 'equip-acc-transpalette'),
    ('Equip & Acc Gerbeur', 'equip-acc-gerbeur'),
    ('Equip & Acc Chariots élevateur', 'equip-acc-chariots-elevateur'),
    ('Equip & Acc Palans/treuil', 'equip-acc-palans-treuil'),
    ('Equip & Acc Ponts roulants', 'equip-acc-ponts-roulants'),
    ('Equip & Acc Nacelle élévatrice', 'equip-acc-nacelle-elevatrice'),
    ('Equip & Acc Vérins hydrauliques', 'equip-acc-verins-hydrauliques')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'manutention-et-levage';

-- ============================================================
-- 6. ENGINS DE CHANTIER BTP
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Engins de Chantier BTP', 'engins-chantier-btp', 6);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Pièces moteur thermique', 'pieces-moteur-thermique'),
    ('Pièces moteur hydraulique', 'pieces-moteur-hydraulique'),
    ('Accessoire hydraulique', 'accessoire-hydraulique'),
    ('Accessoires mécanique', 'accessoires-mecanique'),
    ('Accessoires électrique', 'accessoires-electrique'),
    ('Pneumatique', 'pneumatique'),
    ('Autre', 'autre-engins-btp')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'engins-chantier-btp';

-- ============================================================
-- 7. MACHINES INDUSTRIELLES
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Machines Industrielles', 'machines-industrielles', 7);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Plasturgie', 'plasturgie'),
    ('Céramique', 'ceramique'),
    ('Papier & carton', 'papier-carton'),
    ('Métallurgie / Sidérurgie / Fonderie', 'metallurgie-siderurgie-fonderie'),
    ('Alimentaire / Boissons / Laiterie / Abattoirs', 'alimentaire-boissons-laiterie-abattoirs'),
    ('Conserverie', 'conserverie'),
    ('Matériaux de construction', 'materiaux-de-construction'),
    ('Transformation du bois', 'transformation-du-bois'),
    ('Transformation du verre', 'transformation-du-verre'),
    ('Huiles & raffinage', 'huiles-raffinage'),
    ('Chimie industrielle', 'chimie-industrielle'),
    ('Autre', 'autre-machines-industrielles')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'machines-industrielles';

-- ============================================================
-- 8. INDUSTRIE DE TRANSFORMATION
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Industrie de Transformation', 'industrie-de-transformation', 8);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Industrie mécanique', 'industrie-mecanique'),
    ('Industrie aéronautique', 'industrie-aeronautique'),
    ('Industrie pétrochimique', 'industrie-petrochimique'),
    ('Impression / Étiquetage', 'impression-etiquetage'),
    ('Industrie de Tissage, teinture, impression', 'industrie-tissage-teinture-impression')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'industrie-de-transformation';

-- ============================================================
-- 9. EQUIPEMENT ATELIER
-- ============================================================
INSERT INTO product_families (nom, slug, ordre) VALUES
  ('Equipement Atelier', 'equipement-atelier', 9);

INSERT INTO product_subcategories (family_id, nom, slug)
SELECT pf.id, sub.nom, sub.slug FROM (
  VALUES
    ('Outillage à main', 'outillage-a-main'),
    ('Equipement auxiliaire', 'equipement-auxiliaire'),
    ('Contrôle et mesure', 'controle-et-mesure'),
    ('Autre', 'autre-equipement-atelier')
) AS sub(nom, slug)
CROSS JOIN product_families pf
WHERE pf.slug = 'equipement-atelier';

-- ============================================================
-- SERVICES
-- ============================================================
INSERT INTO services (nom, slug, description) VALUES
  ('Électricien industriel', 'electricien-industriel', 'Installation et maintenance des systèmes électriques industriels'),
  ('Technicien frigoriste CTA / Traitement d''air', 'technicien-frigoriste-cta', 'Maintenance et réparation des systèmes de climatisation et traitement d''air'),
  ('Technicien hydraulique industriel', 'technicien-hydraulique-industriel', 'Intervention sur les circuits et systèmes hydrauliques industriels'),
  ('Tuyauteur industriel', 'tuyauteur-industriel', 'Installation et maintenance des réseaux de tuyauterie industrielle'),
  ('Technicien isolation', 'technicien-isolation', 'Mise en œuvre et réparation de l''isolation thermique et acoustique'),
  ('Électromécanicien industriel', 'electromecanicien-industriel', 'Maintenance des équipements électromécaniques industriels'),
  ('Technicien maintenance pneumatique', 'technicien-maintenance-pneumatique', 'Entretien et réparation des systèmes pneumatiques'),
  ('Mécanicien industriel', 'mecanicien-industriel', 'Maintenance mécanique des équipements et machines industrielles'),
  ('Mécanique engins et groupe électrogène', 'mecanique-engins-groupe-electrogene', 'Réparation et entretien des engins de chantier et groupes électrogènes'),
  ('Mécanique de précision', 'mecanique-de-precision', 'Usinage et ajustement de pièces mécaniques de haute précision'),
  ('Automaticien (régulation & pilotage)', 'automaticien-regulation-pilotage', 'Programmation et maintenance des systèmes d''automatisation industrielle'),
  ('Spécialisé variateur', 'specialise-variateur', 'Installation et paramétrage des variateurs de vitesse industriels'),
  ('Technicien instrumentation', 'technicien-instrumentation', 'Étalonnage et maintenance des instruments de mesure industriels'),
  ('Technicien process industriel', 'technicien-process-industriel', 'Optimisation et suivi des processus de production industrielle'),
  ('Technicien métrologie', 'technicien-metrologie', 'Contrôle dimensionnel et métrologie industrielle'),
  ('Peintre industriel', 'peintre-industriel', 'Application de revêtements et peintures industrielles'),
  ('Chaudronnier acier / inox', 'chaudronnier-acier-inox', 'Fabrication et réparation de structures en acier et inox');
