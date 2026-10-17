"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { categoryLabel, giftAmountsFromTags, giftPriceLabel, giftQueryAmount, openGiftMax, paragraphs, productBadges, productBlurb, productCardSub, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { BestLoop } from "@/components/best-loop";
import { ProductBadges } from "@/components/cards";
import ProductFAQ from "@/components/contact/ProductFAQ";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";
import { FirstOrderLine } from "@/components/final/FooterAndPromo";
import { usePromoGate } from "@/components/promo/promo-gate";
import { useOliUser } from "@/lib/account-session";

export function ProductView({ product, related, initialGiftAmount }: { product: CatalogProduct; related: CatalogProduct[]; initialGiftAmount?: string }) {
  const { mobile, wide, headerH, add, items } = useSite();
  const user = useOliUser();
  const { openQuiz, finished } = usePromoGate();
  const images = product.media.filter((item) => item.src);
  const giftAmounts = giftAmountsFromTags(product.tags);
  const giftMax = openGiftMax(product.tags);
  const requestedGift = giftQueryAmount(initialGiftAmount, giftAmounts, giftMax);
  const [thumb, setThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [giftAmount, setGiftAmount] = useState(requestedGift?.text ?? "");
  const [giftPick, setGiftPick] = useState<number | "custom" | null>(requestedGift?.pick ?? null);
  const [openAcc, setOpenAcc] = useState(0);
  const [story, setStory] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const relRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const variant = product.variants[0] ?? null;
  const giftChoice = giftPick ?? giftAmounts[0] ?? (giftMax != null ? "custom" : null);
  const giftNumber = Number(giftAmount);
  const giftValue = giftAmount.trim() && Number.isFinite(giftNumber) ? Math.round(giftNumber * 100) / 100 : null;
  const giftReady = giftValue != null && giftValue >= 1 && giftMax != null && giftValue <= giftMax;
  const giftSelected = giftChoice === "custom" ? (giftReady ? giftValue : null) : giftChoice;
  const unit = variant?.price ?? product.price;
  const compareAt = product.compareAt != null && product.compareAt > unit ? product.compareAt : null;
  const bundles = product.bundles;
  const bundle = bundles.find((item) => item.qty === qty) ?? null;
  const isGift = giftAmounts.length > 0 || giftMax != null;
  const line = isGift ? (giftSelected != null ? giftSelected * qty : 0) : bundle ? bundle.price : unit * qty;
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const active = images[thumb] ?? images[0];
  const description = paragraphs(product.description);
  const blurb = productBlurb(product);
  const sections = product.page.panels;
  const featured = product.page.reviews[0];
  const more = product.page.reviews.slice(1);
  const score = reviewScore(product.page.reviews);
  const stories = product.page.stories.filter((item) => item.url);
  const steps = product.page.steps;
  const ingredients = product.page.ingredients;
  const category = categoryLabel(product.category) || "המוצרים של Oli";
  const faq = product.faq;
  const highlights = product.page.highlights.slice(0, 4);
  const fewStories = !mobile && stories.length > 0 && stories.length <= 3;
  const visibleReviews = mobile || showAllReviews || more.length <= 6 ? more : more.slice(0, 6);
  const hiddenReviews = more.length - visibleReviews.length;

  useEffect(() => {
    thumbsRef.current?.querySelector<HTMLElement>(`[data-i="${thumb}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [thumb]);

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

      <section className="product-hero" style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) clamp(44px,9vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,480px),1fr))", gap: "clamp(28px,6vw,56px)", alignItems: "start", minWidth: 0 }}>
        <div className="pg">
          <div className="pg-rail">
            <div className="pg-thumbs" ref={thumbsRef}>
              {(images.length ? images : [{ id: "ph", src: null, kind: "image" as const }]).map((item, index) => (
                <button key={item.id} type="button" data-i={index} onClick={() => setThumb(index)} aria-label={"תמונה " + (index + 1)} style={{ aspectRatio: "4/5", padding: 0, borderRadius: 10, overflow: "hidden", border: "2px solid " + (thumb === index ? "#3A2826" : "transparent"), background: "#F6EEE8" }}>
                  {item.src && item.kind === "video" ? <video src={item.src} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
                  {item.src && item.kind !== "video" ? <span style={{ display: "block", width: "100%", height: "100%", backgroundImage: `url("${item.src}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", mixBlendMode: "darken" }} /> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="pg-main">
            {active?.src && active.kind === "video" ? <video src={active.src} controls playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} /> : null}
            {active?.src && active.kind !== "video" ? <span style={{ position: "absolute", inset: 0, backgroundImage: `url("${active.src}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", mixBlendMode: "darken" }} /> : null}
            {!active?.src ? <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FF, fontSize: "clamp(32px,6vw,56px)", textAlign: "center", padding: 24 }}>{product.title}</span> : null}
            <ProductBadges product={product} />
            {images.length > 1 && (
              <>
                <button type="button" className="pg-nav pg-nav--prev" aria-label="התמונה הקודמת" onClick={() => setThumb((index) => (index - 1 + images.length) % images.length)}>‹</button>
                <button type="button" className="pg-nav pg-nav--next" aria-label="התמונה הבאה" onClick={() => setThumb((index) => (index + 1) % images.length)}>›</button>
                <span className="pg-count">{thumb + 1} / {images.length}</span>
              </>
            )}
          </div>
          <style>{`
            .pg { display:grid; grid-template-columns:72px minmax(0,1fr); gap:14px; position:sticky; top:100px; }
            .pg-main { grid-column:2; grid-row:1; position:relative; aspect-ratio:4/5; border-radius:20px; overflow:hidden; background:#F6EEE8; }
            .pg-rail { grid-column:1; grid-row:1; position:relative; align-self:stretch; min-height:0; }
            .pg-thumbs { position:absolute; inset:0; display:flex; flex-direction:column; gap:10px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#CDB5A8 transparent; }
            .pg-thumbs button { flex:0 0 auto; width:100%; }
            .pg-nav { position:absolute; top:50%; transform:translateY(-50%); width:40px; height:40px; border:0; border-radius:999px; background:rgba(255,255,255,.92); color:#3A2826; font-size:26px; line-height:1; cursor:pointer; box-shadow:0 2px 10px rgba(42,28,26,.12); }
            .pg-nav--prev { right:12px; }
            .pg-nav--next { left:12px; }
            .pg-count { position:absolute; left:14px; bottom:14px; height:28px; padding:0 10px; border-radius:999px; background:rgba(255,255,255,.9); color:#3A2826; font-size:13px; font-weight:600; display:flex; align-items:center; direction:ltr; }
            @media (max-width:767px) {
              .product-hero { overflow-x:clip; }
              .pg { grid-template-columns:minmax(0,1fr); position:relative; top:auto; gap:10px; width:100%; min-width:0; max-width:100%; }
              .pg-main { grid-column:1; grid-row:1; width:100%; min-width:0; }
              .pg-rail { grid-column:1; grid-row:2; height:72px; width:100%; min-width:0; overflow:hidden; }
              .pg-thumbs { position:relative; inset:auto; flex-direction:row; width:100%; height:72px; overflow-x:auto; overflow-y:hidden; }
              .pg-thumbs button { width:58px; height:72px; aspect-ratio:auto; flex:0 0 58px; }
            }
          `}</style>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {product.category.trim() ? <Link href={"/products?cat=" + encodeURIComponent(product.category)} style={{ width: "fit-content", fontSize: 14, fontWeight: 600, color: "#A85A3A" }}>{category}</Link> : null}
            <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(48px,10vw,84px)", lineHeight: 0.95 }}>{product.title}</h1>
            {product.headline.mode === "split" && product.headline.subtitle ? <p style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(20px,3vw,30px)", lineHeight: 1.25, color: "#5E4844", margin: 0 }}>{product.headline.subtitle}</p> : null}
            {productBadges(product).length > 0 && (
              <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {productBadges(product).map((label) => (
                  <span key={label} style={{ background: label === "מבצע" ? "#A85A3A" : "#3A2826", color: "#FFFFFF", borderRadius: 999, padding: "6px 12px", fontSize: 14, fontWeight: 600 }}>{label}</span>
                ))}
              </span>
            )}
            {blurb && blurb !== product.title && blurb !== product.category && <p style={{ fontSize: "clamp(18px,2.4vw,21px)", color: "#5E4844" }}>{blurb}</p>}
            {product.page.reviews.length > 0 && (
              <a href="#reviews" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "#5E4844", marginTop: 4 }}>
                <Stars value={score} />
                {score.toFixed(1)} · {product.page.reviews.length} ביקורות
              </a>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(description.length ? description : [blurb]).filter(Boolean).map((paragraph, index) => (
              <p key={index} style={{ fontSize: 17, lineHeight: 1.7, color: "#5E4844", margin: 0, whiteSpace: "pre-line" }}>{paragraph}</p>
            ))}
          </div>
          {highlights.length > 0 ? (
            <div className="product-highlights" style={{ display: "flex", flexWrap: "wrap", borderTop: "1px solid #EFE4DC", borderBottom: "1px solid #EFE4DC", fontSize: 14, color: "#5E4844" }}>
              {highlights.map((tag, i) => (
                <span key={tag} style={{ flex: "1 1 auto", padding: "14px 8px", textAlign: "center", borderRight: i ? "1px solid #EFE4DC" : undefined }}>{tag}</span>
              ))}
              <style>{`@media (max-width: 767px) { .product-highlights > span:nth-child(n + 4) { display: none !important; } }`}</style>
            </div>
          ) : null}

          {giftAmounts.length > 0 || giftMax != null ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>סכום הכרטיס</span>
              {giftAmounts.length > 0 ? (
                <div role="group" aria-label="בחירת סכום" className="gift-amounts">
                  {giftAmounts.map((amount) => {
                    const on = giftChoice === amount;
                    return (
                      <button key={amount} type="button" aria-pressed={on} onClick={() => setGiftPick(amount)} style={giftTile(on)}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontSize: 15, opacity: 0.7 }}>₪</span>
                          <span style={{ fontFamily: FF, fontSize: 28, fontWeight: 400, letterSpacing: "-.02em" }}>{amount.toLocaleString("en-US")}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {giftMax != null ? (
                giftChoice === "custom" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ ...giftCustomRow, border: "1.5px solid #3A2826", background: "#FFFFFF" }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>סכום אחר</span>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 6, direction: "ltr" }}>
                        <span style={{ fontSize: 15, color: "#A85A3A" }}>₪</span>
                        <input autoFocus inputMode="numeric" value={giftAmount} onChange={(event) => setGiftAmount(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0" aria-label="סכום מותאם אישית" style={{ width: 90, border: 0, background: "transparent", fontFamily: FF, fontSize: 26, letterSpacing: "-.02em", color: "#3A2826", textAlign: "left", outline: "none", padding: 0 }} />
                      </span>
                    </label>
                    <span style={{ fontSize: 13, color: giftAmount && !giftReady ? "#A33A2A" : "#8A6C64" }}>{giftAmount && !giftReady ? `אפשר בין ${fmt(1)} ל־${fmt(giftMax)}` : `כל סכום בין ${fmt(1)} ל־${fmt(giftMax)}`}</span>
                  </div>
                ) : (
                  <button type="button" onClick={() => setGiftPick("custom")} style={{ ...giftCustomRow, border: "1.5px dashed #CDB5A8", background: "transparent", color: "#3A2826" }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>סכום אחר</span>
                    <span style={{ fontSize: 13, color: "#8A6C64" }}>עד {fmt(giftMax)}</span>
                  </button>
                )
              ) : null}
              <style>{`.gift-amounts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; } @media (max-width: 520px) { .gift-amounts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`}</style>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,36px)", letterSpacing: "-.02em" }}>{fmt(unit)}</span>
              {compareAt ? <span style={{ fontSize: 18, color: "#9C847C", textDecoration: "line-through" }}>{fmt(compareAt)}</span> : null}
            </div>
          )}

          {giftAmounts.length === 0 && giftMax == null && bundles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>בחרי כמות</span>
              {bundles.map((item) => {
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
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #CDB5A8", borderRadius: 999 }}>
              <button type="button" onClick={() => setQty((value) => value + 1)} style={qtyBtn}>+</button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} style={qtyBtn}>−</button>
            </div>
            <Hx as="button" onClick={() => {
              if (giftAmounts.length > 0 || giftMax != null) {
                if (giftSelected == null) return;
                add({ id: `${product.id}:gift:${giftSelected}`, name: product.title, sub: `כרטיס מתנה · ${fmt(giftSelected)}`, price: giftSelected, image: productImage(product) }, qty);
                return;
              }
              add({ id: bundle ? `${variant?.id ?? product.id}:x${bundle.qty}` : (variant?.id ?? product.id), name: product.title, sub: bundle ? bundle.label : (variant?.title || blurb), price: bundle ? bundle.price : unit, image: productImage(product) }, bundle ? 1 : qty);
            }} style={{ flex: 1, background: "#3A2826", color: "#FFFFFF", border: 0, borderRadius: 999, fontSize: 17, fontWeight: 600, height: 54, opacity: isGift && giftSelected == null ? 0.4 : 1 }} hover={{ background: "#A85A3A" }}>הוספה לסל{isGift && giftSelected == null ? "" : ` · ${fmt(line)}`}</Hx>
          </div>
          {giftAmounts.length === 0 && giftMax == null ? (
            <>
              <span style={{ fontSize: 14, color: "#6E5650" }}>{cartTotal + line >= 250 ? "✓ מגיע לך משלוח חינם" : "משלוח חינם בהזמנה מעל 250 ש״ח"}</span>
              {!user && !finished && <FirstOrderLine onOpen={openQuiz} />}
            </>
          ) : null}

          {sections.length > 0 && <div style={{ borderTop: "1px solid #EFE4DC" }}>
            {sections.map((section, index) => {
              const open = openAcc === index;
              return (
                <div key={section.title} style={{ borderBottom: "1px solid #EFE4DC" }}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenAcc(open ? -1 : index)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: 0, fontSize: 17, fontWeight: 600, color: "#3A2826", textAlign: "right" }}>
                    {section.title}<span className={open ? "pacc-plus is-open" : "pacc-plus"} aria-hidden>+</span>
                  </button>
                  <div className={open ? "pacc-body is-open" : "pacc-body"}>
                    <div className="pacc-clip">
                      <div className="pacc-inner" style={{ padding: "0 0 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {section.paras.map((text, paraIndex) => <p key={paraIndex} style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844", margin: 0, whiteSpace: "pre-line" }}>{text}</p>)}
                        {section.link ? <PanelLink link={section.link} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
        </div>
      </section>

      {stories.length > 0 && <section style={{ background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", justifyContent: fewStories ? "center" : "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: fewStories ? "center" : "flex-start", textAlign: fewStories ? "center" : "right" }}>
              <h2 style={h2}>אמהות משתמשות</h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#6E5650" }}>סרטונים אמיתיים של אמהות מהקהילה</p>
            </div>
            {fewStories ? null : <span style={{ fontSize: 14, color: "#6E5650" }}>גללי לצד לצפייה</span>}
          </div>
          <div className="no-scroll" style={{ display: "flex", gap: 14, justifyContent: fewStories ? "center" : undefined, overflowX: fewStories ? "visible" : "auto", scrollSnapType: fewStories ? undefined : "x mandatory", margin: fewStories ? undefined : "0 calc(-1 * clamp(16px,4.5vw,32px))", paddingInline: fewStories ? undefined : "clamp(16px,4.5vw,32px)" }}>
            {stories.map((item, index) => (
              <button key={item.handle + index} type="button" onClick={() => setStory(index)} style={{ flex: "0 0 clamp(170px,42vw,240px)", aspectRatio: "9/16", position: "relative", border: 0, padding: 0, borderRadius: 14, overflow: "hidden", background: "#F3E6DE", scrollSnapAlign: "start", color: "#3A2826" }}>
                {isStoryVideo(item.url) ? <video src={item.url} muted playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, paddingLeft: 3 }}>▶</span></span>
                {item.handle ? <span style={{ position: "absolute", right: 12, bottom: 12, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.9)", borderRadius: 999, padding: "6px 12px" }}>{item.handle}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </section>}
      {story !== null && stories[story] && (
        <div onClick={() => setStory(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,20,18,.92)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: 20 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setStory((story + 1) % stories.length); }} style={storyNav}>›</button>
          <div onClick={(e) => e.stopPropagation()} style={{ height: "min(86vh,760px)", aspectRatio: "9/16", position: "relative", borderRadius: 16, overflow: "hidden", background: "#3A2826", color: "#FFFFFF" }}>
            {isStoryVideo(stories[story].url) ? (
              <video key={stories[story].url} src={stories[story].url} controls autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#3A2826" }} />
            ) : (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 15, opacity: 0.8, padding: 24 }}>{stories[story].handle}{stories[story].url ? <a href={stories[story].url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 8, color: "#FFFFFF" }}>לעמוד באינסטגרם</a> : null}</span>
            )}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, fontSize: 14, background: "linear-gradient(rgba(30,20,18,.45), transparent)" }}>
              <span>{story + 1} / {stories.length}</span>
              <button type="button" onClick={() => setStory(null)} style={{ background: "transparent", border: 0, color: "#FFFFFF", fontSize: 24 }}>×</button>
            </div>
            {isStoryVideo(stories[story].url) && stories[story].handle ? <span style={{ position: "absolute", right: 16, bottom: 56, fontSize: 14, fontWeight: 500 }}>{stories[story].handle}</span> : null}
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
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5E4844", margin: 0, whiteSpace: "pre-line" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {ingredients.length > 0 && <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", display: "flex", flexWrap: "wrap", gap: "clamp(20px,5vw,72px)", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: "1 1 300px", alignSelf: "flex-start", position: wide ? "sticky" : "relative", top: wide ? (headerH > 20 ? headerH + 16 : 110) : "auto" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(32px,6.5vw,52px)", lineHeight: 1.05 }}>רכיבי מפתח</h2>
          {product.page.ingredientsIntro ? <p style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844", maxWidth: 380, margin: 0, whiteSpace: "pre-line" }}>{product.page.ingredientsIntro}</p> : null}
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
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#5E4844", paddingRight: 38, margin: 0, whiteSpace: "pre-line" }}>{item.body}</p>
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
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 28, color: "#3A2826", lineHeight: 1 }}>{score.toFixed(1)}</span>
                <Stars value={score} size={15} />
                <span>{product.page.reviews.length} ביקורות</span>
              </div>
            </div>
          </div>
          <figure style={{ margin: 0, display: "grid", gap: 20 }}>
            <Stars value={featured.rating} size={18} />
            {featured.title ? <h3 style={{ margin: 0, fontFamily: FF, fontWeight: 500, fontSize: "clamp(20px,3vw,26px)", lineHeight: 1.3 }}>{featured.title}</h3> : null}
            <blockquote style={{ margin: 0, fontFamily: FF, fontWeight: 400, fontSize: "clamp(24px,4.4vw,40px)", lineHeight: 1.3, letterSpacing: "-.01em", maxWidth: 980, whiteSpace: "pre-line" }}>״{featured.body}״</blockquote>
            <figcaption>
              <ReviewByline review={featured} size={40} />
            </figcaption>
          </figure>
          <div className={mobile ? "no-scroll" : undefined} style={mobile ? { display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -16px", padding: "0 16px 4px" } : { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20 }}>
            {visibleReviews.map((review, index) => (
              <div key={`${review.name}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 10, padding: mobile ? 20 : 24, borderRadius: 16, background: "#F8EFE9", ...(mobile ? { flex: "0 0 82%", scrollSnapAlign: "start" } : null) }}>
                <Stars value={review.rating} size={13} />
                {review.title ? <h3 style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(18px,4.4vw,21px)", lineHeight: 1.3, margin: 0 }}>{review.title}</h3> : null}
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#5E4844", flex: 1, margin: 0, whiteSpace: "pre-line" }}>{review.body}</p>
                <div style={{ paddingTop: 14, borderTop: "1px solid #EFE4DC" }}>
                  <ReviewByline review={review} size={32} />
                </div>
              </div>
            ))}
          </div>
          {hiddenReviews > 0 ? (
            <Hx as="button" onClick={() => setShowAllReviews(true)} style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 12, height: 52, padding: "0 22px 0 8px", borderRadius: 999, border: "1px solid #3A2826", background: "#FFFFFF", color: "#3A2826", fontSize: 16, fontWeight: 600 }} hover={{ background: "#3A2826", color: "#FFFFFF" }}>
              {hiddenReviews === 1 ? "הצג עוד המלצה" : `הצג עוד ${hiddenReviews} המלצות`}
              <span aria-hidden style={{ width: 36, height: 36, borderRadius: "50%", background: "#A85A3A", color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 22, lineHeight: 1 }}>+</span>
            </Hx>
          ) : null}
        </div>
      </section>}

      {faq.length > 0 && <ProductFAQ items={faq} />}

      {related.length > 0 && (
        <section style={{ maxWidth: 1320, margin: "0 auto", padding: mobile ? "44px var(--page-pad) 48px" : "clamp(44px,9vw,80px) clamp(16px,4.5vw,32px)", ["--page-pad" as string]: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <h2 style={h2}>אולי תאהבי גם</h2>
            {!mobile && (
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" aria-label="הקודם" onClick={() => scrollRel(1)} style={relBtn}>→</button>
                <button type="button" aria-label="הבא" onClick={() => scrollRel(-1)} style={relBtn}>←</button>
              </div>
            )}
          </div>
          {mobile ? (
            <BestLoop products={related.slice(0, 8)} onAdd={(item) => add({ id: item.id, name: item.title, sub: productBlurb(item), price: item.price, image: productImage(item) })} />
          ) : (
            <div ref={relRef} className="no-scroll" style={{ display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory" }}>
              {related.slice(0, 8).map((item) => {
                const src = productImage(item);
                const giftLabel = giftPriceLabel(item);
                const old = !giftLabel && item.compareAt && item.compareAt > item.price ? item.compareAt : null;
                return (
                  <div key={item.id} style={{ flex: "0 0 calc((100% - 60px) / 4)", scrollSnapAlign: "start", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    <Link href={productHref(item)} style={{ position: "relative", display: "block", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#F6EEE8" }}>
                      {src && <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} />}
                      <ProductBadges product={item} />
                    </Link>
                    <Link href={productHref(item)} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#3A2826" }}>
                      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                        <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 18 }}>{item.title}</span>
                        <span style={{ fontSize: 14, color: "#6E5650", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{productCardSub(item)}</span>
                      </span>
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{giftLabel ?? fmt(item.price)}{old ? <span style={{ display: "block", fontSize: 12, color: "#9C847C", textDecoration: "line-through", fontWeight: 400 }}>{fmt(old)}</span> : null}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function PanelLink({ link }: { link: { kind: "url" | "article"; label: string; href: string } }) {
  const card: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginTop: 4, padding: "14px 16px", borderRadius: 16, background: "#F8EFE9", color: "#3A2826", textDecoration: "none" };
  const body = (
    <>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1, textAlign: "right" }}>
        <span style={{ fontSize: 12, color: "#A85A3A" }}>{link.kind === "article" ? "מאמר באתר" : "לקריאה נוספת"}</span>
        <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.35 }}>{link.label}</span>
      </span>
      <span aria-hidden style={{ fontSize: 18, flexShrink: 0 }}>←</span>
    </>
  );
  if (/^https:\/\//i.test(link.href)) return <a href={link.href} target="_blank" rel="noreferrer" style={card}>{body}</a>;
  return <Link href={link.href} style={card}>{body}</Link>;
}

function isStoryVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const h2: CSSProperties = { fontFamily: FF, fontWeight: 400, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,40px)", lineHeight: 1.15, margin: 0 };
function giftTile(on: boolean): CSSProperties {
  return {
    height: 84,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 18,
    border: "1px solid " + (on ? "#3A2826" : "#EBDDD3"),
    background: on ? "#3A2826" : "#FBF5F1",
    color: on ? "#FFFFFF" : "#3A2826",
    direction: "ltr",
    transition: "background .2s, color .2s, border-color .2s",
  };
}

const giftCustomRow: CSSProperties = {
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "0 20px",
  borderRadius: 18,
  textAlign: "right",
};

const qtyBtn: CSSProperties = { width: 46, height: 54, border: 0, background: "transparent", fontSize: 20, color: "#3A2826" };
const storyNav: CSSProperties = { width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: "#FFFFFF", fontSize: 20 };
const relBtn: CSSProperties = { width: 44, height: 44, borderRadius: 999, border: 0, background: "#F6EEE8", color: "#3A2826", fontSize: 17 };

function reviewScore(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const score = Math.max(0, Math.min(5, value));
  const filled = Math.round(score);
  return (
    <span aria-label={`${score.toFixed(1)} מתוך 5`} style={{ display: "inline-flex", gap: 1, color: "#A85A3A", fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden>{star <= filled ? "★" : "☆"}</span>)}
    </span>
  );
}

function ReviewByline({ review, size }: { review: { name: string; initial: string; date: string; verified: boolean }; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size > 36 ? 12 : 10, fontSize: size > 36 ? 14 : 13, color: "#6E5650" }}>
      <span style={avatar(size)}>{review.initial}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ color: "#3A2826", fontWeight: 600, fontSize: size > 36 ? 15 : 13 }}>{review.name}</span>
        {review.date || review.verified ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {review.date ? <span>{review.date}</span> : null}
            {review.verified ? <VerifiedCustomer /> : null}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function VerifiedCustomer() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#6E5650", fontSize: 12, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" }}>
      <svg width="14" height="14" viewBox="0 0 22 22" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
        <circle cx="11" cy="11" r="11" fill="#0095F6" />
        <path d="M6.2 11.3 9.4 14.5 15.8 7.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      מאומתת
    </span>
  );
}

function avatar(size: number): CSSProperties {
  return { width: size, height: size, borderRadius: "50%", background: "#F3D9C6", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size > 36 ? 15 : 13, flexShrink: 0 };
}
