import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MOVEK — Marketplace Industrielle B2B",
    template: "%s | MOVEK",
  },
  description:
    "MOVEK est la marketplace B2B dédiée aux produits industriels. Achetez et vendez vos équipements industriels en toute confiance avec le modèle FBE (Fulfilled By ETREND).",
  keywords: [
    "marketplace industrielle",
    "B2B",
    "produits industriels",
    "équipement industriel",
    "ETREND",
    "FBE",
    "Maroc",
    "froid",
    "climatisation",
    "électromécanique",
  ],
  authors: [{ name: "ETREND" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MOVEK",
    title: "MOVEK — Marketplace Industrielle B2B",
    description:
      "La solution unique pour acheter et vendre vos produits industriels. Opérée par ETREND via le modèle FBE.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
