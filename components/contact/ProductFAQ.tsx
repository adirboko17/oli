'use client';
import { useState } from 'react';
import './ProductFAQ.css';

export type FaqItem = { q: string; a: string; tag: string };

// Olilastic questions. For each product, pass its own list via the items prop.
export const OLILASTIC_FAQ: FaqItem[] = [
  { q: 'מאיזה שבוע בהריון מומלץ להתחיל למרוח?', a: 'מומלץ להתחיל החל מהשבוע ה-12 להריון. בשבוע זה הבטן יוצאת מהאגן הקטן ומתחילה הגדילה. כדאי להמשיך גם מספר חודשים לאחר הלידה.', tag: 'use' },
  { q: 'כמה פעמים ביום צריך למרוח?', a: 'פעמיים ביום, בוקר וערב. מומלץ למרוח לאחר מקלחת חמה, כשהעור רך וקולט טוב יותר.', tag: 'use' },
  { q: 'על אילו אזורים כדאי למרוח?', a: 'בכל האזורים שנוטים להימתח: בטן, חזה, ירכיים וישבן. אפשר למרוח גם בשוקיים.', tag: 'use' },
  { q: 'ממה עשויה החמאה?', a: 'Olilastic מכילה תערובת ייחודית של שמנים שהראו יעילות מחקרית: שמן חוחובה, שמן שקדים ושמן זית. השמנים מגבירים את האלסטיות של העור ומעודדים התחדשות מהירה יותר שלו.', tag: 'ing' },
  { q: 'אפשר להמשיך להשתמש גם אחרי הלידה?', a: 'כן. ממליצים להמשיך את הטיפול כמה חודשים לאחר הלידה כדי להגביר את האלסטיות של העור ולהחיש את הריפוי של סימנים שכבר נוצרו.', tag: 'post' },
  { q: 'יש הנחה אם קונים שתי חמאות?', a: 'כן, יש הנחה ברכישת שתי חמאות. בוחרים "זוג חמאות" בעמוד המוצר וההנחה מתעדכנת אוטומטית בסל.', tag: 'buy' },
];

const TAGS: Record<string, string> = { all: 'הכל', use: 'שימוש', ing: 'רכיבים', post: 'אחרי לידה', buy: 'רכישה' };

// "שאלות ותשובות" on the product page (below the reviews).
// Desktop: title on the side (sticky) + list. Mobile: title above the list.
export default function ProductFAQ({ items = [], whatsapp = 'https://wa.me/972559739670' }: { items?: FaqItem[]; whatsapp?: string }) {
  const [tag, setTag] = useState('all');
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  const usedTags = ['all', ...Array.from(new Set(items.map(i => i.tag)))].filter(k => TAGS[k]);
  const list = items.map((it, i) => ({ ...it, i })).filter(x => tag === 'all' || x.tag === tag);

  return (
    <section className="pfq" dir="rtl">
      <div className="pfq__inner">
        <aside className="pfq__aside">
          <span className="pfq__eyebrow">יש לך שאלה?</span>
          <h2 className="pfq__title">שאלות ותשובות</h2>
          <p className="pfq__lead">כל מה שחשוב לדעת על המוצר</p>
          <a href={whatsapp} target="_blank" rel="noopener" className="pfq__ask">יש לך שאלה אחרת? כתבי לנו ←</a>
        </aside>

        <div className="pfq__main">
          <div className="pfq__tags" role="tablist">
            {usedTags.map(k => (
              <button key={k} role="tab" aria-selected={tag === k} className={`pfq__tag${tag === k ? ' is-on' : ''}`} onClick={() => setTag(k)}>{TAGS[k]}</button>
            ))}
          </div>
          <div className="pfq__list">
            {list.map(x => {
              const on = !!open[x.i];
              return (
                <div key={x.i} className="pfq__item">
                  <button className="pfq__q" aria-expanded={on} onClick={() => setOpen(o => ({ ...o, [x.i]: !on }))}>
                    <span>{x.q}</span>
                    <span className={`pfq__plus${on ? ' is-on' : ''}`} aria-hidden>+</span>
                  </button>
                  <div className={`pfq__a${on ? ' is-on' : ''}`}>
                    <div><p style={{ whiteSpace: "pre-line" }}>{x.a}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
