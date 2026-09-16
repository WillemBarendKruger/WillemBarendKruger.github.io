import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

// next/font/google downloads at build time and self-hosts the result — no
// runtime request to a third party, no font binaries committed.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE = "https://willembarendkruger.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description:
    "Software engineer building backend systems with C# and .NET, and the web interfaces on top of them. Currently working on enterprise applications and moving deeper into Azure.",
  openGraph: {
    type: "website",
    url: SITE,
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description:
      "Backend-focused software engineer. C#, .NET, TypeScript, React, Azure.",
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description:
      "Backend-focused software engineer. C#, .NET, TypeScript, React, Azure.",
    images: ["/images/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:border focus:border-cyan focus:bg-panel focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-cyan"
        >
          Skip to content
        </a>
        <main id="content">{children}</main>
      </body>
    </html>
  );
}
