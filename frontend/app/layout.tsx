import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
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

const DESCRIPTION =
  "One system for leads, quotes, multi-event bookings and branded invoices — built for caterers of every cuisine and scale.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ziyafat.com"),
  applicationName: "Ziyafat",
  title: {
    default: "Ziyafat — Catering Management",
    template: "%s | Ziyafat",
  },
  description: DESCRIPTION,
  keywords: ["catering", "catering ERP", "catering management", "event catering", "bookings", "invoices", "quotations"],
  openGraph: {
    type: "website",
    siteName: "Ziyafat",
    title: "Ziyafat — Catering Management",
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Ziyafat — Catering Management",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
        </ThemeProvider>
      </body>
    </html>
  );
}
