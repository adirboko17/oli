"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FF } from "@/lib/format";

const KEY = "oli-a11y";

type A11y = { contrast: boolean; links: boolean; font: boolean; still: boolean; zoom: number };

const empty: A11y = { contrast: false, links: false, font: false, still: false, zoom: 100 };

function apply(a: A11y) {
  const root = document.documentElement;
  root.toggleAttribute("data-a11y-contrast", a.contrast);
  root.toggleAttribute("data-a11y-links", a.links);
  root.toggleAttribute("data-a11y-font", a.font);
  root.toggleAttribute("data-a11y-still", a.still);
  root.style.zoom = a.zoom === 100 ? "" : String(a.zoom / 100);
}

export function A11yWidget() {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState<A11y>(empty);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "");
      if (saved && typeof saved === "object") {
        const next = { ...empty, ...saved };
        setA(next);
        apply(next);
      }
    } catch { /* keep defaults */ }
  }, []);

  function update(next: A11y) {
    setA(next);
    apply(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const chip = (on: boolean) => ({
    display: "flex", alignItems: "center", gap: 8, padding: "12px 10px", borderRadius: 14, border: "1px solid " + (on ? "#3A2826" : "#EFE4DC"),
    background: on ? "#3A2826" : "#FFFFFF", color: on ? "#FFFFFF" : "#3A2826", fontSize: 13, fontWeight: 600, textAlign: "right" as const,
  });

  return (
    <div dir="rtl" style={{ position: "fixed", right: "clamp(14px,2vw,24px)", bottom: "clamp(14px,2vw,24px)", zIndex: 65, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      {open && (
        <div role="dialog" aria-label="תפריט נגישות" style={{ width: "min(320px,calc(100vw - 28px))", background: "#FFFFFF", color: "#3A2826", borderRadius: 24, boxShadow: "0 24px 60px rgba(42,28,26,.25)", padding: 20, display: "flex", flexDirection: "column", gap: 16, animation: "oliPop .35s cubic-bezier(.32,1.3,.4,1)", transformOrigin: "bottom right" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FF, fontSize: 20 }}>נגישות</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="סגירת תפריט נגישות" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E6D2C6", background: "transparent" }}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 16, background: "#FBF5F1" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>גודל טקסט</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr" }}>
              <button type="button" aria-label="הקטנת טקסט" onClick={() => update({ ...a, zoom: Math.max(100, a.zoom - 10) })} style={zoomBtn}>−</button>
              <span style={{ minWidth: 44, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{a.zoom}%</span>
              <button type="button" aria-label="הגדלת טקסט" onClick={() => update({ ...a, zoom: Math.min(140, a.zoom + 10) })} style={zoomBtn}>+</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button type="button" onClick={() => update({ ...a, contrast: !a.contrast })} style={chip(a.contrast)}>ניגודיות גבוהה</button>
            <button type="button" onClick={() => update({ ...a, links: !a.links })} style={chip(a.links)}>הדגשת קישורים</button>
            <button type="button" onClick={() => update({ ...a, font: !a.font })} style={chip(a.font)}>גופן קריא</button>
            <button type="button" onClick={() => update({ ...a, still: !a.still })} style={chip(a.still)}>עצירת אנימציות</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <button type="button" onClick={() => update(empty)} style={{ background: "transparent", border: 0, textDecoration: "underline", fontSize: 13 }}>איפוס הגדרות</button>
            <Link href="/legal?tab=a11y" style={{ color: "#A85A3A", textDecoration: "underline" }}>הצהרת נגישות</Link>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="תפריט נגישות" aria-expanded={open} style={{ width: 54, height: 54, borderRadius: "50%", border: 0, background: "#3A2826", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 28px rgba(42,28,26,.3)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.2" r="1.7" fill="currentColor" stroke="none" /><path d="M5 8.2c2.3.7 4.6 1 7 1s4.7-.3 7-1" /><path d="M12 9.2v5.3" /><path d="M12 14.5l-3 6" /><path d="M12 14.5l3 6" /></svg>
      </button>
    </div>
  );
}

const zoomBtn = { width: 36, height: 36, borderRadius: "50%", border: 0, background: "#FFFFFF", color: "#3A2826", fontSize: 18 } as const;
