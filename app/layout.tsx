import ApolloWrapper from "@/lib/apollo/apollo-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from "@/components/common/NotificationListener";
import AuthGate from "@/components/auth/AuthGate";
import GlobalAuthModal from "@/components/auth/GlobalAuthModal";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vanijay - E-Commerce Platform",
    template: "%s | Vanijay",
  },
  description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
  metadataBase: new URL(process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Vanijay - E-Commerce Platform",
    description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
    siteName: "Vanijay",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or fallback
        width: 1200,
        height: 630,
        alt: "Vanijay E-Commerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanijay - E-Commerce Platform",
    description: "Modern e-commerce platform for seamless online shopping.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "180x180" },
    ],
    other: [
      { rel: "icon", url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },
  other: {
    "geo.region": "NP",
    "geo.placename": "Nepal",
    "msapplication-TileImage": "/icon-512x512.png",
    "msapplication-TileColor": "#000000",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vanijay",
  "url": "https://www.vanijay.com",
  "logo": "https://www.vanijay.com/icon-512x512.png",
  "sameAs": [
    "https://facebook.com/vanijay",
    "https://instagram.com/vanijay",
    "https://twitter.com/vanijay"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "areaServed": "NP",
    "availableLanguage": "en"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${plusJakarta.variable} antialiased`}
      >
        <ApolloWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthGate>
              {children}
            </AuthGate>
          </ThemeProvider>
          <Toaster position="top-right" duration={2500} richColors closeButton />
          <NotificationListener />
          <GlobalAuthModal />
        </ApolloWrapper>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "G-R7VFCZNSEQ"} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
