"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PRODUCTS, thumbOf } from "@/lib/data";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import {
  IconBag, IconFacebook, IconInstagram, IconSearch, IconSpotify, IconUser, IconWhatsApp, IconYouTube,
} from "@/components/icons";
import { useSite } from "@/components/site";

const PROMO = ["משלוח חינם בהזמנה מעל 250 ש״ח", "5% הנחה בהזמנה הראשונה לנרשמות", "בטוח לשימוש בהריון ולאחר לידה"];
const POPULAR = ["סימני מתיחה", "שמן עיסוי", "הנקה", "מארזי מתנה", "ספרים"];

const social = {
  width: 42, height: 42, borderRadius: "50%", border: "1px solid #5A4340",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#E6D2C6",
} as const;

function Promo() {
  const row = (key: string) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 24, paddingRight: 24 }}>
      {[0, 1].map((copy) =>
        PROMO.map((m, i) => (
          <span key={copy + "-" + i} style={{ display: "contents" }}>
            <span dir="rtl" style={{ whiteSpace: "nowrap" }}>{m}</span>
            <span style={{ color: "#C9A08A", fontSize: 10 }}>✦</span>
          </span>
        )),
      )}
    </div>
  );
  return (
    <>
      <div className="promo-desk" style={{ background: "#3A2826", color: "#F6E6DA", fontSize: 13, letterSpacing: ".04em", display: "flex", justifyContent: "center", gap: 28, padding: "9px 16px", flexWrap: "wrap" }}>
        <span>משלוח חינם בהזמנה מעל 250 ש״ח</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>5% הנחה בהזמנה הראשונה לנרשמות</span>
      </div>
      <div className="promo-mob" style={{ background: "#3A2826", color: "#F6E6DA", fontSize: 13, letterSpacing: ".04em", overflow: "hidden", height: 36, alignItems: "center", direction: "ltr", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}>
        <div style={{ display: "flex", width: "max-content", animation: "oliMarquee 22s linear infinite" }}>
          {row("a")}
          {row("b")}
        </div>
      </div>
      <style>{`
        .promo-mob { display: none; }
        @media (max-width: 759px) {
          .promo-desk { display: none !important; }
          .promo-mob {
            display: flex !important;
            height: auto !important;
            box-sizing: border-box;
            min-height: calc(36px + env(safe-area-inset-top));
            padding-top: env(safe-area-inset-top);
          }
        }
      `}</style>
    </>
  );
}

function useMenuChrome(open: boolean) {
  const [on, setOn] = useState(open);
  if (open && !on) setOn(true);
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => setOn(false), 680);
    return () => window.clearTimeout(t);
  }, [open]);
  return on;
}

function Header() {
  const site = useSite();
  const menuChrome = useMenuChrome(site.menu);
  const path = usePathname();
  const home = path === "/";
  const prod = path.startsWith("/products") || path.startsWith("/product");
  const stores = path.startsWith("/stores");
  const pod = path.startsWith("/podcast");
  const nav = (on: boolean) => ({ fontWeight: on ? 600 : 400, fontSize: 15, whiteSpace: "nowrap" as const });
  const [menuTop, setMenuTop] = useState(108);

  useEffect(() => {
    const el = site.headerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const hh = Math.round(rect.height) - 1;
      if (hh > 20) site.setHeaderH(hh);
      const bottom = Math.max(0, Math.round(rect.bottom));
      setMenuTop((prev) => (prev === bottom ? prev : bottom));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [site]);

  const links = [
    { href: "/", label: "דף הבית" },
    { href: "/products?cat=all", label: "המוצרים של Oli" },
    { href: "/products?cat=gift", label: "מתנות ליולדת" },
    { href: "/stores", label: "Oli בחנויות" },
    { href: "/podcast", label: "פודקאסט" },
  ];

  return (
    <header ref={site.headerRef} style={{ position: "sticky", top: 0, zIndex: 20, background: menuChrome ? "#3A2826" : "transparent" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "rgba(251,245,239,.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid #EADBCF" }} />
      <div className="desk-nav" style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "12px clamp(16px,4.5vw,32px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24 }}>
        <nav style={{ display: "flex", gap: "clamp(12px,1.8vw,26px)", fontSize: 15, whiteSpace: "nowrap", overflow: "hidden" }}>
          <Link href="/" style={nav(home)}>דף הבית</Link>
          <Link href="/products?cat=preg" style={nav(prod)}>המוצרים של Oli</Link>
          <Link href="/products?cat=gift" style={nav(false)}>מתנות ליולדת</Link>
          <Link href="/stores" style={nav(stores)}>Oli בחנויות</Link>
          <Link href="/podcast" style={nav(pod)}>פודקאסט</Link>
        </nav>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/logo-brown.png" alt="Oli Safe Care" style={{ height: 46, display: "block" }} />
        </Link>
        <div style={{ display: "flex", gap: "clamp(10px,1.4vw,18px)", justifyContent: "flex-end", alignItems: "center", fontSize: 14, whiteSpace: "nowrap" }}>
          <Hx as="button" onClick={site.openSearch} style={iconLink} hover={{ background: "#F3E2D5" }}>
            <IconSearch /><span>חיפוש</span>
          </Hx>
          <Hx as="button" onClick={site.openAccount} style={iconLink} hover={{ background: "#F3E2D5" }}>
            <IconUser /><span>החשבון שלי</span>
          </Hx>
          <Hx as="button" onClick={site.openCart} aria-label="סל קניות" style={cartBtn} hover={{ background: "#A85A3A" }}>
            <IconBag /><span>סל</span>
            <span style={{ background: "#F3D9C6", color: "#3A2826", borderRadius: 999, minWidth: 22, height: 22, padding: "0 6px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{site.cartCount}</span>
          </Hx>
        </div>
      </div>

      <div className="mob-nav" style={{ position: "relative", zIndex: 1, padding: "12px 16px", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
        <button type="button" onClick={site.toggleMenu} aria-label="תפריט" style={{ justifySelf: "start", width: 44, height: 44, border: "1px solid " + (site.menu ? "#3A2826" : "#CDB5A8"), borderRadius: 999, background: site.menu ? "#3A2826" : "transparent", position: "relative", padding: 0, transition: "background .35s, border-color .35s" }}>
          <span style={{ position: "absolute", left: 13, right: 13, height: 1.5, borderRadius: 2, background: site.menu ? "#FBF5EF" : "#3A2826", top: site.menu ? 21 : 17, transform: site.menu ? "rotate(45deg)" : "none", transition: "all .45s cubic-bezier(.7,0,.2,1)" }} />
          <span style={{ position: "absolute", left: 13, right: site.menu ? 13 : 19, height: 1.5, borderRadius: 2, background: site.menu ? "#FBF5EF" : "#3A2826", top: site.menu ? 21 : 25, transform: site.menu ? "rotate(-45deg)" : "none", transition: "all .45s cubic-bezier(.7,0,.2,1)" }} />
        </button>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/logo-brown.png" alt="Oli Safe Care" style={{ height: 46, display: "block" }} />
        </Link>
        <div style={{ justifySelf: "end", display: "flex", gap: 6, alignItems: "center" }}>
          <button type="button" onClick={site.openSearch} aria-label="חיפוש" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#3A2826", background: "transparent", border: 0 }}>
            <IconSearch />
          </button>
          <button type="button" onClick={site.openCart} aria-label="סל קניות" style={{ position: "relative", width: 44, height: 44, border: 0, borderRadius: 999, background: "#3A2826", color: "#FBF5EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconBag />
            <span style={{ position: "absolute", top: -4, left: -4, background: "#A85A3A", color: "#FBF5EF", borderRadius: 999, minWidth: 19, height: 19, padding: "0 5px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: "2px solid #FBF5EF" }}>{site.cartCount}</span>
          </button>
        </div>
      </div>

      <div className="mob-menu" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 19, maxHeight: `calc(100dvh - ${menuTop}px)`, borderRadius: "0 0 28px 28px", overflow: "hidden", color: "#FBF5EF", flexDirection: "column", pointerEvents: site.menu ? "auto" : "none" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "#3A2826", borderRadius: "0 0 28px 28px", clipPath: site.menu ? "inset(0 0 0 0 round 0 0 28px 28px)" : "inset(0 0 100% 0 round 0 0 28px 28px)", transition: "clip-path .65s cubic-bezier(.7,0,.2,1)" }} />
        <div data-scroll-lock-allow style={{ position: "relative", zIndex: 1, maxHeight: `calc(100dvh - ${menuTop}px)`, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px 4px", opacity: site.menu ? 1 : 0, transform: site.menu ? "translateY(0)" : "translateY(16px)", transition: `opacity .5s ease ${site.menu ? 0.18 : 0}s, transform .55s cubic-bezier(.2,.8,.2,1) ${site.menu ? 0.18 : 0}s` }}>
          <button type="button" onClick={site.openSearch} style={menuRow}>
            <IconSearch size={20} />
            <span style={{ flex: 1 }}>חיפוש מוצרים, מאמרים…</span>
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", padding: "8px 24px 0" }}>
          {links.map((l, i) => (
            <Link key={l.href + l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #54403C", color: "#FBF5EF", fontSize: 26, fontWeight: 500, letterSpacing: "-.01em", opacity: site.menu ? 1 : 0, transform: site.menu ? "translateY(0)" : "translateY(24px)", transition: `opacity .5s ease ${site.menu ? 0.28 + i * 0.06 : 0}s, transform .6s cubic-bezier(.2,.8,.2,1) ${site.menu ? 0.28 + i * 0.06 : 0}s` }}>
              <span style={{ fontSize: 13, color: "#C9A08A", fontWeight: 500, letterSpacing: ".06em", minWidth: 26 }}>0{i + 1}</span>
              <span style={{ flex: 1 }}>{l.label}</span>
              <span style={{ fontSize: 20, color: "#C9A08A" }}>←</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 24px calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 14, opacity: site.menu ? 1 : 0, transform: site.menu ? "none" : "translateY(16px)", transition: `opacity .5s ease ${site.menu ? 0.62 : 0}s, transform .6s ease ${site.menu ? 0.62 : 0}s` }}>
          <button type="button" onClick={site.openAccount} style={{ ...menuRow, color: "#FBF5EF", fontWeight: 600 }}>
            <IconUser size={20} />
            <span style={{ flex: 1 }}>החשבון שלי</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#C9B2A6" }}>הזמנות ופרטים</span>
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <Hx as="a" href="https://wa.me/972559739670" target="_blank" rel="noreferrer" aria-label="WhatsApp" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconWhatsApp size={19} /></Hx>
            <Hx as="a" href="https://instagram.com/oli_safecare" target="_blank" rel="noreferrer" aria-label="Instagram" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconInstagram /></Hx>
            <Hx as="a" href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noreferrer" aria-label="Spotify" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconSpotify /></Hx>
          </div>
          <span style={{ textAlign: "center", fontSize: 13, color: "#C9B2A6" }}>משלוח חינם בהזמנה מעל 250 ש״ח</span>
        </div>
        </div>
      </div>
      <style>{`
        .mob-nav, .mob-menu { display: none; }
        @media (max-width: 759px) {
          .desk-nav { display: none !important; }
          .mob-nav { display: grid !important; }
          .mob-menu { display: flex; }
        }
      `}</style>
    </header>
  );
}

const iconLink = {
  display: "flex", alignItems: "center", gap: 7, height: 40, padding: "0 10px",
  borderRadius: 999, color: "#3A2826", background: "transparent", border: 0, fontSize: 14,
} as const;

const cartBtn = {
  position: "relative" as const, display: "flex", alignItems: "center", gap: 8, height: 42,
  padding: "0 18px 0 16px", border: 0, borderRadius: 999, background: "#3A2826", color: "#FBF5EF", fontSize: 14, fontWeight: 600,
};

const menuRow = {
  display: "flex", alignItems: "center", gap: 12, height: 52, width: "100%",
  padding: "0 18px", borderRadius: 14, background: "#4A3532", color: "#C9B2A6",
  fontSize: 15, border: 0, textAlign: "right" as const,
} as const;

function Footer() {
  const { mobile } = useSite();
  return (
    <footer dir="rtl" style={{ marginTop: "auto", textAlign: "right", padding: mobile ? "8px 16px calc(16px + env(safe-area-inset-bottom))" : "16px clamp(20px,4.5vw,40px) 24px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", background: "#3A2826", color: "#E6D2C6", borderRadius: mobile ? 20 : 32, overflow: "hidden" }}>
      <div style={{ padding: "clamp(35px,9vw,64px) clamp(20px,4.5vw,40px) 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <img src="/assets/logo-white.png" alt="Oli Safe Care" style={{ height: 64, width: "auto", display: "block", alignSelf: "flex-start" }} />
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>מוצרי טיפוח בטוחים, יעילים ומפנקים למסע היקר של ההריון ולאחריו.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15 }}>
          <span style={{ color: "#FBF5EF", fontWeight: 600, marginBottom: 4 }}>חנות</span>
          <Link href="/products?cat=preg" style={{ color: "#E6D2C6" }}>המוצרים של Oli</Link>
          <Link href="/products?cat=gift" style={{ color: "#E6D2C6" }}>מתנות ליולדת</Link>
          <Link href="/stores" style={{ color: "#E6D2C6" }}>בחנויות Oli</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15 }}>
          <span style={{ color: "#FBF5EF", fontWeight: 600, marginBottom: 4 }}>ידע</span>
          <a href="#" style={{ color: "#E6D2C6" }}>מאמרים</a>
          <Link href="/podcast" style={{ color: "#E6D2C6" }}>היריון בטוח, פרופ׳ שיינר</Link>
          <a href="#" style={{ color: "#E6D2C6" }}>חופשייה ללדת, זיוה כחלון</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15 }}>
          <span style={{ color: "#FBF5EF", fontWeight: 600, marginBottom: 4 }}>צרי קשר</span>
          <a href="mailto:contact@olisafecare.com" style={{ color: "#E6D2C6" }}>contact@olisafecare.com</a>
          <a href="https://wa.me/972559739670" target="_blank" rel="noreferrer" style={{ color: "#E6D2C6" }}>WhatsApp ‎+972559739670</a>
          <span style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <Hx as="a" href="https://instagram.com/oli_safecare" target="_blank" rel="noreferrer" aria-label="Instagram" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconInstagram /></Hx>
            <Hx as="a" href="https://www.facebook.com/profile.php?id=100093537736476" target="_blank" rel="noreferrer" aria-label="Facebook" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconFacebook /></Hx>
            <Hx as="a" href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noreferrer" aria-label="Spotify" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconSpotify /></Hx>
            <Hx as="a" href="https://youtube.com/@olisafecare" target="_blank" rel="noreferrer" aria-label="YouTube" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconYouTube /></Hx>
            <Hx as="a" href="https://wa.me/972559739670" target="_blank" rel="noreferrer" aria-label="WhatsApp" style={social} hover={{ background: "#F3D9C6", color: "#3A2826", borderColor: "#F3D9C6" }}><IconWhatsApp size={19} /></Hx>
          </span>
        </div>
      </div>
      <div style={{ padding: "20px clamp(20px,4.5vw,40px)", borderTop: "1px solid #5A4340", display: "flex", gap: 24, fontSize: 13, flexWrap: "wrap" }}>
        <a href="#" style={{ color: "#C9B2A6" }}>תקנון האתר</a>
        <a href="#" style={{ color: "#C9B2A6" }}>נגישות</a>
        <a href="#" style={{ color: "#C9B2A6" }}>מדיניות פרטיות</a>
      </div>
      </div>
    </footer>
  );
}

function useShown(open: boolean, duration = 650) {
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) {
      setPresent(true);
      const first = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(first);
    }
    setVisible(false);
    const t = window.setTimeout(() => setPresent(false), duration);
    return () => window.clearTimeout(t);
  }, [open, duration]);
  return { present, visible };
}

function SearchOverlay() {
  const site = useSite();
  const ref = useRef<HTMLInputElement>(null);
  const { present, visible } = useShown(site.search, 560);
  useEffect(() => {
    if (!site.search) return;
    const t = setTimeout(() => ref.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [site.search]);

  const t = site.q.trim().toLowerCase();
  const res = t
    ? PRODUCTS.filter((p) => (p.name + " " + p.sub).toLowerCase().includes(t) || (t.length > 1 && p.sub.split(" ").some((w) => w.startsWith(t))))
    : [];

  if (!present) return null;

  return (
    <>
      <div onClick={site.closeAll} style={{ position: "fixed", inset: 0, zIndex: 72, background: "rgba(42,28,26,.42)", backdropFilter: visible ? "blur(3px)" : "none", opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity .4s ease" }} />
      <div data-scroll-lock-allow style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 73, background: "#FBF5EF", color: "#3A2826", padding: site.mobile ? "20px 16px 28px" : "36px 32px 40px", height: site.mobile ? "100dvh" : "auto", maxHeight: "100dvh", overflowY: "auto", borderRadius: site.mobile ? 0 : "0 0 28px 28px", boxShadow: "0 20px 60px rgba(42,28,26,.2)", transform: visible ? "translateY(0)" : "translateY(-104%)", transition: "transform .55s cubic-bezier(.7,0,.2,1)" }} aria-label="חיפוש">
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid #3A2826", padding: "6px 0" }}>
              <IconSearch size={26} />
              <input ref={ref} value={site.q} onChange={(e) => site.setQ(e.target.value)} placeholder="מה את מחפשת?" style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", fontFamily: FF, fontSize: "clamp(22px,4vw,32px)", fontWeight: 500, color: "#3A2826", outline: "none", padding: "4px 0" }} />
            </div>
            <Hx as="button" onClick={site.closeAll} aria-label="סגירה" style={closeBtn} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>✕</Hx>
          </div>
          {!t && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#8A6C64", fontWeight: 600 }}>חיפושים פופולריים</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {POPULAR.map((label) => (
                  <Hx key={label} as="button" onClick={() => site.setQ(label.split(" ")[0])} style={pillBtn} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>{label}</Hx>
                ))}
              </div>
            </div>
          )}
          {!!t && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#8A6C64", fontWeight: 600 }}>{res.length ? res.length + " תוצאות" : ""}</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: "4px 20px", maxHeight: "52vh", overflowY: "auto" }}>
                {res.slice(0, 12).map((p) => (
                  <Hx key={p.id} as={Link} href="/product" style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, borderRadius: 14, color: "#3A2826" }} hover={{ background: "#F3E2D5" }}>
                    <div style={{ width: 52, height: 64, borderRadius: 10, flexShrink: 0, backgroundColor: "#F3E4D8", backgroundImage: `url("${thumbOf(p)}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 17 }}>{p.name}</span>
                      <span style={{ fontSize: 13, color: "#6E5650", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.sub}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{fmt(p.price)}</span>
                  </Hx>
                ))}
              </div>
              {!res.length && <span style={{ fontSize: 16, color: "#5E4844", padding: "12px 0" }}>לא מצאנו תוצאות. נסי מילה אחרת, למשל &quot;שמן&quot; או &quot;מארז&quot;.</span>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const closeBtn = {
  width: 40, height: 40, flexShrink: 0, borderRadius: 999, border: "1px solid #CDB5A8",
  background: "transparent", color: "#3A2826", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
} as const;

const pillBtn = {
  padding: "10px 16px", borderRadius: 999, border: "1px solid #CDB5A8", background: "transparent", color: "#3A2826", fontSize: 14,
} as const;

const field = {
  height: 52, border: "1px solid #CDB5A8", borderRadius: 14, background: "#FFFFFF",
  padding: "0 16px", fontSize: 16, fontFamily: "inherit", color: "#3A2826", outline: "none", width: "100%",
} as const;

function AccountDrawer() {
  const site = useSite();
  const { present, visible } = useShown(site.account);
  if (!present) return null;
  const open = visible;
  return (
    <>
      <div onClick={site.closeAll} style={backdrop(72, open)} />
      <aside data-scroll-lock-allow style={panel(open, site.mobile, false)} aria-label="החשבון שלי">
        {site.mobile && <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><span style={{ width: 44, height: 4, borderRadius: 2, background: "#D8C3B6" }} /></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px 16px", borderBottom: "1px solid #EADBCF" }}>
          <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 26 }}>החשבון שלי</span>
          <Hx as="button" onClick={site.closeAll} aria-label="סגירה" style={closeBtn} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>✕</Hx>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#F3E2D5", borderRadius: 999, padding: 4 }}>
            {([["login", "התחברות"], ["signup", "הרשמה"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={() => site.setAccTab(k)} style={{ height: 42, border: 0, borderRadius: 999, fontSize: 15, fontWeight: 600, background: site.accTab === k ? "#FBF5EF" : "transparent", color: "#3A2826", boxShadow: site.accTab === k ? "0 2px 8px rgba(58,40,38,.12)" : "none", transition: "all .25s" }}>{label}</button>
            ))}
          </div>
          {site.accTab === "signup" && (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 14, background: "#3A2826", color: "#FBF5EF", fontSize: 14, lineHeight: 1.5 }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 24, color: "#F3D9C6" }}>5%</span>
                <span>הנחה על ההזמנה הראשונה לנרשמות חדשות</span>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>שם מלא
                <input placeholder="השם שלך" style={field} />
              </label>
            </>
          )}
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>אימייל
            <input type="email" placeholder="name@email.com" style={{ ...field, direction: "ltr", textAlign: "right" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 }}>סיסמה
            <input type="password" placeholder="••••••••" style={field} />
          </label>
          {site.accTab === "login" && <a href="#" style={{ fontSize: 14, color: "#A85A3A", textDecoration: "underline", alignSelf: "flex-start" }}>שכחתי סיסמה</a>}
          <Hx as="button" onClick={site.closeAll} style={{ background: "#3A2826", color: "#FBF5EF", border: 0, height: 54, borderRadius: 999, fontSize: 16, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>{site.accTab === "login" ? "התחברות" : "יצירת חשבון"}</Hx>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#8A6C64", fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: "#EADBCF" }} />או<span style={{ flex: 1, height: 1, background: "#EADBCF" }} />
          </div>
          <button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#FFFFFF", color: "#3A2826", border: "1px solid #CDB5A8", height: 52, borderRadius: 999, fontSize: 15, fontWeight: 600 }}>
            <span style={{ fontWeight: 700, color: "#A85A3A" }}>G</span>המשך עם Google
          </button>
        </div>
      </aside>
    </>
  );
}

function CartDrawer() {
  const site = useSite();
  const total = site.items.reduce((a, x) => a + x.price * x.qty, 0);
  const { present, visible } = useShown(site.cartOpen);
  if (!present) return null;
  const open = visible;
  return (
    <>
      <div onClick={site.closeCart} style={backdrop(70, open)} />
      <aside data-scroll-lock-allow style={panel(open, site.mobile, true)} aria-label="סל קניות">
        {site.mobile && <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><span style={{ width: 44, height: 4, borderRadius: 2, background: "#D8C3B6" }} /></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px 16px", borderBottom: "1px solid #EADBCF" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 26 }}>הסל שלך</span>
            <span style={{ fontSize: 14, color: "#6E5650" }}>{site.cartCount === 1 ? "פריט אחד" : site.cartCount + " פריטים"}</span>
          </div>
          <Hx as="button" onClick={site.closeCart} aria-label="סגירה" style={closeBtn} hover={{ background: "#3A2826", color: "#FBF5EF", borderColor: "#3A2826" }}>✕</Hx>
        </div>
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10, background: "#F6EBE2" }}>
          <span style={{ fontSize: 14, color: "#3A2826" }}>{total >= 250 ? "✓ מגיע לך משלוח חינם" : "עוד " + fmt(250 - total) + " ומקבלים משלוח חינם"}</span>
          <div style={{ height: 6, borderRadius: 3, background: "#E6D2C6", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#A85A3A", width: Math.min(100, (total / 250) * 100) + "%", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }} />
          </div>
        </div>
        {!site.items.length ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "40px 24px", textAlign: "center" }}>
            <span style={{ width: 72, height: 72, borderRadius: "50%", background: "#F3E2D5", display: "flex", alignItems: "center", justifyContent: "center", color: "#A85A3A" }}><IconBag size={30} /></span>
            <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 22 }}>הסל עדיין ריק</span>
            <span style={{ fontSize: 15, color: "#6E5650" }}>מוצרים בטוחים להריון ולאחר לידה מחכים לך באתר</span>
            <Link href="/products?cat=preg" onClick={site.closeCart} style={{ marginTop: 6, background: "#3A2826", color: "#FBF5EF", border: 0, padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>למוצרים של Oli</Link>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px" }}>
              {site.items.map((x, i) => (
                <div key={x.id} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid #EADBCF", opacity: open ? 1 : 0, transform: open ? "none" : "translateY(14px)", transition: `opacity .45s ease ${open ? 0.2 + i * 0.06 : 0}s, transform .5s cubic-bezier(.2,.8,.2,1) ${open ? 0.2 + i * 0.06 : 0}s` }}>
                  <div style={{ width: 84, aspectRatio: "4/5", borderRadius: 12, flexShrink: 0, backgroundColor: "#F3E4D8", backgroundImage: `url("${thumbOf(x, 240, 300)}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 18 }}>{x.name}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>{fmt(x.price * x.qty)}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#6E5650", lineHeight: 1.4 }}>{x.sub}</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #CDB5A8", borderRadius: 999, height: 36 }}>
                        <button type="button" onClick={() => site.setQty(x.id, 1)} aria-label="הוספה" style={qtyBtn}>+</button>
                        <span style={{ minWidth: 22, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{x.qty}</span>
                        <button type="button" onClick={() => site.setQty(x.id, -1)} aria-label="הפחתה" style={qtyBtn}>−</button>
                      </div>
                      <button type="button" onClick={() => site.setQty(x.id, -x.qty)} style={{ border: 0, background: "transparent", color: "#6E5650", fontSize: 13, textDecoration: "underline", padding: "8px 0" }}>הסרה</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "18px 24px calc(22px + env(safe-area-inset-bottom))", borderTop: "1px solid #EADBCF", display: "flex", flexDirection: "column", gap: 12, background: "#FBF5EF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 15, color: "#5E4844" }}>סכום ביניים</span>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 26 }}>{fmt(total)}</span>
              </div>
              <span style={{ fontSize: 13, color: "#6E5650" }}>משלוח ומבצעים יחושבו בקופה</span>
              <Hx as="button" style={{ background: "#3A2826", color: "#FBF5EF", border: 0, height: 54, borderRadius: 999, fontSize: 16, fontWeight: 600 }} hover={{ background: "#A85A3A" }}>למעבר לתשלום</Hx>
              <button type="button" onClick={site.closeCart} style={{ background: "transparent", color: "#3A2826", border: 0, fontSize: 14, textDecoration: "underline", padding: 4 }}>המשך קנייה</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

const qtyBtn = { width: 36, height: 36, border: 0, background: "transparent", color: "#3A2826", fontSize: 17 } as const;

function backdrop(z: number, on: boolean) {
  return {
    position: "fixed" as const, inset: 0, zIndex: z, background: "rgba(42,28,26,.42)",
    backdropFilter: on ? "blur(3px)" : "none", opacity: on ? 1 : 0,
    pointerEvents: on ? ("auto" as const) : ("none" as const), transition: "opacity .45s ease",
  };
}

function panel(open: boolean, mobile: boolean, cart: boolean) {
  const base = { zIndex: cart ? 71 : 73, background: "#FBF5EF", color: "#3A2826", display: "flex", flexDirection: "column" as const };
  if (mobile) {
    return {
      ...base, position: "fixed" as const, left: 0, right: 0, bottom: 0,
      height: cart ? "88dvh" : "auto", maxHeight: "92dvh",
      borderRadius: "26px 26px 0 0", boxShadow: "0 -20px 60px rgba(42,28,26,.25)",
      transform: open ? "translateY(0)" : "translateY(104%)",
      transition: "transform .6s cubic-bezier(.32,1.2,.4,1)",
    };
  }
  return {
    ...base, position: "fixed" as const, top: 0, bottom: 0, left: 0, width: "min(440px,92vw)",
    boxShadow: "20px 0 60px rgba(42,28,26,.2)",
    transform: open ? "translateX(0)" : "translateX(-104%)",
    transition: "transform .55s cubic-bezier(.7,0,.2,1)",
  };
}

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const menuChrome = useMenuChrome(useSite().menu);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) return;
    scrollToTop();
  }, [pathname]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (first.current) {
      first.current = false;
      return;
    }
    scrollToTop();
    const frame = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="chrome-clear top" aria-hidden style={{ backgroundColor: menuChrome ? "#3A2826" : "transparent" }} />
      <div className="chrome-clear bottom" aria-hidden style={{ backgroundColor: menuChrome ? "#3A2826" : "transparent" }} />
      <Promo />
      <Header />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      <Footer />
      <SearchOverlay />
      <AccountDrawer />
      <CartDrawer />
    </div>
  );
}
