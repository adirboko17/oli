'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SHOWS } from './podcastShows';
import './Final.css';

// Podcast page. Works for both podcasts: <PodcastPage show="safe" /> or <PodcastPage show="free" />
// Clicking an episode opens the podcast on Spotify.
export default function PodcastPage({ show }: { show: 'safe' | 'free' }) {
  const S = SHOWS[show];
  const other = SHOWS[show === 'safe' ? 'free' : 'safe'];
  const [q, setQ] = useState('');
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(12);

  const hours = useMemo(() => Math.round(S.episodes.reduce((a, e) => { const [m, s] = e.dur.split(':').map(Number); return a + m + s / 60; }, 0) / 60), [S]);
  const latest = S.episodes[S.episodes.length - 1];
  const list = useMemo(() => {
    const t = q.trim();
    const f = S.episodes.filter(e => !t || e.title.includes(t) || String(e.n) === t);
    return asc ? f : f.slice().reverse();
  }, [S, q, asc]);

  return (
    <main className="fp" dir="rtl">
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <div className="fp-hero__text">
            <span className="fp-eyebrow fp-eyebrow--light">{S.eyebrow}</span>
            <h1 className="fp-hero__title">{S.title}</h1>
            <p className="fp-hero__lead">{S.lead}</p>
            <div className="fp-hero__btns">
              <a href={S.spotify} target="_blank" rel="noopener" className="fp-btn fp-btn--peach">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>האזנה ב-Spotify
              </a>
              <a href={S.apple} target="_blank" rel="noopener" className="fp-btn fp-btn--peach">
                <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>האזנה ב-Apple Podcasts
              </a>
              <Link href={`/podcast/${other.id}`} className="fp-hero__other">לפודקאסט {other.title}</Link>
            </div>
            <div className="fp-stats">
              <span><b>{S.episodes.length}</b>פרקים</span>
              <span><b>{hours}</b>שעות האזנה</span>
            </div>
          </div>
          <div className="fp-cover-wrap">
            <div className="fp-cover" role="img" aria-label={S.title} style={{ backgroundImage: `url("${S.cover}")` }} />
            <div className="fp-host"><b>{S.host}</b><span>{S.hostDesc}</span></div>
          </div>
        </div>
      </section>

      <section className="fp-list">
        <div className="fp-latest-wrap">
          <span className="fp-eyebrow">הפרק החדש</span>
          <a href={S.spotify} target="_blank" rel="noopener" className="fp-latest">
            <span className="fp-latest__play"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
            <span className="fp-latest__text">
              <span className="fp-latest__meta">פרק {latest.n} · {latest.dur}</span>
              <span className="fp-latest__title">{latest.title}</span>
              {latest.desc && <span className="fp-latest__desc">{latest.desc}</span>}
            </span>
          </a>
        </div>

        <div className="fp-toolbar">
          <h2 className="fp-h2">כל הפרקים</h2>
          <div className="fp-tools">
            <label className="fp-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E5650" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input value={q} onChange={e => { setQ(e.target.value); setLimit(12); }} placeholder="חיפוש פרק, נושא או אורח/ת" />
            </label>
            <button className="fp-sort" onClick={() => setAsc(!asc)}>{asc ? 'מהראשון' : 'מהחדש'}</button>
          </div>
        </div>

        <div className="fp-eps">
          {list.slice(0, limit).map(e => (
            <a key={e.n} href={S.spotify} target="_blank" rel="noopener" className="fp-ep">
              <span className="fp-ep__num">{String(e.n).padStart(2, '0')}</span>
              <span className="fp-ep__title">{e.title}</span>
              <span className="fp-ep__end"><span>{e.dur}</span><span className="fp-ep__play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span></span>
            </a>
          ))}
        </div>
        {!list.length && <p className="fp-empty">לא נמצאו פרקים. נסי מילה אחרת.</p>}
        {list.length > limit && <button className="fp-btn fp-btn--dark fp-more" onClick={() => setLimit(limit + 12)}>עוד פרקים ({list.length - limit})</button>}
      </section>
    </main>
  );
}
