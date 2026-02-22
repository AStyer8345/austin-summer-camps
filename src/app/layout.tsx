import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Austin Summer Camp Finder | Find the Perfect Camp for Your Kids",
  description:
    "Discover, compare, and plan summer camps across Austin, TX. Browse 100+ camps by age, interest, price, and location. AI-powered summer planning.",
  keywords: [
    "Austin summer camps",
    "kids camps Austin TX",
    "summer camp finder",
    "Austin VBS",
    "Round Rock camps",
    "Hill Country camps",
  ],
  openGraph: {
    title: "Austin Summer Camp Finder",
    description: "Find the perfect summer camp for your kids in Austin, TX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.18.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  );
}
