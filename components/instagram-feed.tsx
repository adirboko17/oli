"use client";

import { useEffect, useState } from "react";
import { FF } from "@/lib/format";
import { IconInstagram, IconPlay } from "@/components/icons";

const FEED_URL = "https://feeds.behold.so/s4RhT1TTfJgmtYp5iZEE";
const PROFILE = "https://instagram.com/oli_safecare";

const W = "https://static.wixstatic.com/media/";
const shot = (id: string) => `${W}${id}/v1/fill/w_600,h_600,al_c,q_85,enc_auto/file.jpg`;
const FALLBACK = [
  "db159b_bfe0061609ae4274a93b6491dd07ed08~mv2.jpg",
  "db159b_6beb68bce7684106a7dbbf14bd9bf408~mv2.jpeg",
  "db159b_512f372ce1bd443da5fe477b0e544113~mv2.jpeg",
  "db159b_d83a36f5d9db48899f80d8c01a7f4c55~mv2.jpg",
  "db159b_85acba9ecd6d486285d017a9ce4307ac~mv2.jpg",
  "db159b_c3fca06807e24db585466c46f69e0b36~mv2.jpg",
].map(shot);

type Size = { mediaUrl?: string };
type Post = {
  id: string;
  permalink?: string;
  mediaType?: string;
  altText?: string;
  prunedCaption?: string;
  caption?: string;
  sizes?: { small?: Size; medium?: Size; large?: Size };
};

type Tile = { key: string; href: string; src: string; alt: string; video: boolean };

function imageOf(post: Post) {
  return post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.sizes?.large?.mediaUrl || "";
}

function labelOf(post: Post) {
  const text = (post.altText || post.prunedCaption || post.caption || "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 90) : "פוסט באינסטגרם";
}

export function InstagramSection() {
  const [tiles, setTiles] = useState<Tile[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(FEED_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        const posts: Post[] = Array.isArray(json.posts) ? json.posts : [];
        const next = posts
          .map((post) => ({ key: post.id, href: post.permalink || PROFILE, src: imageOf(post), alt: labelOf(post), video: post.mediaType === "VIDEO" }))
          .filter((post) => post.src);
        if (!next.length) throw new Error("empty");
        setTiles(next);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTiles(FALLBACK.map((src) => ({ key: src, href: PROFILE, src, alt: "פוסט באינסטגרם", video: false })));
      }
    })();
    return () => controller.abort();
  }, []);

  const items = tiles ?? Array.from({ length: 6 }, (_, i) => ({ key: `ph-${i}`, href: "", src: "", alt: "", video: false }));

  return (
    <section style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(8px,2vw,24px) var(--page-pad) clamp(64px,10vw,112px)", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(24px,4vw,40px)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
        <a href={PROFILE} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#A85A3A", direction: "ltr" }}>@oli_safecare</a>
        <h2 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1.05, fontSize: "clamp(30px,5vw,48px)" }}>Oli באינסטגרם</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#6E5650", maxWidth: 420 }}>רגעים קטנים מהמסע, טיפים ומה שחדש אצלנו</p>
      </div>
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(30%,150px),1fr))", gap: "clamp(6px,1vw,12px)" }}>
        {items.map((item) => {
          const frame = (
            <>
              {item.src ? <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              {item.video ? (
                <span aria-hidden style={{ position: "absolute", top: 10, insetInlineStart: 10, width: 28, height: 28, borderRadius: 999, background: "rgba(58,40,38,.72)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconPlay size={12} />
                </span>
              ) : null}
            </>
          );
          const frameStyle = { position: "relative" as const, aspectRatio: "1/1", borderRadius: "clamp(10px,1.4vw,16px)", overflow: "hidden", background: "#F6EEE8" };
          return item.href ? (
            <a key={item.key} href={item.href} target="_blank" rel="noreferrer" aria-label={item.alt} style={frameStyle}>{frame}</a>
          ) : (
            <div key={item.key} style={frameStyle} />
          );
        })}
      </div>
      <a href={PROFILE} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 22px", borderRadius: 999, border: "1px solid #CDB5A8", fontSize: 15, fontWeight: 500 }}>
        <IconInstagram />
        לעקוב אחרינו
      </a>
    </section>
  );
}
