import { AuthSync } from '@/components/auth/AuthSync';
import ApolloWrapper from "@/lib/apollo/apollo-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
  title: {
    default: "Dai - E-Commerce Platform",
    template: "%s | Dai",
  },
  description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dai-ecommerce.com"),
  keywords: ["ecommerce", "shopping", "electronics", "fashion", "online store"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Dai - E-Commerce Platform",
    description: "Modern e-commerce platform for seamless online shopping. Discover the best deals on electronics, fashion, and more.",
    siteName: "Dai",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or fallback
        width: 1200,
        height: 630,
        alt: "Dai E-Commerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dai - E-Commerce Platform",
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
    title: "Dai",
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
      <ClerkProvider>
        <AuthSync />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ApolloWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </ApolloWrapper>
        </body>
      </ClerkProvider>
    </html>
  );
}
