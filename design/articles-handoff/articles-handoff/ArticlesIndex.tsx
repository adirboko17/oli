'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ARTICLES, CATEGORIES, CategoryKey } from './articles';
import { ArticleCard } from './ArticleCard';
import { LatestMarquee } from './LatestMarquee';
import './Articles.css';

const PAGE = 12;

// Articles page: header, latest-articles marquee, category tabs + search, card grid with "show more"
export default function ArticlesIndex({ initialCategory = 'all' }: { initialCategory?: 'all' | CategoryKey }) {
  const [cat, setCat] = useState<'all' | CategoryKey>(initialCategory);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const t = q.trim();
    return ARTICLES.filter(a => (cat === 'all' || a.category === cat) && (!t || a.title.includes(t)));
  }, [cat, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ARTICLES.length };
    ARTICLES.forEach(a => { c[a.category] = (c[a.category] || 0) + 1; });
    return c;
  }, []);

  const remaining = list.length - limit;

  return (
    <main className="oa-page" dir="rtl">
      <section className="oa-container oa-index">
        <nav className="oa-crumbs"><Link href="/">דף הבית</Link><span>/</span><span className="oa-crumbs__current">מאמרים</span></nav>

        <header className="oa-index__head">
          <span className="oa-eyebrow">ידע מבוסס מחקר</span>
          <h1 className="oa-index__title">מאמרים וטיפים להריון וללידה</h1>
          <p className="oa-index__intro">בעמוד המאמרים שלנו תמצאי מידע מקצועי ועדכני על הריון, לידה ותינוקות. אנו משתפות מדריכים להריון, טיפים להכנת הגוף ללידה, טיפים להריון, מידע על בדיקות בהריון, טיפול בעור בתקופת ההריון ולאחר הלידה ועוד. כל התכנים נכתבים בליווי אנשי מקצוע, במטרה להעניק ידע אמין שיסייע לך לעבור את תקופת ההריון והלידה בצורה רגועה.</p>
        </header>

        <LatestMarquee />

        <div className="oa-index__list">
          <div className="oa-toolbar">
            <nav className="oa-tabs" role="tablist">
              {(Object.keys(CATEGORIES) as ('all' | CategoryKey)[]).map(k => (
                <button key={k} role="tab" aria-selected={cat === k} className={`oa-tab${cat === k ? ' is-active' : ''}`}
                  onClick={() => { setCat(k); setLimit(PAGE); }}>
                  {CATEGORIES[k]}<span className="oa-tab__count">{counts[k] || 0}</span>
                </button>
              ))}
            </nav>
            <label className="oa-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E5650" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder="חיפוש מאמר" aria-label="חיפוש מאמר" />
            </label>
          </div>

          <div className="oa-grid">
            {list.slice(0, limit).map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>

          {!list.length && <p className="oa-empty">לא נמצאו מאמרים. נסי מילה אחרת.</p>}
          {remaining > 0 && (
            <button className="oa-btn oa-more" onClick={() => setLimit(limit + PAGE)}>
              הצגת עוד {Math.min(PAGE, remaining)} מאמרים
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
