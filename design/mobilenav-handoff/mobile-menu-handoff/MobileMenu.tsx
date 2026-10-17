'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './MobileMenu.css';

export type MenuCategory = { label: string; href: string; count?: number };

type Props = {
  categories: MenuCategory[];      // product categories (shown under "המוצרים של Oli")
  onAccount: () => void;           // opens the login / personal area
};

const LINKS: { label: string; href: string; match: string[] }[] = [
  { label: 'דף הבית', href: '/', match: ['/'] },
  { label: 'המוצרים של Oli', href: '/products', match: ['/products', '/product'] }, // has sub-categories
  { label: 'מתנות ליולדת', href: '/products?category=gift', match: [] },
  { label: 'Oli בחנויות', href: '/stores', match: ['/stores'] },
  { label: 'מאמרים', href: '/articles', match: ['/articles'] },
  { label: 'פודקאסט', href: '/podcast', match: ['/podcast'] },
];

const isActive = (path: string, match: string[]) =>
  match.some(m => (m === '/' ? path === '/' : path.startsWith(m)));

// Mobile menu: a burger button that opens a small floating white card below it.
// Place it at the start of the mobile header (on the right in RTL). The header must be position: relative/sticky.
export default function MobileMenu({ categories, onAccount }: Props) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const path = usePathname() || '/';
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation
  useEffect(() => { setOpen(false); setSub(false); }, [path]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className={`om-burger${open ? ' is-open' : ''}`}
        aria-label={open ? 'סגירת תפריט' : 'תפריט'}
        aria-expanded={open}
        aria-controls="oli-mobile-menu"
        onClick={() => setOpen(o => !o)}
      >
        <span className="om-burger__bar om-burger__bar--1" />
        <span className="om-burger__bar om-burger__bar--2" />
      </button>

      <div className={`om-backdrop${open ? ' is-open' : ''}`} onClick={close} aria-hidden />

      <div id="oli-mobile-menu" ref={panelRef} className={`om-panel${open ? ' is-open' : ''}`} dir="rtl" aria-hidden={!open}>
        <nav className="om-list">
          {LINKS.map((l, i) => {
            const active = isActive(path, l.match);
            const style = { ['--i' as string]: i } as React.CSSProperties;

            if (i === 1) {
              return (
                <div key={l.href}>
                  <button className={`om-item${active ? ' is-active' : ''}`} style={style} aria-expanded={sub} onClick={() => setSub(s => !s)}>
                    <span>{l.label}</span>
                    <span className={`om-plus${sub ? ' is-open' : ''}`}>+</span>
                  </button>
                  <div className={`om-sub${sub ? ' is-open' : ''}`}>
                    <div className="om-sub__inner">
                      {categories.map(c => (
                        <Link key={c.href} href={c.href} className="om-chip" onClick={close}>
                          {c.label}{c.count != null && <span className="om-chip__count">{c.count}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={l.href} href={l.href} className={`om-item${active ? ' is-active' : ''}`} style={style} onClick={close}>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="om-foot">
          <button className="om-account" onClick={() => { close(); onAccount(); }}>
            <span className="om-account__avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            </span>
            <span className="om-account__text">
              <span className="om-account__title">החשבון שלי</span>
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
