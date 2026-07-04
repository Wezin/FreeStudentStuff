import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://freeplug.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Free Plug — Free Student Deals, Events & Food in Ottawa",
  description:
    "Discover free food, student deals, campus events, hackathons, scholarships, and opportunities near Carleton, uOttawa, and Algonquin.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Free Plug — Free Student Deals, Events & Food in Ottawa",
    description:
      "Discover free food, student deals, campus events, hackathons, scholarships, and opportunities near Carleton, uOttawa, and Algonquin.",
    siteName: "Free Plug",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Plug — Free Student Deals, Events & Food in Ottawa",
    description:
      "Discover free food, student deals, campus events, hackathons, scholarships, and opportunities near Carleton, uOttawa, and Algonquin.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
