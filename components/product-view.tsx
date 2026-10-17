"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { categoryLabel, productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

export function ProductView({ product, related }: { product: CatalogProduct; related: CatalogProduct[] }) {
  const { mobile, wide, headerH, add, items } = useSite();
  const images = product.media.filter((item) => item.src);
  const [thumb, setThumb] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState(0);
  const [story, setStory] = useState<number | null>(null);
  const relRef = useRef<HTMLDivElement>(null);
  const variant = product.variants.find((item) => item.id === variantId) ?? null;
  const unit = variant?.price ?? product.price;
  const bundle = product.bundles.find((item) => item.qty === qty) ?? null;
  const line = bundle ? bundle.price : unit * qty;
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const active = images[thumb] ?? images[0];
  const description = product.description.split("\n").map((part) => part.trim()).filter(Boolean);
  const blurb = productBlurb(product);
  const sections = product.page.panels;
  const choices = product.variants.length > 0
    ? product.variants.map((item) => ({ id: item.id, title: item.title || "יחידה", sub: item.sku || "", price: item.price ?? product.price }))
    : [{ id: product.id, title: "יחידה", sub: "", price: product.price }];
  const featured = product.page.reviews[0];
  const more = product.page.reviews.slice(1);
  const stories = product.page.stories;
  const steps = product.page.steps;
  const ingredients = product.page.ingredients;
  const category = categoryLabel(product.category) || "המוצרים של Oli";

  function scrollRel(dir: number) {
    relRef.current?.scrollBy({ left: dir * (relRef.current.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <main>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) 0", fontSize: 14, color: "#8A6C64", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span>
        <Link href={"/products?cat=" + encodeURIComponent(product.category)} style={{ color: "#8A6C64" }}>{category}</Link><span>/</span>
        <span style={{ color: "#3A2826" }}>{product.title}</span>
      </div>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) clamp(44px,9vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,480px),1fr))", gap: "clamp(28px,6vw,56px)", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "clamp(52px,13vw,72px) minmax(0,1fr)", gap: "clamp(8px,2vw,14px)", position: mobile ? "relative" : "sticky", top: mobile ? "auto" : 100 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(images.length ? images : [{ id: "ph", src: null, kind: "image" as const }]).map((item, index) => (
              <button key={item.id} type="button" onClick={() => setThumb(index)} style={{ width: "100%", aspectRatio: "4/5", padding: 0, borderRadius: 10, overflow: "hidden", border: "2px solid " + (thumb === index ? "#3A2826" : "transparent"), background: "#F6EEE8" }}>
                {item.src && item.kind === "video" ? <video src={item.src} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
                {item.src && item.kind !== "video" ? <span style={{ display: "block", width: "100%", height: "100%", backgroundImage: `url("${item.src}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", mixBlendMode: "darken" }} /> : null}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, overflow: "hidden", background: "#F6EEE8" }}>
            {active?.src && active.kind === "video" ? <video src={active.src} controls playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} /> : null}
            {active?.src && active.kind !== "video" ? <span style={{ position: "absolute", inset: 0, backgroundImage: `url("${active.src}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", mixBlendMode: "darken" }} /> : null}
            {!active?.src ? <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FF, fontSize: "clamp(32px,6vw,56px)", textAlign: "center", padding: 24 }}>{product.title}</span> : null}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(48px,10vw,84px)", lineHeight: 0.95 }}>{product.title}</h1>
            {blurb && blurb !== product.title && <p style={{ fontSize: "clamp(18px,2.4vw,21px)", color: "#5E4844" }}>{blurb}</p>}
            {product.page.reviews.length > 0 && (
              <a href="#reviews" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "#5E4844", marginTop: 4 }}>
                <span style={{ color: "#A85A3A", letterSpacing: 2 }}>★★★★★</span>5.0 · {product.page.reviews.length} ביקורות
              </a>
            )}
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5E4844" }}>{description[0] || blurb}</p>
          <div style={{ display: "flex", flexWrap: "wrap", borderTop: "1px solid #EFE4DC", borderBottom: "1px solid #EFE4DC", fontSize: 14, color: "#5E4844" }}>
            {(product.tags.length ? product.tags.slice(0, 4) : ["ללא בישום", "ללא אלכוהול", "באישור משרד הבריאות", "100 ml"]).map((tag, i) => (
              <span key={tag} style={{ flex: "1 1 auto", padding: "14px 0", textAlign: "center", borderRight: i ? "1px solid #EFE4DC" : undefined }}>{tag}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>בחרי כמות</span>
            {product.bundles.length > 0 ? product.bundles.map((item) => {
              const on = bundle?.qty === item.qty;
              const regular = unit * item.qty;
              const saving = Math.round((regular - item.price) * 100) / 100;
              return (
                <button key={item.qty} type="button" onClick={() => setQty(item.qty)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 14, border: "1.5px solid " + (on ? "#3A2826" : "#E1CDC0"), background: on ? "#FFFFFF" : "transparent", color: "#3A2826", textAlign: "right" }}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3A2826", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A2826" }} />}</span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{item.label}</span>
                      {saving > 0 ? <span style={{ fontSize: 13, fontWeight: 600, color: "#A85A3A" }}>חיסכון {fmt(saving)}</span> : null}
                    </span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{fmt(item.price)}</span>
                    {saving > 0 ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{fmt(regular)}</span> : null}
                  </span>
                </button>
              );
            }) : choices.map((choice) => {
              const on = choice.id === (variant?.id ?? product.id);
              return (
                <button key={choice.id} type="button" onClick={() => setVariantId(choice.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 14, border: "1.5px solid " + (on ? "#3A2826" : "#E1CDC0"), background: on ? "#FFFFFF" : "transparent", color: "#3A2826", textAlign: "right" }}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3A2826", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A2826" }} />}</span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{choice.title}</span>
                      {choice.sub && <span style={{ fontSize: 13, color: "#6E5650" }}>{choice.sub}</span>}
                    </span>
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{fmt(choice.price)}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #CDB5A8", borderRadius: 999 }}>
              <button type="button" onClick={() => setQty((value) => value + 1)} style={qtyBtn}>+</button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} style={qtyBtn}>−</button>
            </div>
            <Hx as="button" onClick={() => add({ id: bundle ? `${variant?.id ?? product.id}:x${bundle.qty}` : (variant?.id ?? product.id), name: product.title, sub: bundle ? bundle.label : (variant?.title || blurb), price: bundle ? bundle.price : unit, image: productImage(product) }, bundle ? 1 : qty)} style={{ flex: 1, background: "#3A2826", color: "#FFFFFF", border: 0, borderRadius: 999, fontSize: 17, fontWeight: 600, height: 54 }} hover={{ background: "#A85A3A" }}>הוספה לסל · {fmt(line)}</Hx>
          </div>
          <span style={{ fontSize: 14, color: "#6E5650" }}>{cartTotal + line >= 250 ? "✓ מגיע לך משלוח חינם" : "משלוח חינם בהזמנה מעל 250 ש״ח"}</span>

          {sections.length > 0 && <div style={{ borderTop: "1px solid #EFE4DC" }}>
            {sections.map((section, index) => {
              const open = openAcc === index;
              return (
                <div key={section.title} style={{ borderBottom: "1px solid #EFE4DC" }}>
                  <button type="button" onClick={() => setOpenAcc(open ? -1 : index)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: 0, fontSize: 17, fontWeight: 600, color: "#3A2826", textAlign: "right" }}>
                    {section.title}<span style={{ fontSize: 20, fontWeight: 300 }}>{open ? "–" : "+"}</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 0 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {section.paras.map((text) => <p key={text} style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844" }}>{text}</p>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>}
        </div>
      </section>

      {stories.length > 0 && <section style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <h2 style={h2}>אמהות משתמשות</h2>
            <span style={{ fontSize: 14, color: "#6E5650" }}>גללי לצד לצפייה</span>
          </div>
          <div className="no-scroll" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 calc(-1 * clamp(16px,4.5vw,32px))", paddingInline: "clamp(16px,4.5vw,32px)" }}>
            {stories.map((item, index) => (
              <button key={item.handle + index} type="button" onClick={() => setStory(index)} style={{ flex: "0 0 clamp(170px,42vw,240px)", aspectRatio: "9/16", position: "relative", border: 0, padding: 0, borderRadius: 14, overflow: "hidden", background: "#F3E6DE", scrollSnapAlign: "start", color: "#3A2826" }}>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, paddingLeft: 3 }}>▶</span></span>
                <span style={{ position: "absolute", right: 12, bottom: 12, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.9)", borderRadius: 999, padding: "6px 12px" }}>{item.handle}</span>
              </button>
            ))}
          </div>
        </div>
      </section>}
      {story !== null && stories[story] && (
        <div onClick={() => setStory(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,20,18,.92)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: 20 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setStory((story + 1) % stories.length); }} style={storyNav}>›</button>
          <div onClick={(e) => e.stopPropagation()} style={{ height: "min(86vh,760px)", aspectRatio: "9/16", borderRadius: 16, background: "#3A2826", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 16, color: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
              <span>{story + 1} / {stories.length}</span>
              <button type="button" onClick={() => setStory(null)} style={{ background: "transparent", border: 0, color: "#FFFFFF", fontSize: 24 }}>×</button>
            </div>
            <span style={{ textAlign: "center", fontSize: 15, opacity: 0.8 }}>{stories[story].handle}{stories[story].url ? <a href={stories[story].url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 8, color: "#FFFFFF" }}>לעמוד באינסטגרם</a> : null}</span>
            <span />
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); setStory((story + stories.length - 1) % stories.length); }} style={storyNav}>‹</button>
        </div>
      )}

      {steps.length > 0 && <section style={{ background: "#F8EFE9" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <h2 style={h2}>מתי להתחיל?</h2>
          <div style={mobile ? { display: "flex", flexDirection: "column", borderRight: "2px solid #3A2826", marginRight: 6 } : { display: "grid", gridTemplateColumns: `repeat(${steps.length},minmax(0,1fr))`, borderTop: "2px solid #3A2826" }}>
            {steps.map((step, index) => (
              <div key={`${step.title}-${index}`} style={mobile ? { display: "flex", flexDirection: "column", gap: 6, padding: "0 26px 30px 0", position: "relative" } : { display: "flex", flexDirection: "column", gap: 10, padding: "28px 0 0 24px", position: "relative" }}>
                <span style={mobile ? { position: "absolute", top: 6, right: -9, width: 16, height: 16, borderRadius: "50%", background: "#3A2826", border: "3px solid #F8EFE9" } : { position: "absolute", top: -9, right: 0, width: 16, height: 16, borderRadius: "50%", background: "#3A2826", border: "3px solid #F8EFE9" }} />
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(24px,5.5vw,32px)", lineHeight: 1.15 }}>{step.title}</span>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5E4844" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {ingredients.length > 0 && <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexWrap: "wrap", gap: "clamp(20px,5vw,72px)", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: "1 1 300px", alignSelf: "flex-start", position: wide ? "sticky" : "relative", top: wide ? (headerH > 20 ? headerH + 16 : 110) : "auto" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(32px,6.5vw,52px)", lineHeight: 1.05 }}>רכיבי מפתח</h2>
          {product.page.ingredientsIntro ? <p style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844", maxWidth: 380 }}>{product.page.ingredientsIntro}</p> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #EFE4DC", flex: "999 1 560px", minWidth: 0 }}>
          {ingredients.map((item, index) => (
            <div key={`${item.en}-${item.he}-${index}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "8px clamp(20px,4vw,48px)", padding: "clamp(20px,3.5vw,30px) 0", borderTop: "1px solid #EFE4DC", alignItems: "baseline" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ fontSize: 13, color: "#A85A3A", fontWeight: 600, minWidth: 24 }}>{String(index + 1).padStart(2, "0")}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(30px,4.4vw,44px)", letterSpacing: "-.01em", lineHeight: 1.05, direction: "ltr", textAlign: "right" }}>{item.en}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#6E5650" }}>{item.he}</h3>
                </div>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#5E4844", paddingRight: 38 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>}

      {featured && <section id="reviews" style={{ background: "#FFFFFF", borderTop: "1px solid #EFE4DC", borderBottom: "1px solid #EFE4DC" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,88px) clamp(16px,4.5vw,32px)", display: "flex", flexDirection: "column", gap: "clamp(28px,5vw,48px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "20px 40px", paddingBottom: "clamp(20px,4vw,32px)", borderBottom: "1px solid #EFE4DC" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={h2}>לקוחות ממליצות</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 14, color: "#6E5650" }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 28, color: "#3A2826", lineHeight: 1 }}>5.0</span>
                <span style={{ color: "#A85A3A", letterSpacing: 2, fontSize: 15 }}>★★★★★</span>
                <span>{product.page.reviews.length} ביקורות</span>
              </div>
            </div>
          </div>
          <figure style={{ margin: 0, display: "grid", gap: 20 }}>
            <blockquote style={{ margin: 0, fontFamily: FF, fontWeight: 400, fontSize: "clamp(24px,4.4vw,40px)", lineHeight: 1.3, letterSpacing: "-.01em", maxWidth: 980 }}>״{featured.body}״</blockquote>
            <figcaption style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#6E5650" }}>
              <span style={avatar(40)}>{featured.initial}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ color: "#3A2826", fontWeight: 600, fontSize: 15 }}>{featured.name}</span><span>{featured.meta}</span></span>
            </figcaption>
          </figure>
          <div className={mobile ? "no-scroll" : undefined} style={mobile ? { display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -16px", padding: "0 16px 4px" } : { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
            {more.map((review) => (
              <div key={review.name + review.title} style={{ display: "flex", flexDirection: "column", gap: 10, padding: mobile ? 20 : 24, borderRadius: 16, background: "#F8EFE9", ...(mobile ? { flex: "0 0 82%", scrollSnapAlign: "start" } : null) }}>
                <span style={{ color: "#A85A3A", letterSpacing: 2, fontSize: 13 }}>★★★★★</span>
                <h3 style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(18px,4.4vw,21px)", lineHeight: 1.3 }}>{review.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#5E4844", flex: 1 }}>{review.body}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6E5650", paddingTop: 14, borderTop: "1px solid #EFE4DC" }}>
                  <span style={avatar(32)}>{review.initial}</span>
                  <span style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#3A2826", fontWeight: 600 }}>{review.name}</span><span>{review.meta}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {related.length > 0 && (
        <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <h2 style={h2}>אולי תאהבי גם</h2>
            {!mobile && (
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" aria-label="הקודם" onClick={() => scrollRel(1)} style={relBtn}>→</button>
                <button type="button" aria-label="הבא" onClick={() => scrollRel(-1)} style={relBtn}>←</button>
              </div>
            )}
          </div>
          <div ref={relRef} className="no-scroll" style={{ display: "flex", gap: mobile ? 12 : 20, overflowX: "auto", scrollSnapType: "x mandatory" }}>
            {related.slice(0, 8).map((item) => {
              const src = productImage(item);
              const old = item.compareAt && item.compareAt > item.price ? item.compareAt : null;
              return (
                <div key={item.id} style={{ flex: mobile ? "0 0 calc(50% - 6px)" : "0 0 calc((100% - 60px) / 4)", scrollSnapAlign: "start", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <Link href={productHref(item)} style={{ position: "relative", display: "block", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#F6EEE8" }}>
                    {src && <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} />}
                  </Link>
                  <Link href={productHref(item)} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#3A2826" }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 18 }}>{item.title}</span>
                      <span style={{ fontSize: 14, color: "#6E5650", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productBlurb(item)}</span>
                    </span>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(item.price)}{old ? <span style={{ display: "block", fontSize: 12, color: "#9C847C", textDecoration: "line-through", fontWeight: 400 }}>{fmt(old)}</span> : null}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

const h2: CSSProperties = { fontFamily: FF, fontWeight: 400, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,40px)", lineHeight: 1.15, margin: 0 };
const qtyBtn: CSSProperties = { width: 46, height: 54, border: 0, background: "transparent", fontSize: 20, color: "#3A2826" };
const storyNav: CSSProperties = { width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: "#FFFFFF", fontSize: 20 };
const relBtn: CSSProperties = { width: 44, height: 44, borderRadius: 999, border: 0, background: "#F6EEE8", color: "#3A2826", fontSize: 17 };

function avatar(size: number): CSSProperties {
  return { width: size, height: size, borderRadius: "50%", background: "#F3D9C6", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size > 36 ? 15 : 13, flexShrink: 0 };
}
