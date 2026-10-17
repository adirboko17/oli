'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { PODCASTS, Podcast } from './podcasts';
import './Podcasts.css';

// A podcast row (cover + name + host). Used in both the desktop dropdown and the mobile menu.
export function PodcastRow({ p, onNavigate }: { p: Podcast; onNavigate?: () => void }) {
  const inner = (
    <>
      <span className="opd-mi__cover" style={{ backgroundImage: `url("${p.cover}")` }}>
        <span className="opd-mi__play"><svg width="7" height="7" viewBox="0 0 24 24" fill="#3A2826"><path d="M8 5v14l11-7z" /></svg></span>
      </span>
      <span className="opd-mi__text">
        <span className="opd-mi__title">{p.title}</span>
        <span className="opd-mi__host">{p.host}</span>
      </span>
    </>
  );
  return p.external
    ? <a href={p.href} target="_blank" rel="noopener" className="opd-mi" onClick={onNavigate}>{inner}</a>
    : <Link href={p.href} className="opd-mi" onClick={onNavigate}>{inner}</Link>;
}

// Desktop: the "פודקאסט" item in the main nav, with a dropdown that opens on hover (same behavior as "המוצרים של Oli")
export function PodcastNavDropdown({ active = false }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enter = () => { clearTimeout(t.current); setOpen(true); };
  const leave = () => { t.current = setTimeout(() => setOpen(false), 120); };

  return (
    <div className="opd-nav" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      <Link href="/podcast" data-cms="nav" data-cms-id="podcast" className={`opd-nav__link${active ? ' is-active' : ''}`} aria-haspopup="true" aria-expanded={open}>פודקאסט</Link>
      <svg className={`opd-nav__chev${open ? ' is-open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      <div className={`opd-drop${open ? ' is-open' : ''}`} dir="rtl">
        {PODCASTS.map(p => <PodcastRow key={p.id} p={p} onNavigate={() => setOpen(false)} />)}
      </div>
    </div>
  );
}

// Mobile: the expandable content under "פודקאסט" in the MobileMenu (see README)
export function PodcastMenuSub({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <div className={`opd-msub${open ? ' is-open' : ''}`}>
      <div className="opd-msub__inner">
        {PODCASTS.map(p => <PodcastRow key={p.id} p={p} onNavigate={onNavigate} />)}
      </div>
    </div>
  );
}
