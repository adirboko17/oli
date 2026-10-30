'use client';
import Link from 'next/link';
import { useState } from 'react';
import './OliminiToGo.css';

export interface ToGoProduct {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  href: string;
  soldOut?: boolean;
}

/** olimini To Go strip – placed directly below "החבילה של olimini" on the olimini page. */
export default function OliminiToGo({ products, kitPrice, onAdd, onAddKit, formatPrice = (value) => `₪${Math.round(value)}` }: {
  products: ToGoProduct[];
  kitPrice?: number;
  onAdd: (p: ToGoProduct) => void;
  onAddKit?: () => void;
  formatPrice?: (value: number) => string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  if (!products?.length) return null;
  const full = products.reduce((a, p) => a + p.price, 0);
  const ils = formatPrice;

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
              <Link href={p.href} className="otg__img" aria-label={p.name}>
                <span role="img" aria-label={p.name} className={`otg__bottle${hover === p.id ? ' is-hover' : ''}`} style={p.image ? { backgroundImage: `url("${p.image}")` } : undefined} />
              </Link>
              <div className="otg__foot">
                <span className="otg__info">
                  <Link href={p.href} className="otg__name" style={{ color: "inherit", textDecoration: "none" }}>{p.name}</Link>
                  <span className="otg__meta">{p.size ? `${p.size} · ` : ""}{ils(p.price)}</span>
                </span>
                {p.soldOut ? (
                  <span className="otg__add" style={{ width: "auto", padding: "0 10px", fontSize: 12 }}>אזל</span>
                ) : (
                  <button onClick={() => onAdd(p)} aria-label={`הוספת ${p.name} לסל`} className="otg__add">+</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
