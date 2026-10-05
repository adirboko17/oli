"use client";

import { useMemo, useState } from "react";
import { EP_DESC, EPISODES } from "@/lib/podcast";
import { FF } from "@/lib/format";
import { Hx } from "@/components/hx";
import { IconPlay, IconSearch } from "@/components/icons";

export function PodcastView() {
  const [q, setQ] = useState("");
  const [asc, setAsc] = useState(false);
  const [lim, setLim] = useState(12);

  const stats = useMemo(() => {
    const mins = EPISODES.reduce((a, x) => {
      const [m, sec] = x[2].split(":").map(Number);
      return a + m + sec / 60;
    }, 0);
    return { total: EPISODES.length, hours: Math.round(mins / 60) };
  }, []);

  const latest = EPISODES[EPISODES.length - 1];
  const query = q.trim();
  const list = useMemo(() => {
    let rows = EPISODES.filter((x) => !query || x[1].includes(query) || String(x[0]) === query);
    if (!asc) rows = rows.slice().reverse();
    return rows;
  }, [query, asc]);

  return (
    <main style={{ width: "100%" }}>
      <section style={{ padding: "12px clamp(16px,4.5vw,40px) 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", background: "#3A2826", color: "#F6E6DA", borderRadius: "clamp(20px,2.5vw,32px)", overflow: "hidden" }}>
        <div style={{ padding: "clamp(28px,6vw,64px) clamp(20px,4.5vw,40px) 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(20px,5vw,64px)", alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px,2.5vw,22px)", paddingBottom: "clamp(32px,6vw,64px)" }}>
            <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#E3A783", fontWeight: 600 }}>הפודקאסט של Oli</span>
            <h1 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.02em", fontSize: "clamp(40px,7vw,84px)", lineHeight: 1, color: "#FBF5EF" }}>היריון בטוח</h1>
            <p style={{ fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.65, color: "#E6D2C6", textWrap: "pretty", maxWidth: 520 }}>שיחות חשופות עם מיטב המומחים בנושא היריון ולידה. בהנחיית פרופ&apos; אייל שיינר, מומחה למיילדות וגניקולוגיה.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "#F3D9C6", color: "#3A2826", padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}><IconPlay />האזנה ב-Spotify</a>
              <a href="https://youtube.com/@olisafecare" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #6B524D", color: "#FBF5EF", padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>צפייה ב-YouTube</a>
            </div>
            <div style={{ display: "flex", gap: 28, paddingTop: "clamp(8px,2vw,16px)", borderTop: "1px solid #54403C", marginTop: 4, fontSize: 14, color: "#C9B2A6" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontFamily: FF, fontWeight: 500, fontSize: 26, color: "#FBF5EF" }}>{stats.total}</span>פרקים</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontFamily: FF, fontWeight: 500, fontSize: 26, color: "#FBF5EF" }}>{stats.hours}</span>שעות האזנה</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}>
            <img src="https://static.wixstatic.com/media/db159b_32d9c51a24f648159b801dae4bb5d0b0~mv2.png/v1/fill/w_740,h_850,al_c,q_85,enc_auto/file.png" alt="פרופסור אייל שיינר" style={{ width: "min(100%,400px)", height: "auto", display: "block", position: "relative" }} />
            <div style={{ position: "absolute", bottom: "clamp(16px,3vw,28px)", right: 0, background: "#FBF5EF", color: "#3A2826", padding: "14px 18px", borderRadius: 14, maxWidth: "min(300px,80%)", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 14px 40px rgba(0,0,0,.25)" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>פרופסור אייל שיינר</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#5E4844" }}>מומחה במיילדות וגניקולוגיה, מנהל החטיבה למיילדות וגניקולוגיה, מנהל מחלקת נשים ויולדות ב&apos; בבית החולים סורוקה.</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(36px,7vw,72px) clamp(16px,4.5vw,32px) clamp(48px,8vw,88px)", display: "flex", flexDirection: "column", gap: "clamp(20px,4vw,32px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>הפרק החדש</span>
          <Hx as="a" href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: "clamp(14px,3vw,28px)", alignItems: "center", padding: "clamp(18px,3.5vw,32px)", borderRadius: "clamp(16px,2.5vw,24px)", background: "#F3E2D5", color: "#3A2826" }} hover={{ background: "#EED6C6" }}>
            <span style={{ width: "clamp(56px,10vw,84px)", height: "clamp(56px,10vw,84px)", borderRadius: "50%", background: "#3A2826", color: "#F3D9C6", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPlay size={28} /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: "#8A6C64", fontWeight: 600 }}>פרק {latest[0]} · {latest[2]}</span>
              <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(22px,3.6vw,34px)", lineHeight: 1.15, letterSpacing: "-.01em", textWrap: "balance" }}>{latest[1]}</span>
              <span style={{ fontSize: "clamp(14px,2vw,16px)", lineHeight: 1.6, color: "#5E4844", textWrap: "pretty" }}>{EP_DESC[latest[0]] || ""}</span>
            </span>
          </Hx>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 14, paddingTop: "clamp(12px,3vw,24px)" }}>
          <h2 style={{ fontFamily: FF, fontWeight: 500, letterSpacing: "-.015em", fontSize: "clamp(28px,6vw,44px)", lineHeight: 1.05 }}>כל הפרקים</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flex: "1 1 280px", maxWidth: 440 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 16px", border: "1px solid #CDB5A8", borderRadius: 999, background: "#FFFFFF" }}>
              <IconSearch size={18} />
              <input value={q} onChange={(e) => { setQ(e.target.value); setLim(12); }} placeholder="חיפוש פרק, נושא או אורח/ת" style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "#3A2826" }} />
            </div>
            <button type="button" onClick={() => setAsc((v) => !v)} style={{ height: 46, padding: "0 16px", border: "1px solid #CDB5A8", borderRadius: 999, background: "transparent", color: "#3A2826", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{asc ? "מהראשון" : "מהחדש"}</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid #3A2826" }}>
          {list.slice(0, lim).map((ep) => (
            <a key={ep[0]} href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "clamp(40px,7vw,64px) minmax(0,1fr) auto", gap: "clamp(12px,2.5vw,24px)", alignItems: "center", padding: "clamp(14px,2.5vw,20px) 4px", borderBottom: "1px solid #EADBCF", color: "#3A2826" }}>
              <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(18px,3vw,26px)", color: "#A85A3A", letterSpacing: "-.01em" }}>{String(ep[0]).padStart(2, "0")}</span>
              <span style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(16px,2.4vw,20px)", lineHeight: 1.35, textWrap: "pretty" }}>{ep[1]}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6E5650", whiteSpace: "nowrap" }}>
                <span>{ep[2]}</span>
                <span style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #CDB5A8", display: "flex", alignItems: "center", justifyContent: "center", color: "#3A2826" }}><IconPlay size={14} /></span>
              </span>
            </a>
          ))}
        </div>
        {!list.length && <span style={{ fontSize: 16, color: "#5E4844", padding: "8px 0" }}>לא נמצאו פרקים. נסי מילה אחרת.</span>}
        {list.length > lim && (
          <Hx as="button" onClick={() => setLim((n) => n + 12)} style={{ alignSelf: "center", background: "#3A2826", color: "#FBF5EF", border: 0, padding: "15px 30px", borderRadius: 999, fontSize: 15, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>עוד פרקים ({list.length - lim})</Hx>
        )}
      </section>
    </main>
  );
}
