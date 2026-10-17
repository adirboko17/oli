"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { productBadges, productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

export function CatalogCard({ p }: { p: CatalogProduct }) {
  const { add } = useSite();
  const src = productImage(p);
  const old = p.compareAt && p.compareAt > p.price ? p.compareAt : null;
  return (
    <div data-cms="product" data-cms-id="product" style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%", minWidth: 0 }}>
      <div style={{ position: "relative" }}>
        <Link href={productHref(p)} style={{ position: "relative", display: "block", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#F6EEE8" }}>
          {src ? <img src={src} alt="" style={productPhoto} /> : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center", fontFamily: FF, fontSize: "clamp(24px,6vw,34px)" }}>{p.title}</span>}
          <ProductBadges product={p} />
        </Link>
        <Hx as="button" aria-label="הוספה לסל" onClick={() => add({ id: p.id, name: p.title, sub: productBlurb(p), price: p.price, image: src })} style={plus} hover={{ background: "#3A2826", color: "#FFFFFF" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </Hx>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingInline: 2 }}>
        <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(16px,4.2vw,19px)", lineHeight: 1.2 }}>{p.title}</span>
        <span style={{ fontSize: "clamp(13px,3.4vw,14px)", color: "#6E5650", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productBlurb(p)}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "baseline", fontSize: 15, marginTop: 4 }}>
          <span style={{ fontWeight: 600 }}>{fmt(p.price)}</span>
          {old ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{fmt(old)}</span> : null}
        </span>
      </div>
    </div>
  );
}

export function ProductBadges({ product }: { product: CatalogProduct }) {
  const labels = productBadges(product);
  if (!labels.length) return null;
  return (
    <span style={{ position: "absolute", top: 10, right: 10, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      {labels.map((label) => (
        <span key={label} style={{ background: label === "מבצע" ? "#A85A3A" : "#3A2826", color: "#FFFFFF", borderRadius: 999, padding: "4px 8px", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{label}</span>
      ))}
    </span>
  );
}

const productPhoto: CSSProperties = {
  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken",
};

const plus: CSSProperties = {
  position: "absolute", bottom: 10, left: 10, width: 40, height: 40, borderRadius: "50%", border: 0,
  background: "#FFFFFF", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 14px rgba(58,40,38,.12)",
};
