import { AuthSync } from '@/components/auth/AuthSync';
import ApolloWrapper from "@/lib/apollo/apollo-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from "@/components/common/NotificationListener";
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
  title: {
    default: "Vanijoy - E-Commerce Platform",
    template: "%s | Vanijoy",
  },
  description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://Vanijoy-ecommerce.com"),
  keywords: ["ecommerce", "shopping", "electronics", "fashion", "online store"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Vanijoy - E-Commerce Platform",
    description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
    siteName: "Vanijoy",
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
    title: "Vanijoy - E-Commerce Platform",
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
    title: "Vanijoy",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
      <ClerkProvider>
        <AuthSync />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ApolloWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
            <Toaster position="top-right" />
            <NotificationListener />
          </ApolloWrapper>
        </body>
      </ClerkProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "G-R7VFCZNSEQ"} />
    </html>
  );
}
