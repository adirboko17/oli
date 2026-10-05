import type { Metadata } from "next";
import "./globals.css";
import { SiteProvider } from "@/components/site";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Oli Safe Care",
  description: "טיפוח בטוח למסע היקר של ההריון ולאחריו",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SiteProvider>
          <Shell>{children}</Shell>
        </SiteProvider>
      </body>
    </html>
  );
}
