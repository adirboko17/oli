"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isArticleSection } from "@/lib/article-paths";
import { menuHref } from "@/lib/catalog-menu";
import { useSite } from "@/components/site";
import { PodcastMenuSub } from "@/components/podcasts/PodcastMenu";
import "./MobileMenu.css";

export type MenuCategory = {
  label: string;
  href: string;
  count?: number;
  cms: "nav" | "category";
  cmsId: string;
};

type Props = {
  categories: MenuCategory[];
  onAccount: () => void;
  accountLabel?: string;
};

const LINKS: { id: string; label: string; href: string; match: string[] }[] = [
  { id: "home", label: "דף הבית", href: "/", match: ["/"] },
  { id: "products", label: "המוצרים של Oli", href: "/products", match: ["/products", "/product", "/olimini"] },
  { id: "gifts", label: "מתנות ליולדת", href: menuHref("מתנה"), match: [] },
  { id: "stores", label: "Oli בחנויות", href: "/stores", match: ["/stores"] },
  { id: "articles", label: "מאמרים", href: "/articles", match: ["/articles", "/journal"] },
  { id: "podcast", label: "פודקאסט", href: "/podcast", match: ["/podcast"] },
  { id: "contact", label: "צרי קשר", href: "/contact", match: ["/contact"] },
];

const isActive = (path: string, match: string[]) =>
  match.some((item) => (item === "/" ? path === "/" : path.startsWith(item)));

export default function MobileMenu({ categories, onAccount, accountLabel = "החשבון שלי" }: Props) {
  const site = useSite();
  const open = site.menu;
  const [sub, setSub] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const path = usePathname() || "/";
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSub(false); setPodOpen(false); }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") site.closeMenu(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, site]);

  const close = () => site.closeMenu();

  return (
    <>
      <button
        className={`om-burger${open ? " is-open" : ""}`}
        aria-label={open ? "סגירת תפריט" : "תפריט"}
        aria-expanded={open}
        aria-controls="oli-mobile-menu"
        onClick={site.toggleMenu}
        type="button"
      >
        <span className="om-burger__bar om-burger__bar--1" />
        <span className="om-burger__bar om-burger__bar--2" />
      </button>

      <div className={`om-backdrop${open ? " is-open" : ""}`} onClick={close} aria-hidden />

      <div id="oli-mobile-menu" ref={panelRef} className={`om-panel${open ? " is-open" : ""}`} dir="rtl" aria-hidden={!open}>
        <nav className="om-list">
          {LINKS.map((link, index) => {
            const active = link.id === "articles" ? isArticleSection(path) : isActive(path, link.match);
            const style = { ["--i" as string]: index } as React.CSSProperties;

            if (link.id === "podcast") {
              return (
                <div key={link.href}>
                  <button className={`om-item${active ? " is-active" : ""}`} style={style} aria-expanded={podOpen} data-cms="nav" data-cms-id={link.id} onClick={() => setPodOpen((value) => !value)} type="button">
                    <span>{link.label}</span>
                    <span className={`om-plus${podOpen ? " is-open" : ""}`}>+</span>
                  </button>
                  <PodcastMenuSub open={podOpen} onNavigate={close} />
                </div>
              );
            }

            if (link.id === "products") {
              return (
                <div key={link.href}>
                  <button className={`om-item${active ? " is-active" : ""}`} style={style} aria-expanded={sub} data-cms="nav" data-cms-id={link.id} onClick={() => setSub((value) => !value)} type="button">
                    <span>{link.label}</span>
                    <span className={`om-plus${sub ? " is-open" : ""}`}>+</span>
                  </button>
                  <div className={`om-sub${sub ? " is-open" : ""}`}>
                    <div className="om-sub__inner">
                      {categories.map((category) => (
                        <Link key={category.cmsId} href={category.href} className="om-chip" data-cms={category.cms} data-cms-id={category.cmsId} onClick={close}>
                          {category.label}{category.count != null && <span className="om-chip__count">{category.count}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={`om-item${active ? " is-active" : ""}`} style={style} data-cms="nav" data-cms-id={link.id} onClick={close}>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="om-foot">
          <button className="om-account" onClick={() => { close(); onAccount(); }} type="button">
            <span className="om-account__avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            </span>
            <span className="om-account__text">
              <span className="om-account__title">{accountLabel}</span>
              <span className="om-account__sub">הזמנות, פרטים והטבות</span>
            </span>
            <span className="om-account__arrow">←</span>
          </button>

          <div className="om-social">
            <a href="https://instagram.com/oli_safecare" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
            </a>
            <a href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noopener" aria-label="Spotify">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3-1 6.5-.8 9.2.7M8 12.6c2.5-.7 5.3-.5 7.5.7M8.6 15.4c2-.5 4-.3 5.7.6" /></svg>
            </a>
            <a href="https://wa.me/972559739670" target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.29A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
