import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadSniper | AI Lead Gen & Outreach",
  description: "Automated freelance lead generation for AI developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0f0f0f] text-gray-100 antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
