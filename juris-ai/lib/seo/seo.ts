import type { Metadata } from "next";

type SeoPage = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jurisai.io";
const DEFAULT_IMAGE = "/og-image.png";

export const SEO_PAGES: Record<string, SeoPage> = {
  home: { title: "JurisAI — AI-Powered Legal Intelligence Platform", description: "Transform legal workflows with AI. JurisAI provides intelligent legal research, document analysis, AI agents, and collaborative tools for legal professionals.", path: "/" },
  pricing: { title: "Pricing — JurisAI", description: "Choose the right plan for your legal practice. Free, Pro, Team, and Enterprise plans available.", path: "/pricing" },
  about: { title: "About — JurisAI", description: "Our mission to make legal intelligence accessible to everyone through AI.", path: "/about" },
  contact: { title: "Contact — JurisAI", description: "Get in touch with our team for sales, support, or partnership inquiries.", path: "/contact" },
  docs: { title: "Documentation — JurisAI", description: "Learn how to integrate and use JurisAI APIs, SDKs, and platform features.", path: "/docs" },
  changelog: { title: "Changelog — JurisAI", description: "Latest updates, features, and improvements to JurisAI.", path: "/changelog" },
  status: { title: "System Status — JurisAI", description: "Current status of JurisAI services and infrastructure.", path: "/status" },
  terms: { title: "Terms of Service — JurisAI", description: "Terms and conditions for using JurisAI.", path: "/terms" },
  privacy: { title: "Privacy Policy — JurisAI", description: "How JurisAI handles your data and privacy.", path: "/privacy" },
  gdpr: { title: "GDPR Compliance — JurisAI", description: "Our commitment to GDPR compliance and data protection.", path: "/gdpr" },
  dashboard: { title: "Dashboard — JurisAI", description: "Your legal AI workspace.", path: "/dashboard" },
};

export function generateMetadata(page: SeoPage): Metadata {
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${BASE_URL}${page.path}`,
      siteName: "JurisAI",
      images: [{ url: page.image || DEFAULT_IMAGE, width: 1200, height: 630 }],
      type: page.path === "/" ? "website" : "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [page.image || DEFAULT_IMAGE],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${BASE_URL}${page.path}` },
  };
}

export function structuredData(type: "software" | "organization" | "faq" | "pricing") {
  const base = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JurisAI",
    applicationCategory: "LegalApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      offerCount: "4",
    },
  };

  if (type === "organization") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "JurisAI",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      sameAs: ["https://twitter.com/jurisai", "https://linkedin.com/company/jurisai"],
    };
  }

  return base;
}
