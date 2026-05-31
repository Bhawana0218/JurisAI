import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JurisAI — AI-Powered Legal Intelligence Platform",
  description:
    "JurisAI is an AI-native legal intelligence platform providing multilingual legal assistance, document analysis, case management, and enterprise-grade AI workflows for citizens, law firms, and enterprises.",
  keywords: [
    "legal AI",
    "legal assistant",
    "Indian law",
    "cybercrime",
    "consumer rights",
    "legal technology",
    "AI lawyer",
    "legal research",
  ],
  openGraph: {
    title: "JurisAI — AI-Powered Legal Intelligence Platform",
    description:
      "Get answers, workflows, and citations for Indian legal questions powered by AI.",
    type: "website",
  },
};

// Root layout intentionally does NOT wrap children in SessionProvider.
// SessionProvider (next-auth/react) uses useState and must be a client
// component. Wrapping the entire app causes blank flashes on marketing and
// auth pages because the provider renders null on the server (ssr:false).
//
// Instead, each route group that needs session context provides its own
// provider:
//   - (auth)/layout.tsx  → no provider needed, uses server-side auth()
//   - dashboard/layout.tsx → wraps children in SessionProvider via
//                            DashboardShell or a dedicated provider
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="bg-[#050d1a] text-white h-full">
        {children}
      </body>
    </html>
  );
}
