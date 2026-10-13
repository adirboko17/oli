"use client";

import Link from "next/link";
import { useCallback, type CSSProperties } from "react";
import { VALUES } from "@/lib/data";
import { categoryGroups, productBlurb, productHref, productImage } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { CatalogCard, GiftCard } from "@/components/cards";
import { Hx } from "@/components/hx";
import { useSite } from "@/components/site";

export function HomeView() {
  const { mobile, products } = useSite();
  const groups = categoryGroups(products);
  const lead = products[0];
  const leadImage = lead ? productImage(lead) : null;
  const gifts = products.filter((product) => /מתנ|gift/i.test(`${product.category} ${product.tags.join(" ")}`));
  const aboutVid = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.loop = true;
    el.playsInline = true;
    const kick = () => {
      if (el.paused) {
        const q = el.play();
        if (q) q.catch(() => {});
      }
    };
    if (!el.dataset.oli) {
      el.dataset.oli = "1";
      el.addEventListener("ended", () => { el.currentTime = 0; kick(); });
      el.addEventListener("pause", () => setTimeout(kick, 50));
      el.addEventListener("stalled", kick);
      el.addEventListener("waiting", () => setTimeout(kick, 500));
      document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
    }
    kick();
  }, []);

  return (
    <main>
      <section style={{ position: "relative", overflow: "hidden", background: "#FBF5EF" }}>
        <div className="hero-grid" style={{ position: "relative", maxWidth: 1320, margin: "0 auto", padding: "clamp(32px,6vw,64px) clamp(16px,4.5vw,32px) clamp(48px,8vw,88px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: "clamp(24px,5vw,56px)", alignItems: "center" }}>
          <div className="hero-copy" style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,3vw,26px)", maxWidth: 560 }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>ELEVATE YOUR SAFE CARE</span>
            <h1 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.02em", fontSize: "clamp(38px,5.6vw,76px)", lineHeight: 1.04, textWrap: "balance" }}>טיפוח בטוח למסע היקר של ההריון ולאחריו</h1>
            <p style={{ fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.65, color: "#5E4844", textWrap: "pretty" }}>פיתחנו סדרה של מוצרים בשיתוף רופאים בכירים וכימאים, שבטוחים לשימוש בהריון ולאחר לידה והוכחו כיעילים.</p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
              <Hx as={Link} href="/products" style={primary} hover={{ background: "#A85A3A" }}>לכל המוצרים</Hx>
            </div>
          </div>
          <div className="hero-product" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "clamp(220px,48vw,600px)" }}>
            <img src="/assets/olineum-hero.png" alt="Olineum שמן עיסוי להריון" style={{ position: "relative", width: "min(100%,600px,72vw)", height: "auto", mixBlendMode: "multiply", filter: "drop-shadow(0 30px 30px rgba(58,40,38,.18))" }} />
          </div>
        </div>
        <style>{`
          @media (max-width: 759px) {
            .hero-product { order: -1; }
          }
        `}</style>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px,4.5vw,32px) clamp(48px,9vw,88px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(20px,4vw,28px)", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={h2}>לכל שלב במסע</h2>
            <p style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.6, color: "#5E4844", maxWidth: 520, textWrap: "pretty" }}>מהטרימסטר הראשון ועד השבועות הראשונים עם התינוק, מוצרים שנבחרו לכל שלב.</p>
          </div>
          <Link href="/products" style={{ fontSize: 15, borderBottom: "1px solid currentColor" }}>לכל המוצרים</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(10px,2vw,20px)" }}>
          {(groups.length ? groups : [{ key: "all", count: 0 }]).map((group) => (
            <Hx key={group.key} as={Link} href={group.key === "all" ? "/products" : "/products?cat=" + encodeURIComponent(group.key)} style={stageCard(mobile)} hover={{ transform: "translateY(-4px)" }}>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "clamp(4px,1vw,8px)" }}>
                <h3 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(26px,6vw,34px)" }}>{group.key === "all" ? "הקטלוג" : group.key}</h3>
                <span style={{ fontSize: 14, fontWeight: 600, marginTop: "clamp(4px,1.5vw,10px)" }}>{group.count ? group.count + " מוצרים" : "אין מוצרים פעילים"} ←</span>
              </div>
            </Hx>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(24px,5vw,48px) clamp(16px,4.5vw,32px) clamp(56px,9vw,96px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(28px,6vw,56px)", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>הריונית יקרה, אולי כאן בשבילך</span>
          <h2 style={{ ...h2, fontSize: "clamp(28px,6.5vw,44px)", lineHeight: 1.1 }}>מי אנחנו</h2>
          <p style={body}>אולי סייף קר הוקמה על ידי אופיר וליאור, בנותיו של גניקולוג, בעלות מחויבות איתנה לבריאות האישה. המודעות הגוברת שלהן למחסור במוצרים להריון ובמוצרי טיפוח ללידה, בטוחים וטבעיים, הובילה אותן ליצור את אולי.</p>
          <p style={body}>על ידי מינוף המומחיות הרפואית של אביהן והתשוקה שלהן למוצרים בעלי רכיבים טבעיים- Oli שואפת לספק מוצרי טיפוח אישי בטוחים, יעילים ומפנקים הנותנים מענה לצרכיהן של נשים במהלך ההריון ולאחריו.</p>
        </div>
        <div style={{ position: "relative", aspectRatio: "16/9", width: "100%", borderRadius: 24, overflow: "hidden", background: "#EBD3C4" }}>
          <video ref={aboutVid} src="/assets/about-video.mp4" autoPlay muted loop playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </section>

      <section style={{ padding: mobile ? "8px 16px 28px" : "8px clamp(20px,4.5vw,40px) 16px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#3A2826", color: "#F6E6DA", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ maxWidth: mobile ? 1320 : 1160, margin: "0 auto", padding: mobile ? "clamp(36px,8vw,56px) clamp(16px,4.5vw,28px)" : "52px 40px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(280px, 420px) minmax(0, 1fr)", gap: mobile ? "clamp(28px,6vw,64px)" : 44, alignItems: "center" }}>
          <div style={{ aspectRatio: mobile ? "1/1" : "4/5", borderRadius: mobile ? 16 : 22, overflow: "hidden", background: "#4A3532", position: "relative", width: "100%", maxWidth: 420, justifySelf: "center", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            {leadImage ? <img src={leadImage} alt={lead?.title ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(28px,4vw,42px)", textAlign: "center" }}>{lead ? lead.title : "הקטלוג"}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 24 : 18 }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#E3A783", fontWeight: 600 }}>{lead ? "מהחנות" : "הקטלוג"}</span>
            <h2 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: mobile ? "clamp(34px,4vw,52px)" : "clamp(30px,2.5vw,42px)", lineHeight: 1.15, textWrap: "balance" }}>{lead ? lead.title : "אין כרגע מוצרים פעילים"}</h2>
            <p style={{ fontSize: mobile ? 18 : 17, lineHeight: 1.65, color: "#E6D2C6", textWrap: "pretty" }}>{lead ? productBlurb(lead) : "מוצרים פעילים מהחנות יופיעו כאן."}</p>
            {lead && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <Hx as={Link} href={productHref(lead)} style={{ background: "#F3D9C6", color: "#3A2826", border: 0, padding: mobile ? "16px 30px" : "14px 26px", borderRadius: 999, fontSize: mobile ? 16 : 15.5, fontWeight: 600 }} hover={{ background: "#FBF5EF" }}>לפרטים · {fmt(lead.price)}</Hx>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(48px,9vw,88px) clamp(16px,4.5vw,32px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <h2 style={h2}>המומלצים שלנו</h2>
          <Link href="/products" style={{ fontSize: 15, borderBottom: "1px solid currentColor" }}>לכל המוצרים</Link>
        </div>
        {products.length === 0 ? (
          <p style={{ fontSize: 18, color: "#5E4844" }}>אין כרגע מוצרים פעילים.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(220px, 1fr))", gap: mobile ? "22px 12px" : "28px 20px" }}>
            {products.slice(0, 4).map((p) => <CatalogCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section style={{ padding: mobile ? "8px 16px" : "16px clamp(20px,4.5vw,40px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#F3E2D5", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ padding: "clamp(48px,9vw,88px) clamp(20px,4.5vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(28px,6vw,56px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 440 }}>
            <h2 style={{ ...h2, fontSize: "clamp(28px,6.5vw,44px)", lineHeight: 1.1 }}>למה Oli</h2>
            <p style={body}>אנו שמות את רווחת האימהות והתינוקות שלהן בראש סדר העדיפויות. המוצרים שלנו נועדו לפנק אתכן האימהות, בעודם משלבים בתוכם תכונות רפואיות מועילות.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {VALUES.map((v) => (
              <div key={v.n} style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", padding: "22px 0", borderTop: "1px solid #DCC3B3", alignItems: "baseline" }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 15, color: "#A85A3A", flex: "0 0 40px" }}>{v.n}</span>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(20px,5vw,24px)", flex: "1 0 160px", maxWidth: 200 }}>{v.t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5E4844", flex: "1 1 260px" }}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {gifts.length > 0 && (
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(48px,9vw,88px) clamp(16px,4.5vw,32px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>מארזים</span>
            <h2 style={h2}>מתנות</h2>
          </div>
          <Link href="/products" style={{ fontSize: 15, borderBottom: "1px solid currentColor" }}>לכל המוצרים</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,minmax(0,1fr))", gap: mobile ? 12 : 20 }}>
          {gifts.map((p) => <GiftCard key={p.id} p={p} />)}
        </div>
      </section>
      )}

      <section style={{ padding: mobile ? "8px 16px" : "16px clamp(20px,4.5vw,40px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#FFFFFF", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ padding: "clamp(48px,9vw,88px) clamp(20px,4.5vw,40px)", display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
            <h2 style={{ ...h2, fontSize: "clamp(28px,6.5vw,44px)" }}>המומחים מדברים</h2>
            <p style={body}>אנו מאמינות כי ידע הוא כוח וחשוב שהידע יגיע ממקור מוסמך ואמין.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 20 }}>
            <Hx as={Link} href="/podcast" style={expert} hover={{ background: "#EED7C7" }}>
              <img src="/assets/eyal-sheiner.png" alt="פרופסור אייל שיינר" style={expertImg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>פודקאסט</span>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: 26 }}>&quot;היריון בטוח&quot;</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5E4844" }}>בהנחיית פרופ&apos; אייל שיינר, מומחה במיילדות וגניקולוגיה, מנהל מחלקת נשים ויולדות ב&apos; בביה&quot;ח סורוקה.</p>
                <span style={{ fontSize: 14, fontWeight: 600 }}>להאזנה ←</span>
              </div>
            </Hx>
            <Hx as="a" href="#" style={expert} hover={{ background: "#EED7C7" }}>
              <img src="https://static.wixstatic.com/media/db159b_6c6b073be1574602a9937309c3cb2d29~mv2.png" alt="" style={expertImg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>מאמרים</span>
                <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: 26 }}>ידע מבוסס מחקר</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5E4844" }}>הריון, טיפוח העור בהריון, לידה והכנה ללידה, אחרי לידה ותינוקות והורות ראשונית.</p>
                <span style={{ fontSize: 14, fontWeight: 600 }}>לכל המאמרים ←</span>
              </div>
            </Hx>
          </div>
        </div>
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(48px,9vw,88px) clamp(16px,4.5vw,32px)" }}>
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", padding: "clamp(32px,7vw,64px) clamp(20px,5vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 32, alignItems: "center" }}>
          <img src="https://static.wixstatic.com/media/db159b_be6c8692d1084b019a343710fb694324~mv2.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(58,40,38,.55)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, color: "#FBF5EF" }}>
            <span style={{ fontSize: 15 }}>הרשמי לקבלת עדכונים, טיפים והנחות</span>
            <h2 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,42px)", lineHeight: 1.1 }}>וקבלי 5% הנחה בהזמנה הראשונה!</h2>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, background: "#FBF5EF", borderRadius: 999, padding: 6 }}>
              <input placeholder="כתובת אימייל" style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", padding: "10px 16px", fontFamily: "inherit", fontSize: 16, outline: "none" }} />
              <button type="button" style={{ background: "#3A2826", color: "#FBF5EF", border: 0, padding: "12px 26px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>הרשמי</button>
            </div>
            <label style={{ fontSize: 13, color: "#F6E6DA", display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" />בהרשמה אני מאשרת קבלת תוכן שיווקי</label>
          </div>
        </div>
      </section>
    </main>
  );
}

const primary: CSSProperties = { background: "#3A2826", color: "#FBF5EF", border: 0, padding: "16px 30px", borderRadius: 999, fontSize: 16, fontWeight: 600, display: "inline-flex" };
const textLink: CSSProperties = { background: "transparent", color: "#3A2826", border: 0, padding: "8px 2px", fontSize: 16, fontWeight: 600, display: "inline-flex", alignItems: "center", textDecoration: "underline", textUnderlineOffset: 5, textDecorationThickness: 1 };
const h2: CSSProperties = { fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,40px)" };
const body: CSSProperties = { fontSize: 18, lineHeight: 1.8, color: "#5E4844", textWrap: "pretty" };
const expert: CSSProperties = { display: "grid", gridTemplateColumns: "clamp(90px,24vw,150px) minmax(0,1fr)", gap: "clamp(14px,4vw,24px)", padding: "clamp(16px,4vw,24px)", borderRadius: 20, background: "#F3E2D5", alignItems: "center", color: "#3A2826" };
const expertImg: CSSProperties = { width: "100%", aspectRatio: "150/190", height: "auto", objectFit: "cover", objectPosition: "center 22%", borderRadius: 12, display: "block" };

function stageCard(mobile: boolean): CSSProperties {
  return {
    position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
    gap: mobile ? 18 : 0, minHeight: mobile ? 190 : 380, padding: mobile ? "20px 20px 18px" : 28,
    borderRadius: mobile ? 16 : 20, overflow: "hidden", background: "#F4DECF", transition: "transform .3s", color: "#3A2826",
  };
}

