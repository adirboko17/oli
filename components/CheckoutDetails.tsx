'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './CheckoutDetails.css';

/* Oli: details & shipping page (step 2 of 3: cart → details & shipping → payment) */

export type CheckoutItem = { id: string; name: string; sub: string; price: number; qty: number; image: string };
export type ShippingMethod = 'home' | 'pickup';

export type GiftDetails = { name: string; phone: string; message: string };

export type CheckoutPayload = {
  name: string; phone: string; email: string;
  method: ShippingMethod; city: string; street: string; apt: string; floor: string; zip: string; notes: string;
  newsletter: boolean; coupon: string | null;
  gift: GiftDetails | null;
  subtotal: number; shipping: number; discount: number; total: number;
};

type Props = {
  items: CheckoutItem[];
  user?: { name?: string; phone?: string; email?: string; city?: string; street?: string } | null; // logged-in user: fills the fields automatically
  onEditCart: () => void;                          // opens the cart drawer
  onLogin: () => void;                             // opens the SMS login
  onPay: (data: CheckoutPayload) => void | Promise<void>; // creates the order and redirects to the payment provider
  validateCoupon: (code: string) => Promise<{ ok: boolean; percent?: number }>; // server-side coupon check
  freeShippingFrom?: number;                       // default 250
  shippingPrices?: Record<ShippingMethod, number>; // default home 29, pickup 19
};

const fmt = (n: number) => '₪ ' + (Math.round(n * 10) / 10).toLocaleString('he-IL');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;

const LockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);

const GiftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="10" width="17" height="10.5" rx="2" />
    <path d="M3.5 14.5h17" />
    <path d="M12 10v10.5" />
    <path d="M12 10c0-3.2-1.2-5.5-3.4-5.5S5.8 7 8.2 9.2 12 10 12 10z" />
    <path d="M12 10c0-3.2 1.2-5.5 3.4-5.5S18.2 7 15.8 9.2 12 10 12 10z" />
  </svg>
);

function Field({ label, optional, className = '', ...input }: { label: string; optional?: boolean; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`ck-field ${className}`}>
      <span>{label}{optional && <span className="ck-field__opt"> (לא חובה)</span>}</span>
      <input className="ck-input" {...input} />
    </label>
  );
}

export default function CheckoutDetails({
  items, user, onEditCart, onLogin, onPay, validateCoupon,
  freeShippingFrom = 250, shippingPrices = { home: 29, pickup: 19 },
}: Props) {
  const [f, setF] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    city: user?.city || '', street: user?.street || '', apt: '', floor: '', zip: '', notes: '',
  });
  const [method, setMethod] = useState<ShippingMethod>('home');
  const [gift, setGift] = useState(false);
  const [to, setTo] = useState({ name: '', phone: '', message: '' });
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setF((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
      email: prev.email || user.email || '',
      city: prev.city || user.city || '',
      street: prev.street || user.street || '',
    }));
  }, [user]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const setGiftField = (k: keyof typeof to) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setTo({ ...to, [k]: e.target.value }); setErr(''); };

  const subtotal = items.reduce((a, x) => a + x.price * x.qty, 0);
  const shipping = subtotal >= freeShippingFrom ? 0 : shippingPrices[method];
  const discount = applied ? Math.round(subtotal * applied.percent) / 100 : 0;
  const total = subtotal + shipping - discount;

  const giftPhone = to.phone.replace(/\D/g, '');
  const giftReady = !gift || (!!to.name.trim() && PHONE_RE.test(giftPhone));
  const valid = useMemo(() =>
    !!f.name.trim() && PHONE_RE.test(f.phone.replace(/\D/g, '')) && EMAIL_RE.test(f.email) &&
    !!f.city.trim() && (method !== 'home' || !!f.street.trim()) && terms && giftReady,
  [f, method, terms, giftReady]);

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) { setApplied(null); setCouponMsg(null); return; }
    const r = await validateCoupon(code);
    if (r.ok && r.percent) { setApplied({ code, percent: r.percent }); setCouponMsg({ text: `✓ הקופון הופעל: ${r.percent}% הנחה`, ok: true }); }
    else { setApplied(null); setCouponMsg({ text: 'הקוד לא תקין', ok: false }); }
  };

  const pay = async () => {
    if (gift && !giftReady) { setErr('נא למלא שם וטלפון של מי שמקבלת את המתנה'); return; }
    if (!valid) { setErr('נא למלא את כל השדות ולאשר את התקנון'); return; }
    setBusy(true);
    try {
      await onPay({
        ...f,
        phone: f.phone.replace(/\D/g, ''),
        method,
        newsletter: news,
        coupon: applied?.code || null,
        gift: gift ? { name: to.name.trim(), phone: giftPhone, message: to.message.trim() } : null,
        subtotal, shipping, discount, total,
      });
    } catch {
      setErr('לא הצלחנו להמשיך לתשלום. נסי שוב.');
    } finally { setBusy(false); }
  };

  const ships: { k: ShippingMethod; title: string; sub: string }[] = [
    { k: 'home', title: 'שליח עד הבית', sub: '2–4 ימי עסקים' },
    { k: 'pickup', title: 'נקודת איסוף', sub: 'איסוף מנקודה קרובה, 2–5 ימי עסקים' },
  ];

  const PayButton = ({ label }: { label: string }) => (
    <button className={`ck-pay${valid ? '' : ' is-disabled'}`} onClick={pay} disabled={busy}>
      <LockIcon /><span>{busy ? 'מעבירים לתשלום…' : label}</span>
    </button>
  );

  return (
    <main className="ck-page" dir="rtl">
      <div className="ck-wrap">
        <div className="ck-head">
          <div className="ck-steps">
            <button className="ck-step ck-step--done" onClick={onEditCart}><span className="ck-step__dot">✓</span>סל</button>
            <span className="ck-step__line" />
            <span className="ck-step ck-step--current"><span className="ck-step__dot">2</span>פרטים ומשלוח</span>
            <span className="ck-step__line" />
            <span className="ck-step"><span className="ck-step__dot">3</span>תשלום</span>
          </div>
          <h1 className="ck-title">כמעט שם</h1>
        </div>

        {!items.length ? (
          <div className="ck-empty">
            <span>הסל ריק כרגע.</span>
            <Link href="/products" className="ck-btn">למוצרים</Link>
          </div>
        ) : (
          <div className="ck-grid">
            <div className="ck-forms">
              {/* 1. Contact details */}
              <section className="ck-card">
                <div className="ck-card__head"><span className="ck-num">1</span><h2>פרטי קשר</h2></div>
                {!user && (
                  <div className="ck-login">
                    <span>כבר יש לך חשבון? אפשר להתחבר ולמלא אוטומטית</span>
                    <button onClick={onLogin}>כניסה עם SMS</button>
                  </div>
                )}
                <div className="ck-row ck-row--auto">
                  <Field label="שם מלא" value={f.name} onChange={set('name')} autoComplete="name" placeholder="השם שלך" />
                  <Field label="טלפון נייד" className="is-ltr" value={f.phone} onChange={set('phone')} type="tel" inputMode="numeric" autoComplete="tel" placeholder="050-000-0000" />
                </div>
                <Field label="אימייל לקבלה" className="is-ltr" value={f.email} onChange={set('email')} type="email" autoComplete="email" placeholder="name@email.com" />
              </section>

              {/* 2. Shipping */}
              <section className="ck-card">
                <div className="ck-card__head"><span className="ck-num">2</span><h2>משלוח</h2></div>
                <div className="ck-ships" role="radiogroup">
                  {ships.map(m => (
                    <button key={m.k} role="radio" aria-checked={method === m.k} className={`ck-ship${method === m.k ? ' is-on' : ''}`} onClick={() => setMethod(m.k)}>
                      <span className="ck-radio"><span /></span>
                      <span className="ck-ship__text"><span className="ck-ship__title">{m.title}</span><span className="ck-ship__sub">{m.sub}</span></span>
                      <span className="ck-ship__price">{subtotal >= freeShippingFrom ? 'חינם' : '₪' + shippingPrices[m.k]}</span>
                    </button>
                  ))}
                </div>

                <label className={`ck-gift${gift ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={gift} onChange={e => {
                    const on = e.target.checked;
                    setGift(on);
                    setErr('');
                    if (on && user && f.city === (user.city || '') && f.street === (user.street || '')) {
                      setF({ ...f, city: '', street: '', apt: '', floor: '', zip: '' });
                    }
                  }} />
                  <span className="ck-gift__tick" aria-hidden><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.2 6.1 4.7 8.6 9.8 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <span className="ck-gift__icon"><GiftIcon /></span>
                  <span className="ck-gift__copy">
                    <span className="ck-gift__title">האם זו מתנה?</span>
                    <span className="ck-gift__sub">נשלח אל מישהי אחרת, עם ברכה אישית</span>
                  </span>
                </label>

                {gift && (
                  <div className="ck-gift-panel" id="ck-gift-panel">
                    <div className="ck-gift-panel__head">
                      <span className="ck-gift-panel__kicker">למי השמחה</span>
                      <span className="ck-gift-panel__hint">הקבלה נשארת אצלך. המשלוח יוצא אל המקבלת.</span>
                    </div>
                    <div className="ck-row ck-row--auto">
                      <Field label="שם המקבלת" value={to.name} onChange={setGiftField('name')} autoComplete="off" placeholder="שם מלא" />
                      <Field label="טלפון של המקבלת" className="is-ltr" value={to.phone} onChange={setGiftField('phone')} type="tel" inputMode="numeric" autoComplete="off" placeholder="050-000-0000" />
                    </div>
                    <label className="ck-field">
                      <span>ברכה למשלוח<span className="ck-field__opt"> (לא חובה)</span></span>
                      <textarea className="ck-input ck-textarea" rows={2} value={to.message} onChange={setGiftField('message')} placeholder="מזל טוב, שיהיה רך ומתוק…" />
                    </label>
                  </div>
                )}

                {gift && <span className="ck-gift-where">{method === 'home' ? 'כתובת למשלוח המתנה' : 'איסוף עבור המקבלת'}</span>}

                {method === 'home' ? (
                  <div className="ck-stack">
                    <div className="ck-row ck-row--city">
                      <Field label="עיר" value={f.city} onChange={set('city')} autoComplete={gift ? 'off' : 'address-level2'} placeholder="עיר" />
                      <Field label="רחוב ומספר" value={f.street} onChange={set('street')} autoComplete={gift ? 'off' : 'street-address'} placeholder="רחוב ומספר" />
                    </div>
                    <div className="ck-row ck-row--3">
                      <Field label="דירה" value={f.apt} onChange={set('apt')} placeholder="—" />
                      <Field label="קומה" value={f.floor} onChange={set('floor')} placeholder="—" />
                      <Field label="מיקוד" className="is-ltr" value={f.zip} onChange={set('zip')} inputMode="numeric" placeholder="—" />
                    </div>
                    <label className="ck-field">
                      <span>הערות לשליח<span className="ck-field__opt"> (לא חובה)</span></span>
                      <textarea className="ck-input ck-textarea" rows={2} value={f.notes} onChange={set('notes')} placeholder="קוד לבניין, להשאיר ליד הדלת…" />
                    </label>
                  </div>
                ) : (
                  <div className="ck-stack">
                    <Field label="עיר לאיסוף" value={f.city} onChange={set('city')} placeholder="נציג את נקודות האיסוף הקרובות" />
                    {/* TODO: list of pickup points from the shipping company's API, by city */}
                    <span className="ck-note">[ כאן תוצג רשימת נקודות האיסוף מחברת השילוח ]</span>
                  </div>
                )}
              </section>

              {/* 3. Confirmation */}
              <section className="ck-card">
                <div className="ck-card__head"><span className="ck-num">3</span><h2>אישור</h2></div>
                <label className="ck-check">
                  <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErr(''); }} />
                  <span>קראתי ואני מאשרת את <Link href="/legal?tab=terms">תקנון האתר</Link> ו<Link href="/legal?tab=privacy">מדיניות הפרטיות</Link></span>
                </label>
                <label className="ck-check">
                  <input type="checkbox" checked={news} onChange={e => setNews(e.target.checked)} />
                  <span>אשמח לקבל טיפים, עדכונים והטבות במייל וב־SMS</span>
                </label>
              </section>
            </div>

            {/* Order summary: sticky on desktop, at the top of the page on mobile */}
            <aside className="ck-summary">
              <div className="ck-summary__head">
                <span className="ck-summary__title">סיכום הזמנה</span>
                <button className="ck-link" onClick={onEditCart}>עריכת הסל</button>
              </div>
              <div className="ck-items">
                {items.map(it => (
                  <div key={it.id} className="ck-item">
                    <div className="ck-item__thumb" style={{ backgroundImage: `url("${it.image}")` }}><span className="ck-item__qty">{it.qty}</span></div>
                    <div className="ck-item__text"><span className="ck-item__name">{it.name}</span><span className="ck-item__sub">{it.sub}</span></div>
                    <span className="ck-item__price">{fmt(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="ck-coupon">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyCoupon()} placeholder="קוד קופון" />
                <button onClick={applyCoupon}>החלה</button>
              </div>
              {couponMsg && <span className={`ck-coupon__msg${couponMsg.ok ? ' is-ok' : ''}`}>{couponMsg.text}</span>}
              <div className="ck-totals">
                <div><span>סכום ביניים</span><span>{fmt(subtotal)}</span></div>
                <div><span>משלוח</span><span>{shipping ? fmt(shipping) : 'חינם'}</span></div>
                {discount > 0 && <div className="ck-totals__disc"><span>הנחה ({applied?.code})</span><span>−{fmt(discount)}</span></div>}
                <div className="ck-totals__total"><span>סה״כ לתשלום</span><span>{fmt(total)}</span></div>
                <span className="ck-totals__vat">כולל מע״מ</span>
              </div>
              <div className="ck-desk-pay">
                <PayButton label="המשך לתשלום מאובטח" />
                {err && <span className="ck-err">{err}</span>}
                <div className="ck-secure"><LockIcon size={13} />התשלום מאובטח בתקן PCI · Visa · Mastercard · Bit · Apple Pay</div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile: sticky pay bar at the bottom of the screen */}
      {!!items.length && (
        <div className="ck-mobile-bar">
          {err && <span className="ck-err">{err}</span>}
          <PayButton label={`לתשלום מאובטח · ${fmt(total)}`} />
        </div>
      )}
    </main>
  );
}
