import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "SurgeTicket",
  description: "Real-time dynamic pricing ticket engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-synth-text">
          {/* Global Navigation Bar */}
          <header className="glass-header sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xl ">
                  S
                </div>
                <h1 className="font-bold text-xl tracking-tight gradient-text">SurgeTicket</h1>
              </div>
              
              <nav className="flex items-center gap-6 font-medium text-sm">
              <Link href="/" className="hover:text-black text-synth-muted transition-colors">
                Browse Events
              </Link>
              <Link href="/admin" className="hover:text-black text-synth-muted transition-colors">
                Live Stats
              </Link>
            </nav>
            </div>
          </header>

          {children}
      </body>
    </html>
  );
}
