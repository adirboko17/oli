"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { FF } from "@/lib/format";
import { findGroup, productsInGroup, shopGroups } from "@/lib/shop-groups";
import { CatalogCard } from "@/components/cards";
import { useSite } from "@/components/site";

function filterStyle(on: boolean): CSSProperties {
  return {
    padding: "8px 0",
    border: 0,
    borderBottom: "1px solid " + (on ? "#3A2826" : "transparent"),
    background: "transparent",
    color: on ? "#3A2826" : "#6E5650",
    fontSize: 15,
    fontWeight: on ? 600 : 500,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}

export function CategoryView() {
  const sp = useSearchParams();
  const router = useRouter();
  const { mobile, headerH, products } = useSite();
  const groups = useMemo(() => shopGroups(products), [products]);
  const requested = sp.get("cat") || "all";
  const [cat, setCat] = useState(requested);
  const [sort, setSort] = useState("rec");

  useEffect(() => {
    setCat(sp.get("cat") || "all");
  }, [sp]);

  const list = useMemo(() => {
    let rows = productsInGroup(products, cat);
    if (sort === "low") rows = [...rows].sort((a, b) => a.price - b.price);
    if (sort === "high") rows = [...rows].sort((a, b) => b.price - a.price);
    return rows;
  }, [products, cat, sort]);

  const group = cat === "all" ? null : findGroup(cat);
  const label = cat === "all" ? "כל המוצרים" : group?.label || cat;
  const blurb = group?.blurb || "מוצרי טיפוח בטוחים, יעילים ומפנקים למסע היקר של ההריון ולאחריו.";

  return (
    <main style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4.5vw,32px) clamp(53px,9vw,96px)" }}>
      <div style={{ fontSize: "clamp(12px,3.2vw,14px)", color: "#8A6C64", display: "flex", gap: 8, whiteSpace: "nowrap", overflow: "hidden" }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span><span style={{ color: "#3A2826" }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.6vw,14px)", padding: "clamp(18px,4vw,40px) 0 clamp(20px,4vw,40px)", maxWidth: 640 }}>
        <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.03em", fontSize: "clamp(40px,8vw,80px)", lineHeight: 1 }}>{label}</h1>
        <p style={{ fontSize: "clamp(15px,3.8vw,17px)", lineHeight: 1.65, color: "#5E4844" }}>{products.length ? blurb : "אין כרגע מוצרים פעילים."}</p>
      </div>

      <div style={{ position: "sticky", top: headerH > 20 ? headerH : 64, zIndex: 10, background: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #EFE4DC" }}>
        <div className="no-scroll" style={{ display: "flex", gap: "clamp(18px,3vw,32px)", overflowX: "auto", maxWidth: "100%", flex: "1 1 auto", minWidth: 0 }}>
          {[{ id: "all", label: "הכל", count: products.length }, ...groups.map((item) => ({ id: item.id, label: item.label, count: item.count }))].map((item) => (
            <button key={item.id} type="button" onClick={() => { setCat(item.id); router.replace(item.id === "all" ? "/products" : "/products?cat=" + encodeURIComponent(item.id), { scroll: false }); }} style={filterStyle(cat === item.id || (item.id !== "all" && findGroup(cat)?.id === item.id))}>
              {item.label}<span style={{ fontSize: 11, color: "#9C847C", marginInlineStart: 4, verticalAlign: "super" }}>{item.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 14, color: "#6E5650", flexShrink: 0 }}>
          {!mobile && <span>{list.length} מוצרים</span>}
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="מיון" style={{ fontFamily: "inherit", fontSize: 14, padding: "8px 4px", border: 0, background: "transparent", color: "#6E5650" }}>
            <option value="rec">מומלצים</option>
            <option value="low">מחיר: מהנמוך לגבוה</option>
            <option value="high">מחיר: מהגבוה לנמוך</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(calc(50% - 7px),250px),1fr))", gap: "clamp(24px,5vw,40px) clamp(12px,3vw,20px)", paddingTop: 32 }}>
        {list.length === 0 ? <p style={{ gridColumn: "1 / -1", fontSize: 18, color: "#5E4844" }}>אין כרגע מוצרים פעילים.</p> : list.map((p) => <CatalogCard key={p.id} p={p} />)}
      </div>
    </main>
  );
}
