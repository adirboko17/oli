"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { productBg, saveLabel, type Product } from "@/lib/data";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

const media: CSSProperties = {
  position: "relative",
  aspectRatio: "4/5",
  borderRadius: 16,
  overflow: "hidden",
  background: "#F3E4D8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function CatalogCard({ p, ltrName, note }: { p: Product; ltrName?: boolean; note?: boolean }) {
  const { add, mobile } = useSite();
  const v = productBg(p);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 10 : 12, height: "100%", minWidth: 0 }}>
      <Hx as={Link} href="/product" style={{ ...media, borderRadius: mobile ? 14 : 16 }} hover={{ opacity: 0.92 }}>
        <div style={v.bgStyle} />
        {v.noImg && (
          <span style={{ position: "relative", fontFamily: FF, fontWeight: 500, fontSize: mobile ? 18 : ltrName ? "clamp(28px,6.5vw,40px)" : 36, color: "#3A2826", textAlign: "center", padding: ltrName ? "0 8px" : "0 16px", lineHeight: 1.15 }}>{p.name}</span>
        )}
        {p.badge && <span style={{ position: "absolute", top: mobile ? 8 : 12, right: mobile ? 8 : 12, background: "#FBF5EF", fontSize: mobile ? 11 : 12, fontWeight: 600, padding: mobile ? "4px 8px" : "5px 10px", borderRadius: 999, maxWidth: "calc(100% - 16px)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.badge}</span>}
      </Hx>
      <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 6 : 8, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: FF, fontSize: mobile ? 16 : "clamp(17px,4.4vw,22px)", fontWeight: 500, direction: ltrName ? "ltr" : undefined, textAlign: ltrName ? "right" : undefined, lineHeight: 1.2 }}>{p.name}</span>
          <span style={{ fontSize: mobile ? 13 : 14, color: "#6E5650", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.8em" }}>{p.sub}</span>
          {note && p.note && <span style={{ fontSize: mobile ? 12 : 13, color: "#A85A3A", fontWeight: 600, marginTop: 2 }}>{p.note}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap", marginTop: "auto" }}>
          <span style={{ fontWeight: 700, fontSize: mobile ? 15 : 16 }}>{fmt(p.price)}</span>
          {p.old ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{fmt(p.old)}</span> : null}
        </div>
      </div>
      <Hx as="button" onClick={() => add(1, p.name)} style={{ marginTop: "auto", background: "transparent", border: "1px solid #CDB5A8", color: "#3A2826", padding: mobile ? "9px 8px" : 11, borderRadius: 999, fontSize: mobile ? 13 : 14, fontWeight: 600 }} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>הוספה לסל</Hx>
    </div>
  );
}

export function GiftCard({ p }: { p: Product }) {
  const { mobile } = useSite();
  const v = productBg(p);
  const save = p.old ? saveLabel(p) : "";
  return (
    <Hx as={Link} href="/product" className="gift-card" style={{ display: mobile ? "grid" : "flex", flexDirection: "column", gridTemplateColumns: "128px minmax(0,1fr)", alignItems: "stretch", borderRadius: mobile ? 18 : 20, overflow: "hidden", background: "#FFFFFF", border: "1px solid #EADBCF", color: "#3A2826", minHeight: mobile ? 128 : undefined }} hover={{ boxShadow: "0 14px 40px rgba(58,40,38,.10)" }}>
      <div style={{ position: "relative", aspectRatio: mobile ? "auto" : "4/3", minHeight: mobile ? 128 : undefined, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3E4D8" }}>
        <div style={v.bgStyle} />
        {v.noImg && !mobile && <span style={{ position: "relative", fontFamily: FF, fontWeight: 500, fontSize: 32, textAlign: "center", padding: "0 16px", lineHeight: 1.2 }}>{p.name}</span>}
        {save && !mobile && <span style={saveBadge}>{save}</span>}
      </div>
      <div style={{ padding: mobile ? "12px 14px" : "18px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: mobile ? 3 : 6, minWidth: 0 }}>
          {save && mobile && <span style={{ ...saveBadge, position: "static", alignSelf: "flex-start", marginBottom: 4 }}>{save}</span>}
          <span style={{ fontFamily: FF, fontWeight: 500, fontSize: mobile ? 17 : 20, lineHeight: 1.2, direction: "ltr", textAlign: "right" }}>{p.name}</span>
          <span style={{ fontSize: mobile ? 13 : 15, color: "#6E5650", lineHeight: 1.35 }}>{p.sub}</span>
          <span style={{ display: "flex", gap: 8, alignItems: "baseline", marginTop: mobile ? 6 : 8 }}>
            <span style={{ fontWeight: 700, fontSize: mobile ? 16 : 18 }}>{fmt(p.price)}</span>
            {p.old ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{fmt(p.old)}</span> : null}
          </span>
        </div>
        <span className="gift-go" aria-hidden style={{ width: mobile ? 40 : 44, height: mobile ? 40 : 44, borderRadius: "50%", background: "#F3E2D5", color: "#3A2826", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        </span>
      </div>
    </Hx>
  );
}

const saveBadge: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  background: "#A85A3A",
  color: "#FFF",
  fontSize: 12,
  fontWeight: 700,
  padding: "4px 9px",
  borderRadius: 999,
};
