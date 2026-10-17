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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>האזנה ב-Spotify
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
