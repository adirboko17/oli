import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteProvider } from "@/components/site";
import { Shell } from "@/components/shell";
import { loadPublicCatalog } from "@/lib/catalog";
import { trackRenderedPageView } from "@/lib/storely-track";

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadPublicCatalog();
  const name = result.status === "ready" ? result.catalog.name : "חנות";
  return {
    title: name,
    description: name,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await trackRenderedPageView();
  const result = await loadPublicCatalog();
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Heebo:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {result.status === "ready" ? (
          <SiteProvider products={result.catalog.products} collections={result.catalog.collections} storeName={result.catalog.name}>
            <Shell>{children}</Shell>
          </SiteProvider>
        ) : (
          <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 22 }}>{result.status === "inactive" ? "החנות לא פעילה." : "לא הצלחנו לטעון את הקטלוג."}</p>
          </main>
        )}
      </body>
    </html>
  );
}
