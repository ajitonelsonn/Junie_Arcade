import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "./components/MusicProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Junie Arcade | Sky's the Limit",
  description: "A high-performance arcade tournament experience by Cloud9 x JetBrains.",
  openGraph: {
    title: "Junie Arcade | Sky's the Limit",
    description: "A high-performance arcade tournament experience by Cloud9 x JetBrains.",
    images: [
      {
        url: "/assets/images/logos/game_logo/j_arcade.webp",
        width: 1200,
        height: 630,
        alt: "Junie Arcade Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Junie Arcade | Sky's the Limit",
    description: "A high-performance arcade tournament experience by Cloud9 x JetBrains.",
    images: ["/assets/images/logos/game_logo/j_arcade.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MusicProvider>
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}
