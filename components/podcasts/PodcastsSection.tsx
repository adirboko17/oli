import type { ReactNode } from 'react';
import Link from 'next/link';
import { PODCASTS, Podcast } from './podcasts';
import './Podcasts.css';

const Play = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

function PLink({ p, className, children }: { p: Podcast; className: string; children: ReactNode }) {
  return p.external
    ? <a href={p.href} target="_blank" rel="noopener" className={className}>{children}</a>
    : <Link href={p.href} className={className}>{children}</Link>;
}

// "המומחים מדברים" section on the home page.
// Desktop: two horizontal rows (cover + text). Mobile (<768px): two cards side by side, one dark and one apricot.
export default function PodcastsSection() {
  return (
    <section className="opd-section" dir="rtl">
      <div className="opd-inner">
        <div className="opd-head">
          <h2 className="opd-title">המומחים מדברים</h2>
          <p className="opd-lead">אנו מאמינות כי ידע הוא כוח וחשוב שהידע יגיע ממקור מוסמך ואמין.</p>
        </div>

        {/* Desktop */}
        <div className="opd-desk">
          {PODCASTS.map(p => (
            <PLink key={p.id} p={p} className="opd-row">
              <div className="opd-row__cover">
                <img src={p.cover} alt={`${p.title}, ${p.host}`} />
                <span className="opd-row__play">▶</span>
              </div>
              <div className="opd-row__text">
                <span className="opd-row__eyebrow">פודקאסט</span>
                <h3 className="opd-row__title">"{p.title}"</h3>
                <p className="opd-row__desc">{p.desc}</p>
                <span className="opd-row__cta">להאזנה ←</span>
              </div>
            </PLink>
          ))}
        </div>

        {/* Mobile */}
        <div className="opd-mob">
          {PODCASTS.map((p, i) => (
            <PLink key={p.id} p={p} className={`opd-card ${i === 0 ? 'opd-card--dark' : 'opd-card--peach'}`}>
              <div className="opd-card__cover">
                <img src={p.cover} alt={`${p.title}, ${p.host}`} />
                <span className="opd-card__play"><Play /></span>
              </div>
              <div className="opd-card__text">
                <span className="opd-card__eyebrow">פודקאסט</span>
                <h3 className="opd-card__title">"{p.title}"</h3>
                <p className="opd-card__sub">{p.mobileSub}</p>
              </div>
              <span className="opd-card__cta">להאזנה<span>←</span></span>
            </PLink>
          ))}
        </div>
      </div>
    </section>
  );
}
