"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { productBlurb, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { CatalogCard } from "@/components/cards";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

export function ProductView({ product, related }: { product: CatalogProduct; related: CatalogProduct[] }) {
  const { mobile, add } = useSite();
  const images = product.media.filter((item) => item.src);
  const [thumb, setThumb] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((item) => item.id === variantId) ?? null;
  const unit = variant?.price ?? product.price;
  const line = unit * qty;
  const old = product.compareAt && product.compareAt > product.price ? product.compareAt : null;
  const active = images[thumb] ?? images[0];
  const description = product.description.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <main>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) 0", fontSize: 14, color: "#8A6C64", display: "flex", gap: 8 }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span>
        <Link href="/products" style={{ color: "#8A6C64" }}>המוצרים</Link><span>/</span>
        <span style={{ color: "#3A2826" }}>{product.title}</span>
      </div>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) clamp(44px,9vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,480px),1fr))", gap: "clamp(28px,6vw,56px)", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: images.length > 1 ? "clamp(52px,13vw,72px) minmax(0,1fr)" : "minmax(0,1fr)", gap: "clamp(8px,2vw,14px)" }}>
          {images.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {images.map((item, index) => (
                <button key={item.id} type="button" onClick={() => setThumb(index)} style={{ width: "100%", aspectRatio: "4/5", padding: 0, borderRadius: 10, overflow: "hidden", border: "2px solid " + (thumb === index ? "#3A2826" : "transparent"), background: "#F3E4D8" }}>
                  <div style={{ width: "100%", height: "100%", backgroundImage: `url("${item.src}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                </button>
              ))}
            </div>
          )}
          <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, overflow: "hidden", background: "#F3E4D8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {active?.src ? <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${active.src}")`, backgroundSize: "cover", backgroundPosition: "center" }} /> : <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(32px,6vw,56px)", textAlign: "center", padding: "0 24px" }}>{product.title}</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {product.vendor && <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>{product.vendor}</span>}
            <h1 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(40px,10vw,60px)", lineHeight: 1 }}>{product.title}</h1>
            {productBlurb(product) && <p style={{ fontFamily: FF, fontWeight: 500, fontSize: 24 }}>{productBlurb(product)}</p>}
          </div>
          {description.map((paragraph) => <p key={paragraph} style={{ fontSize: 17, lineHeight: 1.7, color: "#5E4844", textWrap: "pretty" }}>{paragraph}</p>)}
          {product.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.tags.map((tag) => <span key={tag} style={{ fontSize: 13, padding: "7px 12px", borderRadius: 999, background: "#F3E2D5" }}>{tag}</span>)}
            </div>
          )}

          {product.variants.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>בחירה</span>
              {product.variants.map((item) => {
                const on = item.id === (variant?.id ?? "");
                return (
                  <button key={item.id} type="button" onClick={() => setVariantId(item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 14, border: "1.5px solid " + (on ? "#3A2826" : "#E1CDC0"), background: on ? "#FFFFFF" : "transparent", color: "#3A2826", textAlign: "right" }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{item.title || "אפשרות"}{item.sku ? " · " + item.sku : ""}</span>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{fmt(item.price ?? product.price)}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 32 }}>{fmt(unit)}</span>
            {old ? <span style={{ fontSize: 18, color: "#9C847C", textDecoration: "line-through" }}>{fmt(old)}</span> : null}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #CDB5A8", borderRadius: 999 }}>
              <button type="button" onClick={() => setQty((value) => value + 1)} style={qtyBtn}>+</button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} style={qtyBtn}>−</button>
            </div>
            <Hx as="button" onClick={() => add({ id: variant?.id ?? product.id, name: product.title, sub: variant?.title || productBlurb(product), price: unit, image: productImage(product) }, qty)} style={{ flex: 1, background: "#3A2826", color: "#FBF5EF", border: 0, borderRadius: 999, fontSize: 17, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>הוספה לסל · {fmt(line)}</Hx>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(16px,4.5vw,32px) clamp(44px,9vw,80px)" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(28px,6.5vw,40px)", marginBottom: 24 }}>עוד מהחנות</h2>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(220px, 1fr))", gap: mobile ? "22px 12px" : "28px 20px" }}>
            {related.slice(0, 4).map((item) => <CatalogCard key={item.id} p={item} />)}
          </div>
        </section>
      )}
    </main>
  );
}

const qtyBtn: CSSProperties = { width: 46, height: 54, border: 0, background: "transparent", fontSize: 20, color: "#3A2826" };
