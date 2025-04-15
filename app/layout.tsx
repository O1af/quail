import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const keywords = [
  "Quail",
  "SQL",
  "AI",
  "Data Analysis",
  "Data Query",
  "Data Visualization",
  "BI",
  "Business Intelligence",
];

// Get base URL from environment or fallback to production URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://quailbi.com";

export const metadata: Metadata = {
  title: "Quail",
  description:
    "The Simpler, Smarter AI Data Query & Analysis tool for everyone",
  keywords: keywords,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Quail",
    title: "Quail - AI Data Query & Analysis Tool",
    description:
      "The Simpler, Smarter AI Data Query & Analysis tool for everyone",
    images: [
      {
        url: `${baseUrl}/quail_logo_white.png`,
        width: 1200,
        height: 630,
        alt: "Quail - AI Data Query & Analysis Tool",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Quail - AI Data Query & Analysis Tool",
    description:
      "The Simpler, Smarter AI Data Query & Analysis tool for everyone",
    images: [`${baseUrl}/quail_logo_white.png`],
    creator: "@useQuail",
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
        {process.env.NODE_ENV !== "production" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
        {/* Preconnect hints tell the browser to establish early connections to critical domains,
        reducing latency when resources are needed. DNS-prefetch is a fallback for older browsers */}
        <link
          rel="preconnect"
          href="https://ds-cdn.prod-east.frontend.public.atl-paas.net"
          crossOrigin="anonymous"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
        {process.env.NODE_ENV === "production" && (
          <Script
            defer
            src="https://olaf-metrics.vercel.app/script.js"
            data-website-id="242c6f31-19a3-470d-a9fc-bbe0334217bf"
          />
        )}
      </body>
    </html>
  );
}
