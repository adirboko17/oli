'use client';
import { useState } from 'react';
import './OliminiToGo.css';

export interface ToGoProduct {
  id: string;
  name: string;     // e.g. "Pre & Shower To Go"
  size: string;     // e.g. "50 מ״ל"
  price: number;
  image: string;    // transparent PNG of the bottle
}

/** olimini To Go strip – placed directly below "החבילה של olimini" on the olimini page. */
export default function OliminiToGo({ products, kitPrice, onAdd, onAddKit }: {
  products: ToGoProduct[];
  kitPrice?: number;                         // omit to hide the kit line
  onAdd: (p: ToGoProduct) => void;           // TODO: wire to the site's cart
  onAddKit?: () => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  if (!products?.length) return null;
  const full = products.reduce((a, p) => a + p.price, 0);
  const ils = (v: number) => `₪${v}`;

  return (
    <section className="otg" dir="rtl">
      <div className="otg__inner">
        <div className="otg__head">
          <div className="otg__mark">
            <span className="otg__togo">To Go</span>
            <span className="otg__brand">Olimini</span>
          </div>
          <h2 className="otg__title">אותו טיפוח, בגודל לתיק</h2>
          <p className="otg__text">בקבוקים קטנים לתיק החיתולים, לביקורים ולחופשות.</p>
          {kitPrice != null && onAddKit && (
            <div className="otg__kit">
              <span>ערכה מלאה · <strong>{ils(kitPrice)}</strong> {full > kitPrice && <s>{ils(full)}</s>}</span>
              <button onClick={onAddKit} className="otg__link">הוספת שלושתם לסל</button>
            </div>
          )}
        </div>

        <div className="otg__grid">
          {products.map((p, i) => (
            <div key={p.id} className={`otg__card otg__card--${i % 3}`} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}>
              <div className="otg__img">
                <div role="img" aria-label={p.name} className={`otg__bottle${hover === p.id ? ' is-hover' : ''}`} style={{ backgroundImage: `url("${p.image}")` }} />
              </div>
              <div className="otg__foot">
                <span className="otg__info">
                  <span className="otg__name">{p.name}</span>
                  <span className="otg__meta">{p.size} · {ils(p.price)}</span>
                </span>
                <button onClick={() => onAdd(p)} aria-label={`הוספת ${p.name} לסל`} className="otg__add">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
