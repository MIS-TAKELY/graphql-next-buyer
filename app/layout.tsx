import ApolloWrapper from "@/lib/apollo/apollo-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from "@/components/common/NotificationListener";
import AuthGate from "@/components/auth/AuthGate";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.vanijay.com"),
  keywords: ["ecommerce", "shopping", "electronics", "fashion", "online store"],
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
        alt: "Vanijoy E-Commerce",
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
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vanijay",
  },
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
    <html lang="en">

      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://placehold.co" />
      </head>
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
        </ApolloWrapper>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "G-R7VFCZNSEQ"} />
    </html>
  );
}
