"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ProductBadges } from "@/components/cards";
import { Hx } from "@/components/hx";
import { productCardSub, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";

export function BestLoop({ products, onAdd }: { products: CatalogProduct[]; onAdd: (p: CatalogProduct) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const drag = useRef<{ x: number; origin: number; pid: number } | null>(null);
  const xRef = useRef(0);
  const stepRef = useRef(0);
  const setRef = useRef(0);
  const ready = useRef(false);
  const [x, setX] = useState(0);
  const [anim, setAnim] = useState(false);
  const loop = useMemo(() => [...products, ...products, ...products], [products]);

  const apply = (value: number, animate: boolean) => {
    xRef.current = value;
    setAnim(animate);
    setX(value);
  };

  const shift = (value: number, dragOrigin?: { origin: number }) => {
    const set = setRef.current;
    if (!set) return value;
    let next = value;
    while (next < set) {
      next += set;
      if (dragOrigin) dragOrigin.origin += set;
    }
    while (next >= set * 2) {
      next -= set;
      if (dragOrigin) dragOrigin.origin -= set;
    }
    return next;
  };

  useEffect(() => {
    ready.current = false;
    const root = frame.current;
    if (!root || products.length < 2) return;
    const measure = () => {
      const cards = root.querySelectorAll<HTMLElement>("[data-best]");
      if (cards.length < products.length + 1) return;
      const first = cards[0].getBoundingClientRect();
      const second = cards[1].getBoundingClientRect();
      const cycle = cards[products.length].getBoundingClientRect();
      const step = Math.abs(first.right - second.right);
      const set = Math.abs(first.right - cycle.right);
      if (!step || !set) return;
      stepRef.current = step;
      setRef.current = set;
      if (!ready.current) {
        ready.current = true;
        apply(set, false);
      }
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(root);
    return () => watch.disconnect();
  }, [products.length]);

  useEffect(() => {
    if (products.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = () => {
      if (paused.current || drag.current || !stepRef.current) return;
      apply(xRef.current + stepRef.current, true);
    };
    const id = window.setInterval(tick, 3200);
    return () => window.clearInterval(id);
  }, [products.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    paused.current = true;
    drag.current = { x: e.clientX, origin: xRef.current, pid: e.pointerId };
    setAnim(false);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pid !== e.pointerId) return;
    if (Math.abs(e.clientX - current.x) > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    apply(shift(current.origin + (e.clientX - current.x), current), false);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pid !== e.pointerId) return;
    const moved = Math.abs(e.clientX - current.x) > 6;
    drag.current = null;
    const step = stepRef.current || 1;
    const placed = shift(xRef.current);
    const n = shift(Math.round(placed / step) * step);
    apply(n, Math.abs(n - placed) <= step);
    paused.current = false;
    if (moved) {
      const stop = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        window.removeEventListener("click", stop, true);
      };
      window.addEventListener("click", stop, true);
    }
  };

  if (products.length < 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {products.map((p) => <ProductTile key={p.id} p={p} onAdd={() => onAdd(p)} />)}
      </div>
    );
  }

  return (
    <div
      ref={frame}
      data-best-frame=""
      style={{ overflow: "hidden", marginInline: "calc(var(--page-pad) * -1)", containerType: "inline-size", touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div onTransitionEnd={(e) => { if (e.propertyName !== "transform" || e.target !== e.currentTarget) return; const next = shift(xRef.current); if (next !== xRef.current) apply(next, false); }} style={{ display: "flex", gap: "var(--page-pad)", width: "max-content", paddingInline: "var(--page-pad)", transform: `translateX(${x}px)`, transition: anim ? "transform .7s cubic-bezier(.22,.8,.24,1)" : "none" }}>
        {loop.map((p, n) => (
          <div key={`${p.id}-${n}`} data-best="" style={{ width: "calc((100cqw - (var(--page-pad) * 3)) / 2)", flex: "0 0 auto" }}>
            <ProductTile p={p} onAdd={() => onAdd(p)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductTile({ p, onAdd }: { p: CatalogProduct; onAdd: () => void }) {
  const src = productImage(p);
  const old = p.compareAt && p.compareAt > p.price ? p.compareAt : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ position: "relative" }}>
        <Link href={productHref(p)} style={{ position: "relative", display: "block", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#F6EEE8" }}>
          {src ? <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} /> : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center", fontFamily: FF, fontSize: 24 }}>{p.title}</span>}
          <ProductBadges product={p} />
        </Link>
        <Hx as="button" onClick={onAdd} aria-label="הוספה לסל" style={plus} hover={{ background: "#3A2826", color: "#FFFFFF" }}><Plus /></Hx>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(16px,4.2vw,19px)", lineHeight: 1.2 }}>{p.title}</span>
        <span style={cardSub(p.headline.mode === "split" && !!p.headline.subtitle.trim())}>{productCardSub(p)}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "baseline", fontSize: 15, marginTop: 4 }}>
          <span style={{ fontWeight: 600 }}>{fmt(p.price)}</span>
          {old ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{fmt(old)}</span> : null}
        </span>
      </div>
    </div>
  );
}

function Plus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function cardSub(split: boolean): CSSProperties {
  const shared: CSSProperties = { fontSize: 14, color: "#6E5650", lineHeight: 1.4 };
  return split
    ? { ...shared, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
    : { ...shared, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
}

const plus: CSSProperties = { position: "absolute", bottom: 10, left: 10, width: 40, height: 40, borderRadius: "50%", border: 0, background: "#FFFFFF", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(58,40,38,.12)" };
