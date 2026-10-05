"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { REGIONS } from "@/lib/data";
import { FF } from "@/lib/format";
import { IconPin } from "@/components/icons";
import { useSite } from "@/components/site";

export function StoresView() {
  const { mobile } = useSite();
  const [region, setRegion] = useState("all");
  const total = REGIONS.reduce((a, g) => a + g.stores.length, 0);
  const shown = REGIONS.filter((g) => region === "all" || region === g.name);
  const tabs = [{ k: "all", l: "כל הארץ" }, ...REGIONS.map((g) => ({ k: g.name, l: g.name }))];

  return (
    <main style={{ width: "100%" }}>
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4.5vw,32px) clamp(40px,7vw,72px)" }}>
        <div style={{ fontSize: "clamp(12px,3.2vw,14px)", color: "#8A6C64", display: "flex", gap: 8, whiteSpace: "nowrap" }}>
          <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span><span style={{ color: "#3A2826" }}>Oli בחנויות</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(24px,5vw,64px)", alignItems: "center", paddingTop: "clamp(20px,4vw,40px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px,2.5vw,22px)" }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>Oli בחנויות</span>
            <h1 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.02em", fontSize: "clamp(38px,6vw,72px)", lineHeight: 1.04, textWrap: "balance" }}>מהיום קרובות אליכן יותר!</h1>
            <p style={{ fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.65, color: "#5E4844", textWrap: "pretty" }}>מהלב שלנו למדיפים של שילב! מוצרי oli נמצאים עכשיו על המדף בסניפי שילב נבחרים ברחבי הארץ.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#branches" style={{ background: "#3A2826", color: "#FBF5EF", padding: "16px 28px", borderRadius: 999, fontSize: 16, fontWeight: 600 }}>לרשימת הסניפים</a>
              <a href="https://wa.me/972559739670" target="_blank" rel="noreferrer" style={{ border: "1px solid #3A2826", color: "#3A2826", padding: "16px 28px", borderRadius: 999, fontSize: 16, fontWeight: 600 }}>שאלה על סניף? WhatsApp</a>
            </div>
          </div>
          <div style={{ borderRadius: "clamp(16px,2.5vw,24px)", overflow: "hidden", background: "#F3E4D8", aspectRatio: "703/425" }}>
            <img src="https://static.wixstatic.com/media/db159b_fe94887c94e742c4aa58ee806fc71371~mv2.png/v1/fill/w_1406,h_850,al_c,q_85,enc_auto/file.png" alt="מוצרי Oli על המדף בשילב" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </section>
      <section id="branches" style={{ padding: mobile ? "8px 16px 24px" : "16px clamp(20px,4.5vw,40px) 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#FFFFFF", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
        <div style={{ padding: "clamp(40px,8vw,80px) clamp(20px,4.5vw,40px)", display: "flex", flexDirection: "column", gap: "clamp(20px,4vw,32px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(28px,6.5vw,44px)", lineHeight: 1.05 }}>לרשימת הסניפים</h2>
              <span style={{ fontSize: 15, color: "#6E5650" }}>{total} סניפים ברחבי הארץ</span>
            </div>
            <div className="no-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "100%" }}>
              {tabs.map((t) => (
                <button key={t.k} type="button" onClick={() => setRegion(t.k)} style={pill(region === t.k, mobile)}>{t.l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(20px,4vw,40px)" }}>
            {shown.map((g) => (
              <div key={g.name} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: "2px solid #3A2826" }}>
                  <h3 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(22px,4.6vw,28px)" }}>{g.name}</h3>
                  <span style={{ fontSize: 13, color: "#6E5650" }}>{g.stores.length} סניפים</span>
                </div>
                {g.stores.map(([name, city]) => (
                  <a key={name} href={"https://www.google.com/maps/search/" + encodeURIComponent(name)} target="_blank" rel="noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 4px", borderBottom: "1px solid #EADBCF", color: "#3A2826" }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 13, color: "#6E5650" }}>{city}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#A85A3A", whiteSpace: "nowrap" }}><IconPin />במפה</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#6E5650", lineHeight: 1.6 }}>המלאי משתנה בין הסניפים. מומלץ לבדוק זמינות מול הסניף לפני ההגעה.</p>
        </div>
        </div>
      </section>
    </main>
  );
}

function pill(on: boolean, mobile: boolean): CSSProperties {
  return {
    padding: mobile ? "7px 13px" : "9px 18px",
    borderRadius: 999,
    border: "1px solid " + (on ? "#3A2826" : "#CDB5A8"),
    background: on ? "#3A2826" : "transparent",
    color: on ? "#FBF5EF" : "#3A2826",
    fontSize: mobile ? 13 : 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}
