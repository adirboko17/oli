import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import { SiteProvider } from "@/components/site";
import { Shell } from "@/components/shell";
import { StorePopupSlot } from "@/components/store-popup-slot";
import { loadPublicCatalog } from "@/lib/catalog";
import { loadPublicEvents } from "@/lib/cms-events";
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
  const [result, events] = await Promise.all([loadPublicCatalog(), loadPublicEvents()]);
  const helloCookie = (await cookies()).get("oli_hello")?.value ?? "";
  let hello = "";
  try { hello = decodeURIComponent(helloCookie).trim().slice(0, 40); } catch { hello = ""; }
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Heebo:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {result.status === "ready" ? (
          <SiteProvider products={result.catalog.products} collections={result.catalog.collections} events={events} storeName={result.catalog.name}>
            <Shell hello={hello}>{children}</Shell>
            <Suspense fallback={null}>
              <StorePopupSlot />
            </Suspense>
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
