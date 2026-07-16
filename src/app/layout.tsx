import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ARCHI — Digital Copyright Archive",
    template: "%s — ARCHI",
  },
  description: SITE.description,
  keywords: ["digital archive", "copyright archive", "original photography", "editorial film", "image rights"],
  metadataBase: new URL(SITE.url),
  icons: {
    icon: "/archi-mark.svg",
  },
  openGraph: {
    title: "ARCHI — Digital Copyright Archive",
    description: SITE.description,
    siteName: "ARCHI",
    type: "website",
    url: SITE.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ARCHI Digital Copyright Archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARCHI — Digital Copyright Archive",
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: "/" },
  other: { copyright: "Copyright 2015 ARCHI" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${sourceSerif.variable} ${ibmPlexMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem("archiv-theme")==="dark"?"dark":"light"}catch{}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider>
          <Header />
          <div id="main-content" className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
