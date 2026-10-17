'use client';
import Link from 'next/link';
import './OliminiPage.css';

export type MiniProduct = { id: string; name: string; sub: string; price: number; oldPrice?: number; image: string; href: string };

type Props = {
  products: MiniProduct[];                 // in order: Pre & Shower, After Shower, Baby Spa
  onAdd: (id: string) => void;              // add to cart
  formatPrice?: (n: number) => string;
};

const STEPS = [{ n: '1', name: 'רחצה' }, { n: '2', name: 'לחות' }, { n: '3', name: 'עיסוי' }];

// Floating bubbles: [left, top, size, duration, delay, opacity]
const FLOAT: [string, string, number, number, number, number][] = [
  ['6%', '18%', 70, 11, 0, .9], ['84%', '12%', 46, 8.5, -3, .8], ['74%', '56%', 96, 13, -5, .7], ['12%', '64%', 38, 9.5, -7, .8], ['48%', '8%', 28, 7, -2, .6],
];
// Rising bubbles: [left, size, duration, delay]
const RISE: [string, number, number, number][] = [['20%', 18, 16, 0], ['62%', 24, 19, -6], ['38%', 12, 14, -10], ['88%', 16, 17, -3], ['8%', 22, 21, -13]];

// olimini category page: hero with the wordmark and bubbles, the "החבילה של olimini" section (3 steps), and facts
export default function OliminiPage({ products, onAdd, formatPrice = n => '₪' + Math.round(n) }: Props) {
  const total = products.reduce((a, p) => a + p.price, 0);

  return (
    <main className="om" dir="rtl">
      <section className="om-hero">
        {FLOAT.map(([l, t, s, d, dl, o], i) => (
          <span key={'f' + i} className="om-bubble om-bubble--float" style={{ left: l, top: t, width: s, height: s, animationDuration: d + 's', animationDelay: dl + 's', opacity: o }} />
        ))}
        {RISE.map(([l, s, d, dl], i) => (
          <span key={'r' + i} className="om-bubble om-bubble--rise" style={{ left: l, width: s, height: s, animationDuration: d + 's', animationDelay: dl + 's' }} />
        ))}

        <div className="om-wrap">
          <nav className="om-crumbs"><Link href="/">דף הבית</Link><span>/</span><Link href="/products">המוצרים של Oli</Link><span>/</span><span className="om-crumbs__cur">olimini</span></nav>
        </div>

        <div className="om-hero__text">
          <span className="om-pill">חדש · BABY CARE</span>
          <h1 className="om-wordmark"><img src="/assets/olimini-logo.svg" alt="olimini" /></h1>
          <p className="om-hero__sub">קו הטיפוח הראשון שלנו לתינוקות</p>
          <p className="om-hero__lead">על בסיס רכיבים טבעיים, לעור העדין של התינוק מגיל לידה.</p>
          <div className="om-free">
            {['בלי סבונים', 'בלי פרפום', 'בלי פתלטים'].map(x => <span key={x}><b>✕</b>{x}</span>)}
          </div>
        </div>

        <div className="om-shelf">
          {products.map((p, i) => (
            <Link key={p.id} href={p.href} className={`om-shelf__item${i === 1 ? ' is-tall' : ''}`} aria-label={p.name}>
              <span className="om-shadow" />
              <span className="om-bottle" style={{ backgroundImage: `url("${p.image}")` }} />
            </Link>
          ))}
        </div>
        <div className="om-fade" />
      </section>

      <section className="om-steps-sec">
        <div className="om-steps-head">
          <span className="om-eyebrow">שלושה צעדים, רגע אחד שלכם</span>
          <h2 className="om-h2">החבילה של <span className="om-ltr">olimini</span></h2>
        </div>

        <div className="om-steps">
          {products.map((p, i) => (
            <div key={p.id} className={`om-step om-step--${i + 1}`}>
              <div className="om-step__top">
                <span className="om-step__label"><span className="om-step__num">{STEPS[i]?.n}</span>{STEPS[i]?.name}</span>
                {p.oldPrice && <span className="om-save">חיסכון {Math.round((1 - p.price / p.oldPrice) * 100)}%</span>}
              </div>
              <Link href={p.href} className="om-step__img" aria-label={p.name}>
                <span className="om-shadow" />
                <span className="om-bottle" style={{ backgroundImage: `url("${p.image}")` }} />
              </Link>
              <div className="om-step__text">
                <span className="om-step__name">{p.name}</span>
                <span className="om-step__sub">{p.sub}</span>
              </div>
              <div className="om-step__foot">
                <span className="om-step__price"><b>{formatPrice(p.price)}</b>{p.oldPrice && <s>{formatPrice(p.oldPrice)}</s>}</span>
                <button className="om-btn" onClick={() => onAdd(p.id)}>הוספה לסל</button>
              </div>
            </div>
          ))}
        </div>

        <button className="om-all" onClick={() => products.forEach(p => onAdd(p.id))}>הוספת החבילה המלאה לסל · {formatPrice(total)}</button>
      </section>

      <section className="om-facts-sec">
        <div className="om-facts">
          {[['0+', 'מגיל לידה', 'נוסחות עדינות שמתאימות לעור של תינוק מהיום הראשון.'],
            ['0%', 'סבונים, פרפום ופתלטים', 'רק מה שהעור של התינוק צריך, בלי תוספות מיותרות.'],
            ['3', 'צעדים בחבילה אחת', 'רחצה, לחות ועיסוי. רגע קבוע של מגע ורוגע.']].map(([big, t, d]) => (
            <div key={t} className="om-fact"><span className="om-fact__big">{big}</span><span className="om-fact__t">{t}</span><span className="om-fact__d">{d}</span></div>
          ))}
        </div>
      </section>
    </main>
  );
}
