import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-pub",
  display: "swap",
});

const SITE = "https://getziyafat.vercel.app";

const DESCRIPTION =
  "Free catering management software for leads, bookings, quotations and branded invoices — built for caterers of every cuisine and scale across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  applicationName: "Ziyafat",
  title: {
    default: "Ziyafat — Free Catering Software for Caterers",
    template: "%s | Ziyafat",
  },
  description: DESCRIPTION,
  keywords: [
    "catering software",
    "free catering software",
    "catering software india",
    "catering management software",
    "catering software for small business",
    "best catering software",
    "catering management app",
    "software for caterers",
    "software for catering",
    "catering services software",
    "catering business software",
    "catering booking software",
    "catering event management software",
    "catering order software",
    "catering business management software",
    "catering inventory software",
    "catering accounting software",
    "catering scheduling software",
    "catering software programs",
    "catering management system",
    "online catering software",
    "catering event software",
    "catering ERP",
    "catering software hyderabad",
  ],
  openGraph: {
    type: "website",
    siteName: "Ziyafat",
    title: "Ziyafat — Free Catering Software for Caterers",
    description: DESCRIPTION,
    locale: "en_IN",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ziyafat — Free Catering Software for Caterers",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

const foitScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: foitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
