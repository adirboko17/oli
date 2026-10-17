import Link from 'next/link';
import { ARTICLES, CATEGORIES, CATEGORY_TINT, articleNumber } from './articles';
import './Articles.css';

// "Latest articles" marquee: the first 10 articles, duplicated for a seamless loop. Pauses on hover.
export function LatestMarquee({ count = 10 }: { count?: number }) {
  const latest = ARTICLES.slice(0, count);
  const items = [...latest, ...latest];
  return (
    <div className="oa-marquee">
      <span className="oa-eyebrow oa-marquee__label">מאמרים אחרונים</span>
      <div className="oa-marquee__viewport">
        <div className="oa-marquee__track">
          {items.map((a, i) => (
            <Link key={i} href={`/articles/${a.slug}`} className="oa-pill" dir="rtl" aria-hidden={i >= latest.length || undefined} tabIndex={i >= latest.length ? -1 : undefined}>
              {a.image
                ? <span className="oa-pill__thumb" style={{ backgroundImage: `url("${a.image}")` }} />
                : <span className="oa-pill__thumb oa-pill__thumb--num" style={{ background: CATEGORY_TINT[a.category] }}>{articleNumber(a)}</span>}
              <span className="oa-pill__text">
                <span className="oa-pill__cat">{CATEGORIES[a.category]}</span>
                <span className="oa-pill__title">{a.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
