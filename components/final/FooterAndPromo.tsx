'use client';
import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOliUser } from '@/lib/account-session';
import { useSite } from '@/components/site';
import './Final.css';

/* ---------- 1. The 5% line on the product page ---------- */
// Place it right below the "הוספה לסל" button and the shipping line. Opens the 5% quiz.
// Hide it for logged-in users and for anyone who already finished the quiz.
export function FirstOrderLine({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="fo-line" onClick={onOpen}>
      <span className="fo-line__start">
        <span className="fo-line__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="9" width="17" height="11.5" rx="2" /><path d="M2.5 9h19v-3h-19z" /><path d="M12 6v14.5" /><path d="M12 6c-1.6-3.2-5.2-3-5.2-.8C6.8 6 9 6 12 6zM12 6c1.6-3.2 5.2-3 5.2-.8C17.2 6 15 6 12 6z" /></svg>
        </span>
        <span className="fo-line__text">הזמנה ראשונה? מגיע לך <b>5% הנחה</b></span>
      </span>
      <span className="fo-line__cta">לקבלת ההטבה</span>
    </button>
  );
}

/* ---------- 2. Footer ---------- */
type L = { label: string; href: string; external?: boolean; onClick?: (event: MouseEvent<HTMLAnchorElement>) => void };
const COLS: { title: string; links: L[] }[] = [
  { title: 'חנות', links: [{ label: 'כל המוצרים', href: '/products' }, { label: 'מתנות ליולדת', href: '/products?cat=' + encodeURIComponent('מתנה') }, { label: 'תינוקות · olimini', href: '/olimini' }, { label: 'המומלצים ביותר', href: '/products' }, { label: 'Oli בחנויות', href: '/stores' }] },
  { title: 'ידע', links: [{ label: 'מאמרים', href: '/articles' }, { label: 'היריון בטוח · פודקאסט', href: '/podcast/safe' }, { label: 'חופשיה ללדת · פודקאסט', href: '/podcast/free' }] },
  { title: 'שירות', links: [{ label: 'צרי קשר', href: '/contact' }, { label: 'החשבון שלי', href: '/account' }, { label: 'וואטסאפ', href: 'https://wa.me/972559739670', external: true }] },
  { title: 'מידע', links: [{ label: 'תקנון האתר', href: '/terms' }, { label: 'מדיניות פרטיות', href: '/privacy' }, { label: 'הצהרת נגישות', href: '/accessibility' }] },
];

const WA = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.29A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" /></svg>;

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/oli_safecare', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg> },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100093537736476', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.5l.5-3.5h-3V8z" /></svg> },
  { label: 'Spotify', href: 'https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3-1 6.5-.8 9.2.7M8 12.6c2.5-.7 5.3-.5 7.5.7M8.6 15.4c2-.5 4-.3 5.7.6" /></svg> },
  { label: 'YouTube', href: 'https://youtube.com/@olisafecare', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" /></svg> },
  { label: 'WhatsApp', href: 'https://wa.me/972559739670', icon: WA },
];

function FLink({ l, className }: { l: L; className: string }) {
  return l.external ? <a href={l.href} target="_blank" rel="noopener" className={className}>{l.label}</a> : <Link href={l.href} className={className} onClick={l.onClick}>{l.label}</Link>;
}

// Desktop: 4 columns. Mobile: columns collapse into an accordion.
export function SiteFooter() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const site = useSite();
  const router = useRouter();
  const user = useOliUser();
  const cols = COLS.map((col) => ({
    ...col,
    links: col.links.map((link) => link.label === 'החשבון שלי'
      ? { ...link, onClick: (event: MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); if (user) router.push('/account'); else site.openAccount(); } }
      : link),
  }));
  return (
    <footer className="ft" dir="rtl">
      <div className="ft__inner">
        <div className="ft__top">
          <div className="ft__brand">
            <img src="/assets/logo-white.png" alt="Oli Safe Care" className="ft__logo" />
            <p className="ft__tag">מוצרי טיפוח בטוחים, יעילים ומפנקים למסע היקר של ההריון ולאחריו.</p>
          </div>
          <div className="ft__help">
            <span className="ft__eyebrow">יש שאלה? אנחנו כאן</span>
            <div className="ft__help-btns">
              <a href="https://wa.me/972559739670" target="_blank" rel="noopener" className="ft__wa">{WA}וואטסאפ</a>
              <Link href="/contact" className="ft__contact">צרי קשר</Link>
            </div>
          </div>
        </div>

        <div className="ft__cols">
          {cols.map(c => (
            <div key={c.title} className="ft__col">
              <span className="ft__eyebrow">{c.title}</span>
              {c.links.map(l => <FLink key={l.label} l={l} className="ft__link" />)}
            </div>
          ))}
        </div>

        <div className="ft__acc">
          {cols.map((c, i) => (
            <div key={c.title} className="ft__acc-item">
              <button className="ft__acc-btn" aria-expanded={!!open[i]} onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>
                {c.title}<span className={`ft__plus${open[i] ? ' is-on' : ''}`}>+</span>
              </button>
              <div className={`ft__acc-body${open[i] ? ' is-on' : ''}`}><div><div className="ft__acc-links">{c.links.map(l => <FLink key={l.label} l={l} className="ft__link" />)}</div></div></div>
            </div>
          ))}
        </div>

        <div className="ft__social-row">
          <div className="ft__social">{SOCIAL.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label}>{s.icon}</a>)}</div>
          <a href="mailto:info@olisafecare.com" className="ft__mail">info@olisafecare.com</a>
        </div>
      </div>
      <div className="ft__bottom">
        <span>© {new Date().getFullYear()} Oli Safe Care · כל הזכויות שמורות</span>
        <span className="ft__legal"><Link href="/terms">תקנון</Link><Link href="/privacy">פרטיות</Link><Link href="/accessibility">נגישות</Link></span>
      </div>
    </footer>
  );
}
