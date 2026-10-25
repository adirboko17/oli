"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FF } from "@/lib/format";
import { catalogMenu, findMenuItem, isOliminiCategory, menuHref, productsForMenu } from "@/lib/catalog-menu";
import { CatalogCard } from "@/components/cards";
import CategoryFilter, { type SortKey } from "@/components/CategoryFilter";
import { useSite } from "@/components/site";

export function CategoryView() {
  const sp = useSearchParams();
  const router = useRouter();
  const { products, collections } = useSite();
  const groups = useMemo(() => catalogMenu(products, collections), [products, collections]);
  const requested = sp.get("cat") || "all";
  const [cat, setCat] = useState(requested);
  const [sort, setSort] = useState<SortKey>("rec");

  useEffect(() => {
    const next = sp.get("cat") || "all";
    if (next !== "all" && isOliminiCategory(next)) {
      router.replace("/olimini");
      return;
    }
    setCat(next);
  }, [sp, router]);

  const list = useMemo(() => {
    let rows = productsForMenu(products, collections, cat);
    if (sort === "low") rows = [...rows].sort((a, b) => a.price - b.price);
    if (sort === "high") rows = [...rows].sort((a, b) => b.price - a.price);
    return rows;
  }, [products, collections, cat, sort]);

  const group = cat === "all" ? null : findMenuItem(groups, cat);
  const label = cat === "all" ? "כל המוצרים" : group?.label || cat;
  const blurb = group?.blurb || "מוצרי טיפוח בטוחים, יעילים ומפנקים למסע היקר של ההריון ולאחריו.";

  return (
    <main style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4.5vw,32px) clamp(53px,9vw,96px)" }}>
      <div style={{ fontSize: "clamp(12px,3.2vw,14px)", color: "#8A6C64", display: "flex", gap: 8, whiteSpace: "nowrap", overflow: "hidden" }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span><span style={{ color: "#3A2826" }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.6vw,14px)", padding: "clamp(18px,4vw,40px) 0 clamp(20px,4vw,40px)", maxWidth: 640 }}>
        <h1 {...(group ? { "data-cms": "category", "data-cms-id": group.id } : {})} style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.03em", fontSize: "clamp(40px,8vw,80px)", lineHeight: 1 }}>{label}</h1>
        <p style={{ fontSize: "clamp(15px,3.8vw,17px)", lineHeight: 1.65, color: "#5E4844" }}>{products.length ? blurb : "אין כרגע מוצרים פעילים."}</p>
      </div>

      <CategoryFilter
        categories={[{ key: "all", label: "כל המוצרים", count: products.length }, ...groups.map((item) => ({ key: item.id, label: item.label, count: item.count }))]}
        category={findMenuItem(groups, cat)?.id || (cat === "all" ? "all" : cat)}
        onCategoryChange={(key) => { if (isOliminiCategory(key)) { router.push("/olimini"); return; } setCat(key); router.replace(key === "all" ? "/products" : menuHref(key), { scroll: false }); }}
        sort={sort}
        onSortChange={setSort}
        resultCount={list.length}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(calc(50% - 7px),250px),1fr))", gap: "clamp(24px,5vw,40px) clamp(12px,3vw,20px)", paddingTop: 32 }}>
        {list.length === 0 ? <p style={{ gridColumn: "1 / -1", fontSize: 18, color: "#5E4844" }}>אין כרגע מוצרים פעילים.</p> : list.map((p) => <CatalogCard key={p.id} p={p} />)}
      </div>
    </main>
  );
}
