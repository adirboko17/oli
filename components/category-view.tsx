"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CATS, PRODUCTS } from "@/lib/data";
import { FF } from "@/lib/format";
import { CatalogCard } from "@/components/cards";
import { useSite } from "@/components/site";

const KEYS = Object.keys(CATS);

function pill(on: boolean, mobile: boolean): CSSProperties {
  return {
    padding: mobile ? "7px 13px" : "9px 18px",
    borderRadius: 999,
    border: "1px solid " + (on ? "#3A2826" : "#CDB5A8"),
    background: on ? "#3A2826" : "transparent",
    color: on ? "#FBF5EF" : "#3A2826",
    fontSize: mobile ? 13 : 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}

export function CategoryView() {
  const sp = useSearchParams();
  const router = useRouter();
  const { mobile, headerH } = useSite();
  const initial = CATS[sp.get("cat") || ""] ? sp.get("cat")! : "preg";
  const [cat, setCat] = useState(initial);
  const [sort, setSort] = useState("rec");

  useEffect(() => {
    const next = sp.get("cat") || "preg";
    if (CATS[next]) setCat(next);
  }, [sp]);

  const list = useMemo(() => {
    let rows = PRODUCTS.filter((p) => cat === "all" || p.cat.includes(cat));
    if (sort === "low") rows = [...rows].sort((a, b) => a.price - b.price);
    if (sort === "high") rows = [...rows].sort((a, b) => b.price - a.price);
    return rows;
  }, [cat, sort]);

  const c = CATS[cat];

  return (
    <main style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4.5vw,32px) clamp(53px,9vw,96px)" }}>
      <div style={{ fontSize: "clamp(12px,3.2vw,14px)", color: "#8A6C64", display: "flex", gap: 8, whiteSpace: "nowrap", overflow: "hidden" }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span><span>המוצרים של Oli</span><span>/</span><span style={{ color: "#3A2826" }}>{c.t}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "16px clamp(28px,6vw,64px)", alignItems: "end", padding: "clamp(14px,4vw,28px) 0 clamp(16px,4vw,36px)", borderBottom: "1px solid #EADBCF" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px,1vw,8px)" }}>
          <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(15px,3.8vw,24px)", color: "#A85A3A" }}>{c.en}</span>
          <h1 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(32px,8vw,64px)", lineHeight: 1.05 }}>{c.t}</h1>
        </div>
        <p style={{ fontSize: "clamp(14px,3.8vw,17px)", lineHeight: 1.7, color: "#5E4844", maxWidth: 520, textWrap: "pretty" }}>{c.d}</p>
      </div>

      <div style={{ position: "sticky", top: headerH > 20 ? headerH : 64, zIndex: 10, background: "#FBF5EF", display: "flex", justifyContent: "space-between", alignItems: "center", gap: mobile ? 8 : 16, padding: mobile ? "10px 0" : "18px 0", flexWrap: mobile ? "nowrap" : "wrap", borderBottom: "1px solid #EADBCF", margin: mobile ? "0 -16px" : 0, paddingInline: mobile ? 16 : 0 }}>
        <div className="no-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "100%", flex: "1 1 auto", minWidth: 0 }}>
          {KEYS.map((k) => (
            <button key={k} type="button" onClick={() => { setCat(k); router.replace("/products?cat=" + k, { scroll: false }); }} style={pill(cat === k, mobile)}>{CATS[k].t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 14, color: "#6E5650", flexShrink: 0 }}>
          {!mobile && <span>{list.length} מוצרים</span>}
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="מיון" style={{ fontFamily: "inherit", fontSize: mobile ? 13 : 14, padding: mobile ? "7px 10px" : "9px 14px", borderRadius: 999, border: "1px solid #CDB5A8", background: "#FBF5EF", color: "#3A2826", maxWidth: mobile ? 104 : "none" }}>
            <option value="rec">מומלצים</option>
            <option value="low">מחיר: מהנמוך לגבוה</option>
            <option value="high">מחיר: מהגבוה לנמוך</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(220px, 1fr))", gap: mobile ? "22px 12px" : "40px 20px", paddingTop: 32 }}>
        {list.map((p) => <CatalogCard key={p.id} p={p} note />)}
      </div>
    </main>
  );
}
