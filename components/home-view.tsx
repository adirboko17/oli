"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { VALUES } from "@/lib/data";
import { paragraphs, productBlurb, productHref, productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { BestLoop, ProductTile } from "@/components/best-loop";
import { ProductBadges } from "@/components/cards";
import GiftCardSection from "@/components/gift-card/GiftCardSection";
import PodcastsSection from "@/components/podcasts/PodcastsSection";
import { Hx } from "@/components/hx";
import { IconInstagram } from "@/components/icons";
import { useSite } from "@/components/site";

const W = "https://static.wixstatic.com/media/";
const shot = (id: string, w = 600, h = 600) => `${W}${id}/v1/fill/w_${w},h_${h},al_c,q_85,enc_auto/file.jpg`;
const IG = [
  "db159b_bfe0061609ae4274a93b6491dd07ed08~mv2.jpg",
  "db159b_6beb68bce7684106a7dbbf14bd9bf408~mv2.jpeg",
  "db159b_512f372ce1bd443da5fe477b0e544113~mv2.jpeg",
  "db159b_d83a36f5d9db48899f80d8c01a7f4c55~mv2.jpg",
  "db159b_85acba9ecd6d486285d017a9ce4307ac~mv2.jpg",
  "db159b_c3fca06807e24db585466c46f69e0b36~mv2.jpg",
].map((id) => shot(id));
const EXPERTISE = shot("db159b_85acba9ecd6d486285d017a9ce4307ac~mv2.jpg", 1600, 900);
const OLILASTIC = "https://static.wixstatic.com/media/db159b_c6044a549cea41979a5612ff7b19c347~mv2.jpeg/v1/fill/w_900,h_1125,al_c,q_85,enc_auto/file.jpg";

const STAGES = [
  { n: "01", title: "הריון", desc: "מסימני מתיחה ועד רגליים עייפות, טיפוח בטוח לכל טרימסטר.", img: "/assets/stage-preg.png", test: /הריון/ },
  { n: "02", title: "לידה ואחרי", desc: "הכנה ללידה, הנקה והשבועות הראשונים.", img: "/assets/stage-birth.png", test: /לידה|אחרי/ },
  { n: "03", title: "מתנות ליולדת", desc: "מארזים מפנקים, מוכנים למסירה.", img: "/assets/stage-gift.png", wide: true, test: /מתנ/ },
  { n: "04", title: "תינוקות", desc: "קו הטיפוח הראשון שלנו לתינוקות. רכיבים טבעיים, בלי סבונים.", img: "/assets/stage-baby.png", flat: true, test: /תינוק|baby|olimini/i },
];

const MINI = [
  { id: "pre", name: "Pre & Shower Ritual", sub: "מרקם רחצה לתינוקות", price: 69, img: "/assets/olimini-pre-cut.png", test: /pre\s*(&|and)?\s*shower|מרקם רחצה/i },
  { id: "spa", name: "Baby Spa Ritual", sub: "קרם עיסוי לתינוק", price: 59, old: 74, img: "/assets/olimini-spa-cut.png", big: true, test: /baby spa|spa ritual/i },
  { id: "after", name: "After Shower Ritual", sub: "קרם לחות לתינוק", price: 69, img: "/assets/olimini-after-cut.png", test: /after shower/i },
];

const PILLARS = [
  { n: "01", t: "ידע רפואי", d: "המוצרים פותחו בשיתוף רופאים בכירים וכימאים, על בסיס המומחיות הרפואית של המשפחה." },
  { n: "02", t: "רכיבים טבעיים", d: "שמנים וחומרי גלם טבעיים באיכות גבוהה, שנבחרו בקפידה עבור עור בהריון ואחרי לידה." },
  { n: "03", t: "בטוח, יעיל ומפנק", d: "מוצרים שבטוחים לשימוש בהריון ולאחר לידה, הוכחו כיעילים ונעימים לשימוש יומיומי." },
];

const h2: CSSProperties = { fontFamily: FF, fontWeight: 400, letterSpacing: "-.01em", lineHeight: 1.05, fontSize: "clamp(34px,6.5vw,60px)" };

function findProduct(products: CatalogProduct[], test: RegExp) {
  return products.find((p) => test.test(`${p.title} ${p.category} ${p.tags.join(" ")}`)) ?? null;
}

function Waves({ flip }: { flip?: boolean }) {
  const paths = [40, 66, 92, 118, 144, 170, 196, 222, 248];
  return (
    <svg aria-hidden viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, [flip ? "top" : "bottom"]: 0, width: "100%", height: flip ? "clamp(100px,14vw,180px)" : "clamp(160px,22vw,300px)", pointerEvents: "none", opacity: flip ? 0.22 : 0.34, transform: flip ? "scaleY(-1)" : undefined }}>
      {paths.map((y, i) => (
        <path key={y} d={`M-20 ${y} C 240 ${y - 70}, 480 ${y + 70}, 720 ${y} S 1200 ${y - 70}, 1460 ${y}`} fill="none" stroke="#E9CDBD" strokeWidth="1" opacity={0.9 - i * 0.07} />
      ))}
    </svg>
  );
}

export function HomeView() {
  const { mobile, products, collections, add } = useSite();
  const [why, setWhy] = useState(0);
  const [mini, setMini] = useState(0);
  const [miniHover, setMiniHover] = useState<string | null>(null);
  const [gift, setGift] = useState(0);
  const [giftFade, setGiftFade] = useState(false);

  const kick = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.loop = true;
    el.playsInline = true;
    const visible = () => el.getClientRects().length > 0;
    if (!visible()) {
      el.pause();
      return;
    }
    if (el.paused) el.play()?.catch(() => {});
  }, []);

  useEffect(() => {
    const sync = () => document.querySelectorAll<HTMLVideoElement>(".home video").forEach((el) => kick(el));
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [kick]);

  const stages = STAGES.map((stage) => {
    if (stage.title === "תינוקות") return { ...stage, href: "/olimini", count: "3 מוצרים" };
    const collection = collections.find((item) => stage.test.test(item.title));
    const count = collection ? products.filter((product) => collection.productIds.includes(product.id)).length : 0;
    const href = collection ? "/products?cat=" + encodeURIComponent(collection.title.trim()) : "/products";
    return { ...stage, href, count: count ? `${count} ${stage.title === "מתנות ליולדת" ? "מארזים" : "מוצרים"}` : "למוצרים" };
  });
  const giftCollection = collections.find((item) => /מתנ/.test(item.title));

  const featured = findProduct(products, /olilastic|מתיחה/i) ?? products[0] ?? null;
  const best = products.slice(0, 4);
  const gifts = useMemo(() => products.filter((p) => /מתנ|gift|מארז/i.test(`${p.category} ${p.title} ${p.tags.join(" ")}`)).slice(0, 6), [products]);

  useEffect(() => {
    if (!mobile) return;
    const t = window.setInterval(() => setMini((i) => (i + 1) % 3), 3200);
    return () => window.clearInterval(t);
  }, [mobile]);

  useEffect(() => {
    if (gifts.length < 2) return;
    const t = window.setInterval(() => {
      setGiftFade(true);
      window.setTimeout(() => {
        setGift((i) => (i + 1) % gifts.length);
        setGiftFade(false);
      }, 220);
    }, 4500);
    return () => window.clearInterval(t);
  }, [gifts.length]);

  const giftMain = gifts[gift] ?? null;
  const giftSide = gifts.filter((_, i) => i !== gift).slice(0, 2);

  return (
    <main className="home">
      <section className="hero-desk" style={{ position: "relative", overflow: "hidden", background: "#FFFFFF", minHeight: "min(86vh,800px)", alignItems: "center" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "56%" }}>
          <video ref={kick} src="/assets/about-video.mp4" autoPlay muted loop playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to left,#FFFFFF 0%,rgba(255,255,255,.6) 14%,rgba(255,255,255,0) 38%)", pointerEvents: "none" }} />
          <span style={{ position: "absolute", inset: "auto 0 0 0", height: "18%", background: "linear-gradient(to top,#FFFFFF,rgba(255,255,255,0))", pointerEvents: "none" }} />
        </div>
        <div style={{ position: "relative", maxWidth: 1320, width: "100%", margin: "0 auto", padding: "clamp(40px,6vw,80px) var(--page-pad)" }}>
          <HeroCopy />
        </div>
      </section>

      <section className="hero-mob" style={{ background: "#FFFFFF", paddingBottom: 56 }}>
        <div style={{ position: "relative", height: "min(54vh,440px)", overflow: "hidden", margin: 0, borderRadius: 0 }}>
          <video ref={kick} src="/assets/about-video.mp4" autoPlay muted loop playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
          <span style={{ position: "absolute", inset: "auto 0 0 0", height: "62%", background: "linear-gradient(to top,#FFFFFF 0%,rgba(255,255,255,.92) 22%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />
        </div>
        <div style={{ position: "relative", marginTop: -72, padding: "0 var(--page-pad)", display: "flex", flexDirection: "column", gap: 18 }}>
          <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.035em", fontSize: "clamp(40px,10.5vw,56px)", lineHeight: 1.02, textWrap: "balance" }}>טיפוח בטוח למסע היקר של ההריון ולאחריו</h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#5E4844", maxWidth: 460 }}>פיתחנו סדרה של מוצרים בשיתוף רופאים בכירים וכימאים, שבטוחים לשימוש בהריון ולאחר לידה והוכחו כיעילים.</p>
          <HeroLinks />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", padding: "14px 0", borderTop: "1px solid #EFE4DC", borderBottom: "1px solid #EFE4DC", marginTop: 6 }}>
            {["באישור\nמשרד הבריאות", "מבוסס\nמחקרים מדעיים", "לא נוסה\nעל בעלי חיים"].map((label, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4px 6px", fontSize: 12, lineHeight: 1.35, color: "#5E4844", whiteSpace: "pre-line", borderRight: i ? "1px solid #EFE4DC" : undefined }}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="stages-desk" style={{ maxWidth: 1320, margin: "0 auto", paddingInline: "var(--page-pad)", paddingBottom: "clamp(64px,10vw,128px)" }}>
        <SectionHead title="לכל שלב במסע" text="מהטרימסטר הראשון ועד השבועות הראשונים עם התינוק, מוצרים שנבחרו לכל שלב." href="/products" link="לכל המוצרים" />
        <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #EFE4DC" }}>
          {stages.map((s) => (
            <Hx key={s.n} as={Link} href={s.href} style={stageRow} hover={{ background: "#F8EFE9" }}>
              <span style={{ gridArea: "n", fontSize: 13, color: "#8A6C64", justifySelf: "start" }}>{s.n}</span>
              <h3 style={{ gridArea: "t", fontFamily: FF, fontWeight: 400, letterSpacing: "-.035em", fontSize: "clamp(26px,3.4vw,46px)", lineHeight: 1, textAlign: "right", justifySelf: "start" }}>{s.title}</h3>
              <div style={{ gridArea: "d", display: "flex", flexDirection: "column", gap: 6, maxWidth: 380 }}>
                <p style={{ fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.55, color: "#5E4844" }}>{s.desc}</p>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.count} ←</span>
              </div>
              <div style={{ gridArea: "i", position: "relative", aspectRatio: "1/1", borderRadius: 16, background: "#F6EEE8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={cut(s.img, !!s.wide, !!s.flat)} />
              </div>
            </Hx>
          ))}
        </div>
      </section>

      <section className="stages-mob" style={{ background: "#F8EFE9", padding: "44px var(--page-pad) 48px", marginBottom: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.03em", fontSize: 34, lineHeight: 1.05 }}>לכל שלב במסע</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5E4844" }}>מהטרימסטר הראשון ועד השבועות הראשונים עם התינוק, מוצרים שנבחרו לכל שלב.</p>
        </div>
        <div className="no-scroll bleed-row" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
          {stages.map((s) => (
            <Link key={s.n} href={s.href} style={{ flex: "0 0 calc(100% - var(--page-pad) - 88px)", scrollSnapAlign: "start", display: "flex", flexDirection: "column", gap: 14, color: "#3A2826", minWidth: 0 }}>
              <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={cut(s.img, !!s.wide, !!s.flat)} />
                <span style={{ position: "absolute", top: 14, right: 16, fontSize: 12, color: "#8A6C64" }}>{s.n}</span>
                <span style={{ position: "absolute", bottom: 12, left: 12, width: 38, height: 38, borderRadius: "50%", background: "#3A2826", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>←</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: 22, lineHeight: 1.15 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5E4844" }}>{s.desc}</p>
                <span style={{ fontSize: 13, color: "#8A6C64", marginTop: 2 }}>{s.count}</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ paddingTop: 22 }}><Link href="/products" style={{ fontSize: 15, paddingBottom: 3, borderBottom: "1px solid currentColor" }}>לכל המוצרים</Link></div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", paddingInline: "var(--page-pad)", paddingBottom: "clamp(64px,10vw,128px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(32px,6vw,88px)", alignItems: "center" }}>
        <div style={{ position: "relative", aspectRatio: "4/5", maxHeight: 640, width: "100%", borderRadius: 24, overflow: "hidden", background: "#F6EEE8" }}>
          <img src={EXPERTISE} alt="מוצרי Oli" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(22px,3vw,32px)" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.03em", fontSize: "clamp(36px,5.4vw,68px)", lineHeight: 1, textWrap: "balance" }}>המומחיות של Oli</h2>
          <p style={{ fontSize: "clamp(17px,1.8vw,20px)", lineHeight: 1.65, color: "#3A2826", maxWidth: 520 }}>אופיר וליאור, בנותיו של גניקולוג, גדלו לצד רפואת נשים. כשחיפשו מוצרי טיפוח להריון וללידה שיהיו גם בטוחים וגם טבעיים, גילו שכמעט אין כאלה, ולכן יצרו את Oli.</p>
          <div className="exp-row no-scroll">
            {PILLARS.map((p) => (
              <div key={p.n} className="exp-item">
                <span style={{ fontSize: 13, color: "#8A6C64" }}>{p.n}</span>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(19px,2vw,22px)", lineHeight: 1.2 }}>{p.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5E4844" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", overflow: "hidden", background: "radial-gradient(120% 80% at 50% 78%,#FFFFFF 0%,#F7EFEA 55%,#EFE3DB 100%)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(48px,7vw,88px) var(--page-pad) 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".24em", color: "#A85A3A" }}>חדש</span>
          <h2 style={{ width: "min(92vw,720px)", margin: 0, lineHeight: 0 }}><img src="/assets/olimini-logo.svg" alt="olimini" style={{ display: "block", width: "100%", height: "auto" }} /></h2>
          <p style={{ fontSize: "clamp(15px,1.6vw,18px)", lineHeight: 1.6, color: "#5E4844", maxWidth: 520 }}>קו הטיפוח הראשון שלנו לתינוקות. רכיבים טבעיים, בלי סבונים, פרפום ופתלטים.</p>
        </div>
        <div className="mini-desk" style={{ position: "relative", maxWidth: 940, margin: "0 auto", padding: "clamp(8px,2vw,20px) clamp(8px,3vw,32px) clamp(48px,7vw,80px)" }}>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", alignItems: "end", gap: "clamp(0px,1vw,16px)" }}>
            {MINI.map((item) => {
              const match = findProduct(products, item.test);
              const price = match ? match.price : item.price;
              const old = match?.compareAt && match.compareAt > match.price ? match.compareAt : item.old;
              const hot = miniHover === item.id;
              return (
                <Link key={item.id} href={match ? productHref(match) : "/products"} onMouseEnter={() => setMiniHover(item.id)} onMouseLeave={() => setMiniHover(null)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(14px,2vw,22px)", color: "#3A2826" }}>
                  <div style={{ position: "relative", width: item.big ? "112%" : "100%", aspectRatio: "1/1", marginBottom: item.big ? "-2%" : 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <span style={{ position: "absolute", left: "28%", right: "28%", bottom: "5%", height: "7%", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(58,40,38,.22),transparent)", filter: "blur(4px)" }} />
                    <span role="img" aria-label={item.name} style={{ position: "relative", width: "100%", height: "84%", backgroundImage: `url("${item.img}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center bottom", transformOrigin: "center bottom", transform: hot ? "scale(1.08)" : "scale(1)", transition: "transform .6s cubic-bezier(.2,.8,.2,1)" }} />
                  </div>
                  <BottleCaption name={item.name} sub={item.sub} price={fmt(price)} old={old ? fmt(old) : ""} />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mini-mob" onTouchStart={(e) => { (e.currentTarget as HTMLElement).dataset.x = String(e.changedTouches[0].clientX); }} onTouchEnd={(e) => {
          const start = Number((e.currentTarget as HTMLElement).dataset.x || 0);
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 30) setMini((i) => (i + (dx > 0 ? 1 : 2)) % 3);
        }} style={{ position: "relative", height: "clamp(420px,118vw,520px)", marginTop: 24, overflow: "hidden" }}>
          {MINI.map((item, k) => {
            const d = ((k - mini + 4) % 3) - 1;
            const on = d === 0;
            const match = findProduct(products, item.test);
            const price = match ? match.price : item.price;
            return (
              <Link key={item.id} href={match ? productHref(match) : "/products"} style={{ position: "absolute", top: 0, left: "50%", width: "64%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "#3A2826", textAlign: "center", transform: `translateX(calc(-50% + ${-d * 78}%)) scale(${on ? 1 : 0.72})`, transformOrigin: "center 60%", opacity: on ? 1 : 0.5, zIndex: on ? 2 : 1, pointerEvents: on ? "auto" : "none", transition: "transform .8s cubic-bezier(.65,0,.25,1), opacity .6s ease" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "18px 0 22px" }}>
                  <span style={{ position: "absolute", left: "30%", right: "30%", bottom: 16, height: 14, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(58,40,38,.2),transparent)", filter: "blur(3px)" }} />
                  <span role="img" aria-label={item.name} style={{ position: "relative", width: "78%", height: "92%", backgroundImage: `url("${item.img}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center bottom" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: on ? 1 : 0, transition: "opacity .4s ease" }}>
                  <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 19, lineHeight: 1.2, direction: "ltr", whiteSpace: "nowrap" }}>{item.name}</span>
                  <span style={{ fontSize: 13, color: "#6E5650" }}>{item.sub}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{fmt(price)}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mini-dots" style={{ justifyContent: "center", gap: 8, padding: "4px 0 44px" }}>
          {MINI.map((item, i) => (
            <button key={item.name} type="button" aria-label={item.name} onClick={() => setMini(i)} style={{ width: mini === i ? 22 : 7, height: 7, borderRadius: 99, border: 0, padding: 0, background: mini === i ? "#3A2826" : "#D8C3B6", transition: "all .35s" }} />
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: mobile ? "column-reverse" : "column" }}>
        <section style={{ width: "100%", maxWidth: 1320, margin: "0 auto", paddingInline: "var(--page-pad)", paddingTop: mobile ? 8 : "clamp(64px,10vw,128px)", paddingBottom: mobile ? 56 : "clamp(64px,10vw,128px)" }}>
          <SectionHead title="המומלצים שלנו" href="/products" link="לכל המוצרים של Oli" />
          {best.length === 0 ? <p style={{ color: "#5E4844" }}>אין כרגע מוצרים פעילים.</p> : mobile ? (
            <BestLoop products={best} onAdd={(p) => add({ id: p.id, name: p.title, sub: productBlurb(p), price: p.price, image: productImage(p) })} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(calc(50% - 7px),240px),1fr))", gap: "clamp(28px,5vw,40px) clamp(12px,3vw,20px)" }}>
              {best.map((p) => <ProductTile key={p.id} p={p} onAdd={() => add({ id: p.id, name: p.title, sub: productBlurb(p), price: p.price, image: productImage(p) })} />)}
            </div>
          )}
        </section>

        {featured && (
          <section style={{ width: "100%", maxWidth: 1320, margin: "0 auto", padding: mobile ? "48px var(--page-pad) 40px" : "0 var(--page-pad) clamp(64px,10vw,128px)" }}>
            <div style={{ background: "#F8EFE9", borderRadius: 24, padding: "clamp(16px,2.4vw,28px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(24px,5vw,72px)", alignItems: "center" }}>
              <Link href={productHref(featured)} style={{ position: "relative", display: "block", aspectRatio: "4/3", width: "100%", borderRadius: 18, overflow: "hidden", background: "#FFFFFF" }}>
                <img src={productImage(featured) || OLILASTIC} alt={featured.title} style={{ position: "absolute", top: "8%", left: "8%", width: "84%", height: "84%", objectFit: "contain", mixBlendMode: "darken" }} />
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 500, padding: "clamp(4px,2vw,24px) 0" }}>
                <span style={{ fontSize: 14, color: "#8A6C64" }}>{featured.title}</span>
                <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.025em", fontSize: "clamp(26px,2.8vw,38px)", lineHeight: 1.15, textWrap: "balance" }}>{/מתיחה|olilastic/i.test(featured.title) ? "טיפול בסימני מתיחה בהריון, זאת המומחיות שלנו" : featured.title}</h2>
                {featured.page.reviews.length > 0 ? <FeaturedRating product={featured} /> : null}
                {featuredExcerpt(featured) ? <p style={{ fontSize: 16, lineHeight: 1.75, color: "#5E4844", margin: 0, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-line" }}>{featuredExcerpt(featured)}</p> : null}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid #E6D6CB" }}>
                  <span style={{ fontSize: 20, fontWeight: 500 }}>{fmt(featured.price)}</span>
                  <Link href={productHref(featured)} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600 }}>
                    <span style={{ paddingBottom: 3, borderBottom: "1px solid currentColor" }}>לפרטים על המוצר</span>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #3A2826", display: "flex", alignItems: "center", justifyContent: "center" }}>←</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <section style={{ position: "relative", overflow: "hidden", background: "#FBF5F1", color: "#3A2826" }}>
        <Waves />
        <Waves flip />
        <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,9vw,112px) var(--page-pad)", display: "flex", flexDirection: "column", gap: "clamp(32px,5vw,56px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1, fontSize: "clamp(40px,7vw,64px)" }}>למה Oli</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#5E4844" }}>אנו שמות את רווחת האימהות והתינוקות שלהן בראש סדר העדיפויות. המוצרים שלנו נועדו לפנק אתכן האימהות, בעודם משלבים בתוכם תכונות רפואיות מועילות.</p>
          </div>
          <div className="why-desk" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", borderTop: "1px solid #3A2826" }}>
            {VALUES.map((v, k) => (
              <div key={v.n} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "24px 22px 8px", borderLeft: k < VALUES.length - 1 ? "1px solid #E6D2C6" : 0 }}>
                <span style={{ fontSize: 13, letterSpacing: ".08em", color: "#A85A3A" }}>{v.n}</span>
                <h3 style={{ fontFamily: FF, fontWeight: 400, fontSize: 26, lineHeight: 1.15 }}>{v.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#5E4844" }}>{v.d}</p>
              </div>
            ))}
          </div>
          <div className="why-mob" style={{ flexDirection: "column", borderTop: "1px solid #3A2826" }}>
            {VALUES.map((v, k) => {
              const open = why === k;
              return (
                <div key={v.n} style={{ borderBottom: "1px solid #E6D2C6" }}>
                  <button type="button" onClick={() => setWhy(open ? -1 : k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 0", border: 0, background: "transparent", color: "#3A2826", textAlign: "right" }}>
                    <span style={{ fontSize: 12, letterSpacing: ".08em", color: "#A85A3A", width: 22 }}>{v.n}</span>
                    <span style={{ flex: 1, fontFamily: FF, fontWeight: 400, fontSize: 24 }}>{v.t}</span>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #E1CABD", display: "flex", alignItems: "center", justifyContent: "center", transform: open ? "rotate(45deg)" : "none", transition: "transform .35s" }}>+</span>
                  </button>
                  <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .4s ease" }}>
                    <p style={{ overflow: "hidden", fontSize: 15, lineHeight: 1.65, color: "#5E4844", padding: open ? "0 36px 20px 0" : "0 36px 0 0", margin: 0 }}>{v.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {giftMain && (
        <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,9vw,112px) var(--page-pad) clamp(64px,10vw,128px)" }}>
          <SectionHead title={giftCollection?.title.trim() || "מתנות ליולדת"} text="מארזים מפנקים, מוכנים למסירה." href={giftCollection ? "/products?cat=" + encodeURIComponent(giftCollection.title.trim()) : "/products"} link="לכל המארזים" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(28px,5vw,64px)", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, opacity: giftFade ? 0 : 1, transform: giftFade ? "translateY(8px)" : "none", transition: "opacity .45s ease, transform .45s ease" }}>
              <Link href={productHref(giftMain)} style={{ display: "flex", flexDirection: "column", gap: 18, color: "#3A2826" }}>
                <div style={{ position: "relative", aspectRatio: "5/4", borderRadius: 20, overflow: "hidden", background: "#F6EEE8" }}>
                  {productImage(giftMain) && <img src={productImage(giftMain)!} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.05 }}>{giftMain.title}</span>
                    <SalePrice price={giftMain.price} compareAt={giftMain.compareAt} size={16} />
                  </div>
                  <span style={{ background: "#3A2826", color: "#FFFFFF", padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>לצפייה במארז</span>
                </div>
              </Link>
              <div style={{ display: "flex", gap: 6 }}>
                {gifts.map((p, i) => (
                  <button key={p.id} type="button" aria-label={p.title} onClick={() => setGift(i)} style={{ width: gift === i ? 28 : 8, height: 3, borderRadius: 2, border: 0, padding: 0, background: gift === i ? "#3A2826" : "#D8C3B6" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {giftSide.map((p) => (
                <button key={p.id} type="button" className="gift-side" onClick={() => setGift(gifts.indexOf(p))} style={{ display: "grid", gridTemplateColumns: "clamp(96px,22vw,150px) minmax(0,1fr)", gap: "clamp(16px,3vw,24px)", alignItems: "center", padding: "clamp(16px,2.5vw,22px) 0", borderBottom: "1px solid #EFE4DC", color: "#3A2826", background: "transparent", textAlign: "right", borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                  <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 14, overflow: "hidden", background: "#F6EEE8" }}>
                    {productImage(p) && <img src={productImage(p)!} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} />}
                  </div>
                  <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(18px,2.2vw,22px)" }}>{p.title}</span>
                    <SalePrice price={p.price} compareAt={p.compareAt} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <GiftCardSection />

      <PodcastsSection />

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(8px,2vw,24px) var(--page-pad) clamp(64px,10vw,112px)", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(24px,4vw,40px)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <a href="https://instagram.com/oli_safecare" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#A85A3A", direction: "ltr" }}>@oli_safecare</a>
          <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(30px,5vw,48px)" }}>Oli באינסטגרם</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#6E5650", maxWidth: 420 }}>רגעים קטנים מהמסע, טיפים ומה שחדש אצלנו</p>
        </div>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(30%,150px),1fr))", gap: "clamp(6px,1vw,12px)" }}>
          {IG.map((src) => (
            <a key={src} href="https://instagram.com/oli_safecare" target="_blank" rel="noreferrer" aria-label="פוסט באינסטגרם" style={{ position: "relative", aspectRatio: "1/1", borderRadius: "clamp(10px,1.4vw,16px)", overflow: "hidden", background: "#F6EEE8" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </a>
          ))}
        </div>
        <a href="https://instagram.com/oli_safecare" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 22px", borderRadius: 999, border: "1px solid #CDB5A8", fontSize: 15, fontWeight: 500 }}>
          <IconInstagram />
          לעקוב אחרינו
        </a>
      </section>

      <style>{`
        .home { --page-pad: clamp(16px, 4.5vw, 32px); }
        .hero-desk { display: flex; }
        .hero-mob, .stages-mob, .mini-mob, .why-mob, .mini-dots { display: none; }
        .exp-row { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 28px; }
        .exp-item { display: flex; flex-direction: column; gap: 10px; padding-top: 18px; border-top: 1px solid #3A2826; }
        .why-desk { display: grid; }
        @media (max-width: 767px) {
          .home { --page-pad: 28px; }
          .hero-desk, .stages-desk, .mini-desk, .why-desk { display: none !important; }
          .hero-mob, .stages-mob { display: block !important; }
          .mini-mob { display: block !important; }
          .mini-dots { display: flex !important; }
          .why-mob { display: flex !important; }
          .gift-side:last-child { border-bottom: 0 !important; }
          .exp-row, .bleed-row { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; margin-inline: calc(var(--page-pad) * -1); scroll-padding-inline-start: var(--page-pad); padding-bottom: 4px; }
          .exp-row::after, .bleed-row::after { content: ""; flex: 0 0 calc(var(--page-pad) + 48px); }
          .exp-item, .bleed-row > a, .bleed-row > div { margin-inline-start: var(--page-pad); }
          .exp-item { flex: 0 0 calc(100% - var(--page-pad) - 88px); scroll-snap-align: start; border-top: 0; border-radius: 16px; background: #F8EFE9; padding: 20px 18px 22px; }
        }
      `}</style>
    </main>
  );
}

function HeroCopy() {
  return (
    <div style={{ maxWidth: "min(600px,48%)", display: "flex", flexDirection: "column", gap: "clamp(20px,2.6vw,30px)" }}>
      <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.035em", fontSize: "clamp(48px,6vw,92px)", lineHeight: 1, textWrap: "balance" }}>טיפוח בטוח למסע היקר של ההריון ולאחריו</h1>
      <p style={{ fontSize: "clamp(16px,1.6vw,19px)", lineHeight: 1.7, color: "#5E4844", maxWidth: 460 }}>פיתחנו סדרה של מוצרים בשיתוף רופאים בכירים וכימאים, שבטוחים לשימוש בהריון ולאחר לידה והוכחו כיעילים.</p>
      <HeroLinks />
      <div style={{ display: "flex", gap: "8px 24px", flexWrap: "wrap", paddingTop: 18, borderTop: "1px solid #EFE4DC", fontSize: 14, color: "#6E5650" }}>
        <span>באישור משרד הבריאות</span><span>מבוסס מחקרים מדעיים</span><span>לא נוסה על בעלי חיים</span>
      </div>
    </div>
  );
}

function HeroLinks() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
      <Hx as={Link} href="/products" style={{ background: "#3A2826", color: "#FFFFFF", border: 0, padding: "17px 32px", borderRadius: 999, fontSize: 16, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>למוצרים של Oli</Hx>
      <Link href="/products" style={{ fontSize: 15, paddingBottom: 3, borderBottom: "1px solid currentColor" }}>מתנות ליולדת</Link>
    </div>
  );
}

function SalePrice({ price, compareAt, size = 15 }: { price: number; compareAt: number | null; size?: number }) {
  const old = compareAt != null && compareAt > price ? compareAt : null;
  return (
    <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ fontWeight: 600, fontSize: size }}>{fmt(price)}</span>
      {old ? <span style={{ fontSize: Math.max(12, size - 2), color: "#9C847C", textDecoration: "line-through" }}>{fmt(old)}</span> : null}
    </span>
  );
}

function SectionHead({ title, text, href, link }: { title: string; text?: string; href: string; link: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 40px", flexWrap: "wrap", marginBottom: "clamp(24px,4vw,44px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 620 }}>
        <h2 style={h2}>{title}</h2>
        {text && <p style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.65, color: "#5E4844" }}>{text}</p>}
      </div>
      <Link href={href} style={{ fontSize: 15, paddingBottom: 3, borderBottom: "1px solid currentColor", whiteSpace: "nowrap" }}>{link}</Link>
    </div>
  );
}

function FeaturedRating({ product }: { product: CatalogProduct }) {
  const reviews = product.page.reviews;
  const score = Math.max(0, Math.min(5, reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length));
  const quote = reviews.find((review) => review.title.trim());
  return (
    <Hx as={Link} href={productHref(product) + "#reviews"} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 14px 8px 12px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #EAD8CC", boxShadow: "0 6px 18px rgba(168,90,58,.08)", color: "#3A2826", fontSize: 13, lineHeight: 1.2, transition: "transform .3s ease, box-shadow .3s ease" }} hover={{ transform: "translateY(-1px)", boxShadow: "0 10px 24px rgba(168,90,58,.14)", color: "#3A2826" }}>
      <span aria-label={`${score.toFixed(1)} מתוך 5`} style={{ display: "inline-flex", gap: 1, color: "#A85A3A", fontSize: 14, letterSpacing: 1 }}>
        {[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden>{star <= Math.round(score) ? "★" : "☆"}</span>)}
      </span>
      <span style={{ fontWeight: 700 }}>{score.toFixed(1)}</span>
      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#C9A08A" }} aria-hidden />
      <span style={{ color: "#6E5650" }}>{reviews.length} ביקורות</span>
      {quote ? <span style={{ color: "#8A6C64", fontStyle: "italic", maxWidth: 190, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>״{quote.title.trim()}״</span> : null}
    </Hx>
  );
}

function featuredExcerpt(product: CatalogProduct) {
  return paragraphs(product.description)[0]?.trim()
    || (product.headline.mode === "split" ? product.headline.subtitle.trim() : "");
}

function BottleCaption({ name, sub, price, old }: { name: string; sub: string; price: string; old?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: "clamp(96px,11vw,120px)" }}>
      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(15px,1.8vw,20px)", lineHeight: 1.2, direction: "ltr" }}>{name}</span>
      <span style={{ fontSize: "clamp(12px,1.3vw,14px)", color: "#6E5650" }}>{sub}</span>
      <span style={{ display: "flex", gap: 8, alignItems: "baseline", marginTop: 4 }}>
        <span style={{ fontSize: "clamp(14px,1.5vw,16px)", fontWeight: 600 }}>{price}</span>
        {old ? <span style={{ fontSize: 13, color: "#9C847C", textDecoration: "line-through" }}>{old}</span> : null}
      </span>
    </div>
  );
}

const stageRow: CSSProperties = { display: "grid", alignItems: "center", color: "#3A2826", borderTop: "1px solid #EFE4DC", gridTemplateColumns: "36px minmax(0,1fr) minmax(0,1.2fr) 104px", gridTemplateAreas: '"n t d i"', gap: "clamp(16px,2.6vw,40px)", padding: "16px 12px", transition: "background .3s" };
function cut(src: string, wide: boolean, flat: boolean): CSSProperties {
  return {
    position: "relative",
    width: wide ? "84%" : flat ? "72%" : undefined,
    height: wide || flat ? undefined : "78%",
    aspectRatio: wide ? "1450/1080" : flat ? "1115/1330" : "1140/1425",
    backgroundImage: `url("${src}")`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    mixBlendMode: "multiply",
    filter: "drop-shadow(0 22px 22px rgba(58,40,38,.16))",
  };
}
