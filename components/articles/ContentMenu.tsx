"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ARTICLES } from "@/components/articles/articles";
import { upcomingEvents } from "@/components/events/events";
import "./ContentMenu.css";

const ITEMS = [
  { id: "articles", label: "מאמרים", href: "/articles", note: `${ARTICLES.length} מאמרים מקצועיים` },
  { id: "events", label: "אירועים", href: "/events", note: `${upcomingEvents().filter((event) => event.status !== "cancelled").length} מפגשים קרובים` },
];

export function ArticlesEventsNav({ active = false }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enter = () => { clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 120); };

  return (
    <div className="aen-nav" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      <Link href="/articles" data-cms="nav" data-cms-id="articles-events" className={`aen-nav__link${active ? " is-active" : ""}`} aria-haspopup="true" aria-expanded={open}>מאמרים ואירועים</Link>
      <svg className={`aen-nav__chev${open ? " is-open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      <div className={`aen-drop${open ? " is-open" : ""}`} dir="rtl">
        {ITEMS.map((item) => (
          <Link key={item.id} href={item.href} data-cms="nav" data-cms-id={item.id} className="aen-mi" onClick={() => setOpen(false)}><b>{item.label}</b><span>{item.note}</span></Link>
        ))}
      </div>
    </div>
  );
}

export function ArticlesEventsMenuSub({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <div className={`aen-msub${open ? " is-open" : ""}`}>
      <div className="aen-msub__inner">
        {ITEMS.map((item) => (
          <Link key={item.id} href={item.href} className="aen-mi" data-cms="nav" data-cms-id={item.id} onClick={onNavigate}><b>{item.label}</b><span>{item.note}</span></Link>
        ))}
      </div>
    </div>
  );
}
