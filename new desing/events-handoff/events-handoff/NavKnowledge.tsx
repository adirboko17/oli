'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { upcomingEvents } from './events';

/** Desktop nav item "מאמרים ואירועים" with a hover sub-menu. Replaces the old "מאמרים" link (between "Oli בחנויות" and "פודקאסט"). */
export default function NavKnowledge({ articlesCount }: { articlesCount: number }) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const path = usePathname();
  const active = path.startsWith('/articles') || path.startsWith('/events');
  const evCount = upcomingEvents().filter(e => e.status !== 'cancelled').length;
  return (
    <div className="oe-navk" onMouseEnter={() => { clearTimeout(t.current); setOpen(true); }} onMouseLeave={() => { t.current = setTimeout(() => setOpen(false), 120); }}>
      <Link href="/articles" className={active ? 'is-active' : ''}>מאמרים ואירועים</Link>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`oe-navk__chev${open ? ' is-open' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
      <div className={`oe-navk__drop${open ? ' is-open' : ''}`}>
        <Link href="/articles"><b>מאמרים</b><span>{articlesCount} מאמרים מקצועיים</span></Link>
        <Link href="/events"><b>אירועים</b><span>{evCount} מפגשים קרובים</span></Link>
      </div>
    </div>
  );
}

/** Mobile menu: same two links as an expandable "+" item, like the podcast item. */
export const MOBILE_KNOWLEDGE_SUB = [
  { label: 'מאמרים', href: '/articles' },
  { label: 'אירועים', href: '/events' },
];
