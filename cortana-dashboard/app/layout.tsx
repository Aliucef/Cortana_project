import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Cortana | AI Personal Assistant",
  description: "Your intelligent personal assistant for finance, fitness, and life optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        {/* Main layout structure */}
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar - Fixed left, no scroll */}
          <Sidebar />

          {/* Header - Fixed top */}
          <Header />

          {/* Main content area - with scroll */}
          <main className="ml-16 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
