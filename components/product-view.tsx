"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ACCORDION, byId, cover, GALLERY, INGREDIENTS, productBg, REVIEWS, TIMELINE } from "@/lib/data";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

const related = ["olineum", "olilax", "facioli", "nippoli", "bestof", "olibox"].map(byId);
const featured = REVIEWS[0];
const more = REVIEWS.slice(1);
const UNIT = 129;

export function ProductView() {
  const { mobile, wide, add } = useSite();
  const [thumb, setThumb] = useState(0);
  const [bundle, setBundle] = useState(0);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(0);
  const [relIdx, setRelIdx] = useState(0);
  const relRef = useRef<HTMLDivElement>(null);
  const total = bundle === 1 ? qty * 2 : qty;
  const line = UNIT * total;

  const scrollRel = (dir: number) => {
    const el = relRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <main>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) 0", fontSize: 14, color: "#8A6C64", display: "flex", gap: 8 }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span>
        <Link href="/products?cat=preg" style={{ color: "#8A6C64" }}>הריון</Link><span>/</span>
        <span style={{ color: "#3A2826" }}>Olilastic</span>
      </div>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) clamp(44px,9vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,480px),1fr))", gap: "clamp(28px,6vw,56px)", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "clamp(52px,13vw,72px) minmax(0,1fr)", gap: "clamp(8px,2vw,14px)", position: mobile ? "relative" : "sticky", top: mobile ? "auto" : 100 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GALLERY.map((src, i) => (
              <button key={i} type="button" onClick={() => setThumb(i)} style={{ width: "100%", aspectRatio: "4/5", padding: 0, borderRadius: 10, overflow: "hidden", border: "2px solid " + (thumb === i ? "#3A2826" : "transparent"), background: "#F3E4D8" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
              </button>
            ))}
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, overflow: "hidden", background: "#F3E4D8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={cover(GALLERY[thumb])} />
            {thumb === 3 && (
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 72 }}>Olilastic</span>
                <span style={{ fontSize: 13, letterSpacing: ".16em" }}>STRETCH MARK BUTTER · 100 ML</span>
                <span style={{ fontSize: 12, color: "#8A6C64", marginTop: 18 }}>[ צילום מוצר ]</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>STRETCH MARK BUTTER</span>
            <h1 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(40px,10vw,60px)", lineHeight: 1 }}>Olilastic</h1>
            <p style={{ fontFamily: FF, fontWeight: 500, fontSize: 24 }}>חמאה למניעה וטשטוש סימני מתיחה</p>
            <a href="#reviews" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "#5E4844", marginTop: 4 }}><span style={{ color: "#A85A3A", letterSpacing: 2 }}>★★★★★</span>5.0 · 44 ביקורות</a>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5E4844", textWrap: "pretty" }}>משפרת את האלסטיות של העור, מסייעת במניעת סימני מתיחה, ובהפחתת נראות של סימני מתיחה קיימים.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["✦ ללא בישום", "✦ ללא אלכוהול", "✦ באישור משרד הבריאות", "100 ml"].map((t) => (
              <span key={t} style={{ fontSize: 13, padding: "7px 12px", borderRadius: 999, background: "#F3E2D5" }}>{t}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>בחרי כמות</span>
            {[
              { t: "חמאה אחת", sub: "100 ml", p: fmt(UNIT) },
              { t: "זוג חמאות", sub: "הנחה ברכישת שתי חמאות", p: fmt(UNIT * 2) },
            ].map((b, i) => {
              const on = bundle === i;
              return (
                <button key={b.t} type="button" onClick={() => setBundle(i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 14, border: "1.5px solid " + (on ? "#3A2826" : "#E1CDC0"), background: on ? "#FFFFFF" : "transparent", color: "#3A2826", textAlign: "right" }}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3A2826", boxShadow: on ? "inset 0 0 0 4px #FFFFFF" : "none", background: on ? "#3A2826" : "transparent" }} />
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{b.t}</span>
                      <span style={{ fontSize: 13, color: "#6E5650" }}>{b.sub}</span>
                    </span>
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{b.p}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #CDB5A8", borderRadius: 999 }}>
              <button type="button" onClick={() => setQty((q) => q + 1)} style={qtyBtn}>+</button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} style={qtyBtn}>−</button>
            </div>
            <Hx as="button" onClick={() => add(total, "Olilastic")} style={{ flex: 1, background: "#3A2826", color: "#FBF5EF", border: 0, borderRadius: 999, fontSize: 17, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>הוספה לסל · {fmt(line)}</Hx>
          </div>
          <span style={{ fontSize: 14, color: "#6E5650" }}>{line >= 250 ? "✓ ההזמנה זכאית למשלוח חינם" : "עוד " + fmt(250 - line) + " למשלוח חינם"}</span>

          <div style={{ borderTop: "1px solid #EADBCF" }}>
            {ACCORDION.map((a, i) => (
              <div key={a.t} style={{ borderBottom: "1px solid #EADBCF" }}>
                <button type="button" onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: 0, fontSize: 17, fontWeight: 600, color: "#3A2826", textAlign: "right" }}>
                  {a.t}<span style={{ fontSize: 20, fontWeight: 300 }}>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 0 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {a.p.map((t) => <p key={t} style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844" }}>{t}</p>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: mobile ? "8px 16px" : "16px clamp(20px,4.5vw,40px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#F3E2D5", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ padding: "clamp(44px,9vw,80px) clamp(20px,4.5vw,40px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>הוראות שימוש</span>
            <h2 style={h2}>מתי להתחיל?</h2>
          </div>
          <div style={mobile ? { display: "flex", flexDirection: "column", borderRight: "2px solid #3A2826", marginRight: 6 } : { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", borderTop: "2px solid #3A2826" }}>
            {TIMELINE.map((s) => (
              <div key={s.when} style={mobile ? { display: "flex", flexDirection: "column", gap: 6, padding: "0 26px 30px 0", position: "relative" } : { display: "flex", flexDirection: "column", gap: 10, padding: "28px 0 0 24px", position: "relative" }}>
                <span style={mobile ? { position: "absolute", top: 6, right: -9, width: 16, height: 16, borderRadius: "50%", background: "#3A2826", boxShadow: "0 0 0 4px #F3E2D5" } : { position: "absolute", top: -9, right: 0, width: 16, height: 16, borderRadius: "50%", background: "#3A2826", boxShadow: "0 0 0 4px #F3E2D5" }} />
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(22px,5.5vw,28px)", lineHeight: 1.2 }}>{s.when}</span>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5E4844" }}>{s.what}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexWrap: "wrap", gap: "clamp(20px,5vw,72px)", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: "1 1 300px", position: wide ? "sticky" : "relative", top: wide ? 110 : "auto" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.02em", fontSize: "clamp(32px,6.5vw,52px)", lineHeight: 1.05 }}>רכיבי מפתח</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844", maxWidth: 380, textWrap: "pretty" }}>ארבעה רכיבים טבעיים, נבחרו בשיתוף רופאים וכימאים.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #DCC3B3", flex: "999 1 560px", minWidth: 0 }}>
          {INGREDIENTS.map((i) => (
            <div key={i.n} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "8px clamp(20px,4vw,48px)", padding: "clamp(20px,3.5vw,30px) 0", borderTop: "1px solid #DCC3B3", alignItems: "baseline" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ fontSize: 13, color: "#A85A3A", fontWeight: 600, minWidth: 24 }}>{i.n}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(28px,4.4vw,40px)", letterSpacing: "-.02em", lineHeight: 1.05, direction: "ltr", textAlign: "right" }}>{i.en}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#6E5650" }}>{i.he}</h3>
                </div>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#5E4844", textWrap: "pretty", paddingRight: 38 }}>{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" style={{ padding: mobile ? "8px 16px" : "16px clamp(20px,4.5vw,40px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#FFFFFF", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ padding: "clamp(44px,9vw,88px) clamp(20px,4.5vw,40px)", display: "flex", flexDirection: "column", gap: "clamp(28px,5vw,48px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "20px 40px", paddingBottom: "clamp(20px,4vw,32px)", borderBottom: "1px solid #EADBCF" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ ...h2, fontSize: "clamp(28px,6.5vw,44px)", lineHeight: 1.05 }}>לקוחות ממליצות</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 14, color: "#6E5650" }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 28, color: "#3A2826", lineHeight: 1 }}>5.0</span>
                <span style={{ color: "#A85A3A", letterSpacing: 2, fontSize: 15 }}>★★★★★</span>
                <span>44 ביקורות · 43 מתוכן 5 כוכבים</span>
              </div>
            </div>
            <Hx as="button" style={{ background: "#3A2826", color: "#FBF5EF", border: 0, padding: "13px 24px", borderRadius: 999, fontSize: 14, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>כתיבת ביקורת</Hx>
          </div>
          <figure style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "20px clamp(28px,6vw,72px)", alignItems: "start" }}>
            <blockquote style={{ margin: 0, fontFamily: FF, fontWeight: 500, fontSize: "clamp(24px,4.4vw,40px)", lineHeight: 1.3, letterSpacing: "-.01em", color: "#3A2826", textWrap: "pretty", gridColumn: "1/-1", maxWidth: 980 }}>״{featured.body}״</blockquote>
            <figcaption style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#6E5650" }}>
              <span style={avatar(40)}>{featured.initial}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ color: "#3A2826", fontWeight: 600, fontSize: 15 }}>{featured.name}</span><span>{featured.meta}</span></span>
            </figcaption>
          </figure>
          <div style={mobile ? { display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", margin: "0 -16px", padding: "0 16px 4px", scrollPaddingInline: 16 } : { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
            {more.map((r) => (
              <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 10, padding: mobile ? 20 : 24, borderRadius: 16, background: "#FBF5EF", flex: mobile ? "0 0 82%" : "initial", scrollSnapAlign: "start", minWidth: 0 }}>
                <span style={{ color: "#A85A3A", letterSpacing: 2, fontSize: 13 }}>★★★★★</span>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(18px,4.4vw,21px)", lineHeight: 1.3 }}>{r.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#5E4844", flex: 1 }}>{r.body}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6E5650", paddingTop: 14, borderTop: "1px solid #EADBCF" }}>
                  <span style={{ ...avatar(32), fontSize: 13, flexShrink: 0 }}>{r.initial}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}><span style={{ color: "#3A2826", fontWeight: 600, fontSize: 14 }}>{r.name}</span><span>{r.meta}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <h2 style={h2}>אולי תאהבי גם</h2>
          {!mobile ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Hx as="button" onClick={() => scrollRel(1)} aria-label="הקודם" style={arrow} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>→</Hx>
              <Hx as="button" onClick={() => scrollRel(-1)} aria-label="הבא" style={arrow} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>←</Hx>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{ width: relIdx === i ? 18 : 6, height: 6, borderRadius: 3, background: relIdx === i ? "#3A2826" : "#D8C3B6", transition: "all .3s" }} />
              ))}
            </div>
          )}
        </div>
        <div ref={relRef} className="no-scroll" onScroll={(e) => {
          const el = e.currentTarget;
          const step = el.clientWidth / 2;
          const i = Math.round(Math.abs(el.scrollLeft) / step);
          if (i !== relIdx) setRelIdx(i);
        }} style={mobile ? { display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -16px", padding: "0 16px 4px", scrollPaddingInline: 16 } : { display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", scrollBehavior: "smooth" }}>
          {related.map((p) => {
            const v = productBg(p);
            return (
              <div key={p.id} style={mobile ? { display: "flex", flexDirection: "column", gap: 12, alignSelf: "stretch", flex: "0 0 calc(50% - 6px)", scrollSnapAlign: "start", minWidth: 0 } : { display: "flex", flexDirection: "column", gap: 12, flex: "0 0 calc(25% - 15px)", scrollSnapAlign: "start", minWidth: 0 }}>
                <Link href="/product" style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#F3E4D8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={v.bgStyle} />
                  {v.noImg && <span style={{ position: "relative", fontFamily: FF, fontWeight: 500, fontSize: 36 }}>{p.name}</span>}
                </Link>
                {mobile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: "#6E5650", lineHeight: 1.4, minHeight: "2.8em" }}>{p.sub}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{fmt(p.price)}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                      <span style={{ fontFamily: FF, fontSize: "clamp(17px,4.4vw,22px)", fontWeight: 500, lineHeight: 1.2 }}>{p.name}</span>
                      <span style={{ fontSize: 14, color: "#6E5650", lineHeight: 1.4 }}>{p.sub}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1.2 }}>{fmt(p.price)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const h2: CSSProperties = { fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,40px)", margin: 0 };
const qtyBtn: CSSProperties = { width: 46, height: 54, border: 0, background: "transparent", fontSize: 20, color: "#3A2826" };
const arrow: CSSProperties = { width: 44, height: 44, borderRadius: 999, border: "1px solid #CDB5A8", background: "transparent", color: "#3A2826", fontSize: 18 };

function avatar(size: number): CSSProperties {
  return { width: size, height: size, borderRadius: "50%", background: size > 36 ? "#F3D9C6" : "#F3E2D5", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 };
}
