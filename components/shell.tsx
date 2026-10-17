"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { findUser, formatPhone, saveUser, useOliUser } from "@/lib/account-session";
import { catalogMenu, menuHref } from "@/lib/catalog-menu";
import { customerTags, productBlurb, productCardSub, productHref, productImage } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { Hx } from "@/components/hx";
import {
  IconBag, IconSearch, IconUser,
} from "@/components/icons";
import { useSite } from "@/components/site";
import { A11yWidget } from "@/components/widgets";
import MobileMenu from "@/components/MobileMenu";
import { PodcastNavDropdown } from "@/components/podcasts/PodcastMenu";
import PromoFivePercent from "@/components/PromoFivePercent";
import { PromoGate } from "@/components/promo/promo-gate";
import { SiteFooter } from "@/components/final/FooterAndPromo";
import { HeaderContactLink } from "@/components/contact/ContactPage";

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
      <div className="promo-desk" style={{ background: "#F3D9C6", color: "#3A2826", fontSize: 13, letterSpacing: ".04em", display: "flex", justifyContent: "center", gap: 28, padding: "9px 16px", flexWrap: "wrap" }}>
        <span>משלוח חינם בהזמנה מעל 250 ש״ח</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>5% הנחה בהזמנה הראשונה לנרשמות</span>
      </div>
      <div className="promo-mob" style={{ background: "#F3D9C6", color: "#3A2826", fontSize: 13, letterSpacing: ".04em", overflow: "hidden", height: 36, alignItems: "center", direction: "ltr", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}>
        <div style={{ display: "flex", width: "max-content", animation: "oliMarquee 22s linear infinite" }}>
          {row("a")}
          {row("b")}
        </div>
      </div>
      <style>{`
        .promo-mob { display: none; }
        @media (max-width: 767px) {
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

function Header() {
  const site = useSite();
  const path = usePathname();
  const home = path === "/";
  const prod = path.startsWith("/products") || path.startsWith("/product") || path.startsWith("/olimini");
  const stores = path.startsWith("/stores");
  const articlesOn = path.startsWith("/articles") || path.startsWith("/journal");
  const pod = path.startsWith("/podcast");
  const nav = (on: boolean) => ({ fontWeight: on ? 600 : 400, fontSize: 15, whiteSpace: "nowrap" as const, color: "#3A2826" });
  const [menuTop, setMenuTop] = useState(108);
  const [prodOpen, setProdOpen] = useState(false);
  const hideProd = useRef<number | undefined>(undefined);
  const router = useRouter();
  const user = useOliUser();
  const groups = catalogMenu(site.products, site.collections);
  const openMine = () => { if (user) router.push("/account"); else site.openAccount(); };

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

  const categories = [
    { label: "כל המוצרים", href: "/products", count: site.products.length, cms: "nav" as const, cmsId: "all-products" },
    ...groups.map((group) => ({ label: group.label, href: menuHref(group.id), count: group.count, cms: "category" as const, cmsId: group.id })),
  ];

  return (
    <header ref={site.headerRef} style={{ position: "sticky", top: 0, zIndex: 20, background: "transparent", ["--oli-header-h" as string]: `${menuTop}px` }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "rgba(255,255,255,.94)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid #EFE4DC" }} />
      <div className="desk-nav" style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "12px clamp(16px,4.5vw,32px)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24 }}>
        <nav style={{ display: "flex", gap: "clamp(12px,1.8vw,26px)", fontSize: 15, whiteSpace: "nowrap", alignItems: "center", minWidth: 0 }}>
          <Link href="/" data-cms="nav" data-cms-id="home" style={nav(home)}>דף הבית</Link>
          <div onMouseEnter={() => { window.clearTimeout(hideProd.current); setProdOpen(true); }} onMouseLeave={() => { hideProd.current = window.setTimeout(() => setProdOpen(false), 120); }} style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "12px 0", margin: "-12px 0" }}>
            <Link href="/products" data-cms="nav" data-cms-id="products" style={nav(prod)}>המוצרים של Oli</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform .3s", transform: prodOpen ? "rotate(180deg)" : "none", opacity: 0.7 }}><path d="M6 9l6 6 6-6" /></svg>
            <div style={{ position: "absolute", top: "100%", right: -14, minWidth: 260, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 18px 50px rgba(42,28,26,.14)", border: "1px solid #EFE4DC", padding: 8, display: "flex", flexDirection: "column", zIndex: 30, opacity: prodOpen ? 1 : 0, transform: prodOpen ? "translateY(0)" : "translateY(-6px)", pointerEvents: prodOpen ? "auto" : "none", transition: "opacity .25s ease, transform .3s cubic-bezier(.2,.8,.2,1)" }}>
              <Hx as={Link} href="/products" data-cms="nav" data-cms-id="all-products" style={dropLink} hover={{ background: "#F8EFE9" }}>כל המוצרים<span style={{ fontSize: 12, color: "#8A6C64" }}>{site.products.length}</span></Hx>
              {groups.map((group) => (
                <Hx key={group.id} as={Link} href={menuHref(group.id)} data-cms="category" data-cms-id={group.id} style={dropLink} hover={{ background: "#F8EFE9" }}>
                  {group.label}<span style={{ fontSize: 12, color: "#8A6C64" }}>{group.count}</span>
                </Hx>
              ))}
            </div>
          </div>
          <Link href="/stores" data-cms="nav" data-cms-id="stores" style={nav(stores)}>Oli בחנויות</Link>
          <Link href="/articles" data-cms="nav" data-cms-id="articles" style={nav(articlesOn)}>מאמרים</Link>
          <PodcastNavDropdown active={pod} />
        </nav>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/logo-brown.png" alt={site.storeName} style={{ height: 46, display: "block" }} />
        </Link>
        <div style={{ display: "flex", gap: "clamp(10px,1.4vw,18px)", justifyContent: "flex-end", alignItems: "center", fontSize: 14, whiteSpace: "nowrap" }}>
          <HeaderContactLink showLabel={site.wide} />
          <Hx as="button" onClick={site.openSearch} style={iconLink} hover={{ background: "#F8EFE9" }}>
            <IconSearch /><span>חיפוש</span>
          </Hx>
          <Hx as="button" onClick={openMine} style={iconLink} hover={{ background: "#F8EFE9" }}>
            <IconUser /><span>החשבון שלי</span>
          </Hx>
          <Hx as="button" onClick={site.openCart} aria-label="סל קניות" style={cartBtn} hover={{ background: "#A85A3A" }}>
            <IconBag /><span>סל</span>
            <span style={{ background: "#F3D9C6", color: "#3A2826", borderRadius: 999, minWidth: 22, height: 22, padding: "0 6px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{site.cartCount}</span>
          </Hx>
        </div>
      </div>

      <div className="mob-nav" style={{ position: "relative", zIndex: 1, padding: "12px 16px", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
        <div style={{ justifySelf: "start" }}>
          <MobileMenu categories={categories} onAccount={openMine} />
        </div>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/logo-brown.png" alt={site.storeName} style={{ height: 46, display: "block" }} />
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
      <style>{`
        .mob-nav { display: none; }
        @media (max-width: 1199px) {
          .desk-nav { display: none !important; }
          .mob-nav { display: grid !important; }
        }
      `}</style>
    </header>
  );
}

const dropLink: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 24, padding: "11px 14px", borderRadius: 10, fontSize: 15, color: "#3A2826" };

const iconLink = {
  display: "flex", alignItems: "center", gap: 7, height: 40, padding: "0 10px",
  borderRadius: 999, color: "#3A2826", background: "transparent", border: 0, fontSize: 14,
} as const;

const cartBtn = {
  position: "relative" as const, display: "flex", alignItems: "center", gap: 8, height: 42,
  padding: "0 18px 0 16px", border: 0, borderRadius: 999, background: "#3A2826", color: "#FFFFFF", fontSize: 14, fontWeight: 600,
};

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
    ? site.products.filter((product) => `${product.title} ${productBlurb(product)} ${customerTags(product.tags).join(" ")}`.toLowerCase().includes(t))
    : [];

  if (!present) return null;

  return (
    <>
      <div onClick={site.closeAll} style={{ position: "fixed", inset: 0, zIndex: 72, background: "rgba(42,28,26,.42)", backdropFilter: visible ? "blur(3px)" : "none", opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity .4s ease" }} />
      <div data-scroll-lock-allow style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 73, background: "#FFFFFF", color: "#3A2826", padding: site.mobile ? "calc(14px + env(safe-area-inset-top)) 16px 22px" : "36px 32px 40px", height: "auto", maxHeight: site.mobile ? "82dvh" : "100dvh", overflowY: "auto", borderRadius: site.mobile ? "0 0 24px 24px" : "0 0 28px 28px", boxShadow: "0 20px 60px rgba(42,28,26,.2)", transform: visible ? "translateY(0)" : "translateY(-104%)", transition: "transform .55s cubic-bezier(.7,0,.2,1)" }} aria-label="חיפוש">
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
                  <Hx key={p.id} as={Link} href={productHref(p)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, borderRadius: 14, color: "#3A2826" }} hover={{ background: "#F8EFE9" }}>
                    <div style={thumbStyle(productImage(p))} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 17 }}>{p.title}</span>
                      <span style={{ fontSize: 13, color: "#6E5650", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productCardSub(p)}</span>
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

function thumbStyle(src: string | null) {
  return {
    width: 52,
    height: 64,
    borderRadius: 10,
    flexShrink: 0,
    backgroundColor: "#F6EEE8",
    backgroundImage: src ? `url("${src}")` : undefined,
    backgroundSize: "contain" as const,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "center" as const,
    backgroundBlendMode: "darken" as const,
  };
}

const closeBtn = {
  width: 40, height: 40, flexShrink: 0, borderRadius: 999, border: "1px solid #CDB5A8",
  background: "transparent", color: "#3A2826", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
} as const;

const pillBtn = {
  padding: "10px 16px", borderRadius: 999, border: "1px solid #CDB5A8", background: "transparent", color: "#3A2826", fontSize: 14,
} as const;

function AccountDrawer() {
  const site = useSite();
  const router = useRouter();
  const { present, visible } = useShown(site.account, 450);
  const [step, setStep] = useState<"phone" | "code" | "name" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [left, setLeft] = useState(30);
  const [form, setForm] = useState({ name: "", age: "", email: "", city: "", addr: "", due: "" });
  const known = useRef(false);

  useEffect(() => {
    if (!site.account) return;
    setStep("phone");
    setCode("");
    setBad(false);
  }, [site.account]);

  useEffect(() => {
    if (step !== "code" || left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [step, left]);

  if (!present) return null;
  const open = visible;
  const phoneOk = /^05\d{8}$/.test(phone);
  const nameOk = form.name.trim().length > 1 && Number(form.age) >= 16 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.city.trim() && form.addr.trim();

  function send() {
    if (!phoneOk) return;
    known.current = !!findUser(phone);
    setStep("code");
    setCode("");
    setBad(false);
    setLeft(30);
  }

  function onCode(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setCode(next);
    setBad(false);
    if (next.length < 6) return;
    window.setTimeout(() => {
      if (known.current) finish(findUser(phone)!);
      else setStep("name");
    }, 250);
  }

  function finish(user: { name: string; phone: string; email: string; age: string; city: string; addr: string; due: string; isNew: boolean }) {
    saveUser(user);
    setStep("done");
    window.setTimeout(() => {
      site.closeAll();
      router.push("/account");
    }, 700);
  }

  const box = site.mobile
    ? { position: "fixed" as const, left: 0, right: 0, bottom: 0, maxHeight: "92dvh", zIndex: 73, background: "#FFFFFF", color: "#3A2826", borderRadius: "26px 26px 0 0", display: "flex", flexDirection: "column" as const, boxShadow: "0 -20px 60px rgba(42,28,26,.25)", transform: open ? "translateY(0)" : "translateY(104%)", transition: "transform .6s cubic-bezier(.32,1.2,.4,1)" }
    : { position: "fixed" as const, top: "50%", left: "50%", width: "min(440px,92vw)", maxHeight: "90vh", zIndex: 73, background: "#FFFFFF", color: "#3A2826", display: "flex", flexDirection: "column" as const, borderRadius: 28, boxShadow: "0 30px 80px rgba(42,28,26,.28)", opacity: open ? 1 : 0, transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-46%) scale(.96)", transition: "opacity .3s ease, transform .45s cubic-bezier(.32,1.2,.4,1)" };

  return (
    <>
      <div onClick={site.closeAll} style={backdrop(72, open)} />
      <aside data-scroll-lock-allow style={box} aria-label="כניסה לחשבון">
        {site.mobile && <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><span style={{ width: 44, height: 4, borderRadius: 2, background: "#D8C3B6" }} /></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
          {step === "code" || step === "name" ? <button type="button" onClick={() => setStep(step === "name" ? "code" : "phone")} style={{ height: 40, padding: "0 14px", borderRadius: 999, border: 0, background: "#F8EFE9", color: "#3A2826", fontSize: 14 }}>→ חזרה</button> : <span />}
          <Hx as="button" onClick={site.closeAll} aria-label="סגירה" style={closeBtn} hover={{ background: "#3A2826", color: "#FFFFFF", borderColor: "#3A2826" }}>✕</Hx>
        </div>
        <div style={{ padding: "8px clamp(24px,6vw,40px) calc(36px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>
          {step === "phone" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, textAlign: "center", paddingTop: 4 }}>
              <img src="/assets/logo-brown.png" alt="Oli" style={{ height: 34 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(28px,6vw,34px)", lineHeight: 1.1 }}>ברוכה הבאה</span>
                <span style={{ fontSize: 15, lineHeight: 1.6, color: "#6E5650", maxWidth: 300 }}>כניסה או הרשמה עם מספר הנייד. נשלח לך קוד חד־פעמי, בלי סיסמאות.</span>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", height: 58, borderRadius: 999, background: "#F8EFE9", direction: "ltr", padding: "0 6px 0 22px", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: "#8A6C64" }}>+972</span>
                  <span style={{ width: 1, height: 22, background: "#E1CABD" }} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} onKeyDown={(e) => { if (e.key === "Enter") send(); }} type="tel" inputMode="numeric" placeholder="050-000-0000" style={{ flex: 1, height: "100%", border: 0, outline: "none", fontSize: 18, letterSpacing: ".05em", fontFamily: "inherit", color: "#3A2826", background: "transparent", minWidth: 0 }} />
                </label>
                <button type="button" disabled={!phoneOk} onClick={send} style={{ height: 56, border: 0, borderRadius: 999, background: phoneOk ? "#3A2826" : "#E6D2C6", color: "#FFFFFF", fontSize: 16, fontWeight: 600 }}>שליחת קוד</button>
              </div>
              <span style={{ fontSize: 13, color: "#6E5650", lineHeight: 1.6 }}>פעם ראשונה? ניצור לך חשבון ותקבלי <span style={{ color: "#A85A3A", fontWeight: 600 }}>5% הנחה</span> על ההזמנה הראשונה</span>
            </div>
          )}
          {step === "code" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: FF, fontWeight: 400, fontSize: 30, lineHeight: 1.15 }}>הקוד בדרך אלייך</span>
                <span style={{ fontSize: 16, lineHeight: 1.55, color: "#5E4844" }}>שלחנו קוד בן 6 ספרות למספר <span style={{ direction: "ltr", display: "inline-block", fontWeight: 600, color: "#3A2826" }}>{formatPhone(phone)}</span></span>
              </div>
              <div style={{ position: "relative", direction: "ltr" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} style={{ height: 56, borderRadius: 14, border: "1.5px solid " + (code[i] ? "#3A2826" : "#E6D2C6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600 }}>{code[i] || ""}</span>
                  ))}
                </div>
                <input value={code} onChange={(e) => onCode(e.target.value)} type="tel" inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="קוד אימות" autoFocus style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%" }} />
              </div>
              {bad && <span style={{ fontSize: 14, color: "#A33A2A" }}>הקוד לא תואם. נסי שוב.</span>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#6E5650" }}>
                {left <= 0 ? <button type="button" onClick={send} style={textBtn}>שליחת קוד חדש</button> : <span>קוד חדש בעוד 0:{String(left).padStart(2, "0")}</span>}
                <button type="button" onClick={() => setStep("phone")} style={{ ...textBtn, color: "#3A2826" }}>שינוי מספר</button>
              </div>
              <span style={{ fontSize: 13, color: "#8A6C64" }}>לצורך ההדגמה, כל קוד בן 6 ספרות יעבוד.</span>
            </div>
          )}
          {step === "name" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: FF, fontWeight: 400, fontSize: 32, lineHeight: 1.1 }}>נעים להכיר</span>
                <span style={{ fontSize: 15, lineHeight: 1.55, color: "#6E5650" }}>שלב אחרון. כמה פרטים כדי שנוכל להתאים לך מוצרים ולשלוח אלייך הזמנות.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 88px", gap: 10 }}>
                <Soft label="שם מלא" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="השם שלך" />
                <Soft label="גיל" value={form.age} onChange={(age) => setForm({ ...form, age })} placeholder="—" type="number" center />
              </div>
              <Soft label="אימייל" value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="name@email.com" type="email" ltr />
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr)", gap: 10 }}>
                <Soft label="עיר" value={form.city} onChange={(city) => setForm({ ...form, city })} placeholder="עיר" />
                <Soft label="רחוב ומספר" value={form.addr} onChange={(addr) => setForm({ ...form, addr })} placeholder="רחוב ומספר" />
              </div>
              <Soft label="תאריך לידה משוער" value={form.due} onChange={(due) => setForm({ ...form, due })} type="date" />
              <button type="button" disabled={!nameOk} onClick={() => finish({ ...form, phone, isNew: true })} style={{ height: 54, border: 0, borderRadius: 999, background: nameOk ? "#3A2826" : "#E6D2C6", color: "#FFFFFF", fontSize: 16, fontWeight: 600 }}>יצירת החשבון</button>
            </div>
          )}
          {step === "done" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 0 12px", textAlign: "center" }}>
              <span style={{ width: 64, height: 64, borderRadius: "50%", background: "#F3D9C6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✓</span>
              <span style={{ fontFamily: FF, fontWeight: 400, fontSize: 30 }}>היי {form.name || findUser(phone)?.name}</span>
              <span style={{ fontSize: 16, color: "#5E4844" }}>מעבירים אותך לאזור האישי</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Soft({ label, value, onChange, placeholder, type, ltr, center }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; ltr?: boolean; center?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 500, color: "#8A6C64" }}>{label}
      <input value={value} type={type || "text"} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ height: 50, border: "1.5px solid transparent", borderRadius: 14, padding: "0 16px", fontSize: 16, fontFamily: "inherit", color: "#3A2826", outline: "none", width: "100%", background: "#FBF5F1", ...(ltr ? { direction: "ltr" as const, textAlign: "right" as const } : null), ...(center ? { textAlign: "center" as const } : null) }} />
    </label>
  );
}

const textBtn: CSSProperties = { background: "transparent", border: 0, padding: 0, fontSize: 14, color: "#A85A3A", textDecoration: "underline" };

function CartDrawer() {
  const site = useSite();
  const total = site.items.reduce((a, x) => a + x.price * x.qty, 0);
  const { present, visible } = useShown(site.cartOpen);
  if (!present) return null;
  const open = visible;
  const ship = total >= 250 ? "✓ מגיע לך משלוח חינם" : "עוד " + fmt(250 - total) + " ומקבלים משלוח חינם";
  return (
    <>
      <div onClick={site.closeCart} style={backdrop(70, open)} />
      <aside data-scroll-lock-allow style={panel(open, site.mobile, true)} aria-label="סל קניות">
        {site.mobile && <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}><span style={{ width: 44, height: 4, borderRadius: 2, background: "#D8C3B6" }} /></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: FF, fontWeight: 400, fontSize: 28, letterSpacing: "-.01em" }}>הסל שלך</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#A85A3A", background: "#F8EFE9", padding: "4px 10px", borderRadius: 999 }}>{site.cartCount === 1 ? "פריט אחד" : site.cartCount + " פריטים"}</span>
          </div>
          <Hx as="button" onClick={site.closeCart} aria-label="סגירה" style={{ ...closeBtn, borderColor: "#E6D2C6" }} hover={{ background: "#3A2826", color: "#FFFFFF", borderColor: "#3A2826" }}>✕</Hx>
        </div>
        <div style={{ margin: "0 24px", padding: "14px 16px", borderRadius: 16, background: "#FBF5F1", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#3A2826" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A85A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg>
            <span>{ship}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "#EBDAD0", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#A85A3A", width: Math.min(100, (total / 250) * 100) + "%", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }} />
          </div>
        </div>
        {!site.items.length ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "40px 24px", textAlign: "center" }}>
            <span style={{ width: 76, height: 76, borderRadius: "50%", background: "#F8EFE9", display: "flex", alignItems: "center", justifyContent: "center", color: "#A85A3A" }}><IconBag size={30} /></span>
            <span style={{ fontFamily: FF, fontWeight: 400, fontSize: 24 }}>הסל עדיין ריק</span>
            <span style={{ fontSize: 15, color: "#6E5650", maxWidth: 260, lineHeight: 1.5 }}>מוצרים בטוחים להריון ולאחר לידה מחכים לך באתר</span>
            <Link href="/products" onClick={site.closeCart} style={{ marginTop: 6, background: "#3A2826", color: "#FFFFFF", height: 50, padding: "0 28px", borderRadius: 999, fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>למוצרים של Oli</Link>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px", display: "flex", flexDirection: "column" }}>
              {site.items.map((x, i) => (
                <div key={x.id} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: "1px solid #F1E5DD", opacity: open ? 1 : 0, transform: open ? "none" : "translateY(14px)", transition: `opacity .45s ease ${open ? 0.2 + i * 0.06 : 0}s, transform .5s cubic-bezier(.2,.8,.2,1) ${open ? 0.2 + i * 0.06 : 0}s` }}>
                  <div style={{ ...thumbStyle(x.image), width: 88, height: 110, borderRadius: 14 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 18, lineHeight: 1.2 }}>{x.name}</span>
                      <button type="button" onClick={() => site.setQty(x.id, -x.qty)} aria-label="הסרה" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: 0, background: "transparent", color: "#8A6C64", fontSize: 12 }}>✕</button>
                    </div>
                    <span style={{ fontSize: 13, color: "#6E5650", lineHeight: 1.45 }}>{x.sub}</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", background: "#F8EFE9", borderRadius: 999, height: 34, padding: "0 2px" }}>
                        <button type="button" onClick={() => site.setQty(x.id, 1)} aria-label="הוספה" style={qtyBtn}>+</button>
                        <span style={{ minWidth: 22, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{x.qty}</span>
                        <button type="button" onClick={() => site.setQty(x.id, -1)} aria-label="הפחתה" style={qtyBtn}>−</button>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 16, whiteSpace: "nowrap" }}>{fmt(x.price * x.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "18px 24px calc(20px + env(safe-area-inset-bottom))", borderTop: "1px solid #F1E5DD", display: "flex", flexDirection: "column", gap: 14, background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 15, color: "#5E4844" }}>סכום ביניים</span>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 24 }}>{fmt(total)}</span>
              </div>
              <Hx as={Link} href="/checkout" prefetch={false} onClick={site.closeCart} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#3A2826", color: "#FFFFFF", border: 0, height: 58, padding: "0 26px", borderRadius: 999, fontSize: 16, fontWeight: 600 }} hover={{ background: "#A85A3A" }}><span>למעבר לתשלום</span><span style={{ fontSize: 18 }}>←</span></Hx>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#6E5650" }}>
                <span>משלוח ומבצעים יחושבו בקופה</span>
                <button type="button" onClick={site.closeCart} style={{ background: "transparent", color: "#3A2826", border: 0, fontSize: 13, textDecoration: "underline", padding: "4px 0" }}>המשך קנייה</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

const qtyBtn = { width: 32, height: 32, border: 0, borderRadius: "50%", background: "transparent", color: "#3A2826", fontSize: 16 } as const;

function backdrop(z: number, on: boolean) {
  return {
    position: "fixed" as const, inset: 0, zIndex: z, background: "rgba(42,28,26,.42)",
    backdropFilter: on ? "blur(3px)" : "none", opacity: on ? 1 : 0,
    pointerEvents: on ? ("auto" as const) : ("none" as const), transition: "opacity .45s ease",
  };
}

function panel(open: boolean, mobile: boolean, cart: boolean) {
  const base = { zIndex: cart ? 71 : 73, background: "#FFFFFF", color: "#3A2826", display: "flex", flexDirection: "column" as const };
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
  const router = useRouter();
  const site = useSite();
  const user = useOliUser();
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
    <PromoGate>
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="chrome-clear top" aria-hidden />
      <div className="chrome-clear bottom" aria-hidden />
      <Promo />
      <Header />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      <SiteFooter />
      <SearchOverlay />
      <AccountDrawer />
      <CartDrawer />
      <A11yWidget />
      <PromoFivePercent
        hidden={pathname === "/contact" || pathname.startsWith("/checkout") || !!user || site.menu || site.search || site.account || site.cartOpen}
        onShop={() => router.push("/products")}
      />
    </div>
    </PromoGate>
  );
}
