declare module "*.css";

import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian Atelier",
  description: "Editorial luxury storefront built with Next.js, Prisma, Auth.js, and Stripe."
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
