'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { formatMoney, formatShippingPrice, FREE_SHIPPING_FROM, isPickupZone, shippingAfterFreeThreshold, type ShippingChoice } from '@/lib/shipping';
import './CheckoutDetails.css';

/* Oli: details & shipping page (step 2 of 3: cart → details & shipping → payment) */

export type CheckoutItem = { id: string; name: string; sub: string; price: number; qty: number; image: string };

export type GiftDetails = { name: string; phone: string; email: string; message: string };

export type CheckoutPayload = {
  name: string; phone: string; email: string;
  shippingName: string; zone: string;
  city: string; street: string; apt: string; floor: string; zip: string; notes: string;
  pregnancyWeek: string; babyAge: string; heard: string; heardOther: string;
  newsletter: boolean; coupon: string | null; giftCard: string | null;
  gift: GiftDetails | null;
};

type Props = {
  items: CheckoutItem[];
  shippingMethods: ShippingChoice[];
  currency: string;
  user?: { name?: string; phone?: string; email?: string; city?: string; street?: string; zip?: string } | null; // logged-in user: fills the fields automatically
  onEditCart: () => void;                          // opens the cart drawer
  onLogin: () => void;                             // opens the SMS login
  onAddGift?: (item: CheckoutItem) => void;        // product-for-product code: the gift joins the cart before the total is shown
  onPay: (data: CheckoutPayload) => void | Promise<void>; // creates the order and redirects to the payment provider
};

const fmt = (n: number) => '₪ ' + (Math.round(n * 10) / 10).toLocaleString('he-IL');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const HEARD_OPTIONS = ['שמעתי מחברה', 'רשתות חברתיות', 'גוגל', 'דרך הפודקאסט', 'דולה/אשת מקצוע', 'אחר'] as const;

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

type StoreQuote = { total: number; currency: string; shipping: number | null; discount: number; discountCode: string };
type QuoteBody = {
  ok?: boolean; total?: number; currency?: string; shipping?: number | null; discount?: number; discountCode?: string;
  reason?: string; message?: string; bundleBlocked?: boolean; addedGift?: unknown;
};

function readAddedGift(value: unknown): CheckoutItem | null {
  if (!value || typeof value !== 'object') return null;
  const gift = value as Record<string, unknown>;
  const id = typeof gift.id === 'string' ? gift.id : '';
  const name = typeof gift.name === 'string' ? gift.name.trim() : '';
  const qty = gift.qty;
  const price = gift.price;
  if (!id || !name || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || typeof price !== 'number' || !Number.isFinite(price) || price < 0) return null;
  return { id, name, sub: typeof gift.sub === 'string' ? gift.sub : 'מתנה', price, image: typeof gift.image === 'string' ? gift.image : '', qty };
}

const BUNDLE_CODE = 'הקוד לא חל כי המוצר הנדרש נקנה במארז';

export default function CheckoutDetails({
  items, shippingMethods, currency, user, onEditCart, onLogin, onAddGift, onPay,
}: Props) {
  const [f, setF] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    city: user?.city || '', street: user?.street || '', apt: '', floor: '', zip: user?.zip || '', notes: '',
  });
  const [shippingName, setShippingName] = useState('');
  const [quote, setQuote] = useState<StoreQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState('');
  const [gift, setGift] = useState(false);
  const [to, setTo] = useState({ name: '', phone: '', email: '', message: '' });
  const [about, setAbout] = useState({ pregnancyWeek: '', babyAge: '', heard: '', heardOther: '' });
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [acceptedCode, setAcceptedCode] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponPhase, setCouponPhase] = useState('');
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
      zip: prev.zip || user.zip || '',
    }));
  }, [user]);

  const onAddGiftRef = useRef(onAddGift);
  onAddGiftRef.current = onAddGift;
  const satisfied = useRef(new Set<string>());
  const qtyOf = useRef(new Map<string, number>());

  useEffect(() => {
    const prev = qtyOf.current;
    const next = new Map(items.map((item) => [item.id, item.qty]));
    for (const [id, qty] of prev) {
      if ((next.get(id) ?? 0) < qty) satisfied.current.clear();
    }
    qtyOf.current = next;
  }, [items]);

  const offerGift = useCallback((giftLine: CheckoutItem, sent: CheckoutItem[]) => {
    const add = onAddGiftRef.current;
    if (!add) return;
    const key = `${sent.map((item) => `${item.id}x${item.qty}`).join('|')}>${giftLine.id}x${giftLine.qty}`;
    if (satisfied.current.has(key)) return;
    satisfied.current.add(key);
    add(giftLine);
  }, []);

  const readQuote = useCallback((body: QuoteBody | null): StoreQuote => ({
    total: body?.total ?? 0,
    currency: body?.currency || currency,
    shipping: typeof body?.shipping === 'number' && Number.isFinite(body.shipping) ? body.shipping : null,
    discount: typeof body?.discount === 'number' && Number.isFinite(body.discount) ? body.discount : 0,
    discountCode: typeof body?.discountCode === 'string' ? body.discountCode : '',
  }), [currency]);

  const acceptQuote = useCallback((body: QuoteBody, sent: CheckoutItem[], code: string) => {
    if (body.bundleBlocked) {
      if (code.trim()) setCouponMsg({ text: BUNDLE_CODE, ok: false });
      setAcceptedCode('');
      setQuote({ ...readQuote(body), discount: 0, discountCode: '' });
      setQuoteMsg('');
      return false;
    }
    const giftLine = readAddedGift(body.addedGift);
    if (giftLine) offerGift(giftLine, sent);
    setQuote(readQuote(body));
    setQuoteMsg('');
    return true;
  }, [offerGift, readQuote]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const setGiftField = (k: keyof typeof to) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setTo({ ...to, [k]: e.target.value }); setErr(''); };
  const setAboutField = (k: 'pregnancyWeek' | 'babyAge' | 'heardOther') => (e: React.ChangeEvent<HTMLInputElement>) => { setAbout({ ...about, [k]: e.target.value }); setErr(''); };

  const subtotal = items.reduce((a, x) => a + x.price * x.qty, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_FROM;
  const digital = items.length > 0 && items.every((item) => item.id.startsWith("oli-gift:") || item.id.includes(":gift:"));
  const selected = shippingMethods.find((method) => method.name === shippingName) ?? null;
  const amountDue = quote ? shippingAfterFreeThreshold(subtotal, quote.shipping ?? selected?.price ?? 0, quote.total).total : null;
  const pickup = selected ? isPickupZone(selected.zone) : false;
  const payCurrency = quote?.currency || currency;

  const giftPhone = to.phone.replace(/\D/g, '');
  const giftReady = !gift || (!!to.name.trim() && EMAIL_RE.test(to.email.trim()) && PHONE_RE.test(giftPhone) && !!to.message.trim());
  const addressReady = digital || (!!f.city.trim() && (pickup || !!f.street.trim()));
  const week = about.pregnancyWeek.trim();
  const weekOk = !week || (/^\d{1,2}$/.test(week) && Number(week) >= 1 && Number(week) <= 42);
  const valid = useMemo(() =>
    !!f.name.trim() && PHONE_RE.test(f.phone.replace(/\D/g, '')) && EMAIL_RE.test(f.email) &&
    addressReady && terms && giftReady && weekOk && !!about.heard && shippingMethods.length > 0 && !!selected && quote != null && !quoting,
  [f, terms, addressReady, giftReady, weekOk, about.heard, shippingMethods.length, selected, quote, quoting]);

  useEffect(() => {
    if (!selected) {
      setQuote(null);
      setQuoting(false);
      setQuoteMsg('');
      return;
    }
    const controller = new AbortController();
    const sent = items;
    setQuoting(true);
    setQuote(null);
    setQuoteMsg('');
    const timer = window.setTimeout(() => {
      fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          shippingName: selected.name,
          items: sent.map((item) => ({ id: item.id, qty: item.qty })),
          code: acceptedCode,
          customerEmail: f.email.trim(),
          giftCode,
        }),
      }).then(async (res) => {
        const body = await res.json().catch(() => null) as QuoteBody | null;
        if (controller.signal.aborted) return;
        if (!res.ok || !body?.ok || typeof body.total !== 'number' || !Number.isFinite(body.total)) {
          setQuote(null);
          setQuoteMsg(body?.reason || body?.message || 'לא הצלחנו לחשב את הסכום לתשלום');
          return;
        }
        acceptQuote(body, sent, acceptedCode);
      }).catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return;
        setQuote(null);
        setQuoteMsg('לא הצלחנו לחשב את הסכום לתשלום');
      }).finally(() => {
        if (!controller.signal.aborted) setQuoting(false);
      });
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [selected, items, acceptedCode, giftCode, f.email, currency, acceptQuote]);

  const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (couponBusy) return;
    if (!selected) { setCouponMsg({ text: 'בחרי אפשרות משלוח', ok: false }); return; }
    if (!code) { setAcceptedCode(''); setGiftCode(''); setCouponMsg(null); return; }
    setCouponBusy(true);
    setCouponMsg(null);
    setCouponPhase('בודקים את הקוד');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingName: selected.name,
          items: items.map((item) => ({ id: item.id, qty: item.qty })),
          code,
          customerEmail: f.email.trim(),
          giftCode,
        }),
      });
      const body = await res.json().catch(() => null) as QuoteBody | null;
      const failed = !res.ok || !body?.ok || typeof body.total !== 'number' || !Number.isFinite(body.total);
      if (failed) {
        const reason = body?.reason || body?.message || 'לא הצלחנו לחשב את הסכום לתשלום';
        setCouponPhase('בודקים אם זה כרטיס מתנה');
        const giftRes = await fetch('/api/gift', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const giftBody = await giftRes.json().catch(() => null) as { ok?: boolean; balance?: number } | null;
        if (giftRes.ok && giftBody?.ok && giftBody.balance) {
          setCouponPhase('מכניסים את היתרה');
          const giftQuote = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shippingName: selected.name,
              items: items.map((item) => ({ id: item.id, qty: item.qty })),
              code: acceptedCode,
              customerEmail: f.email.trim(),
              giftCode: code,
            }),
          });
          const giftQuoted = await giftQuote.json().catch(() => null) as QuoteBody | null;
          if (!giftQuote.ok || !giftQuoted?.ok || typeof giftQuoted.total !== 'number') {
            setCouponMsg({ text: giftQuoted?.reason || giftQuoted?.message || reason, ok: false });
            return;
          }
          if (giftQuoted.bundleBlocked) setAcceptedCode('');
          const giftLine = readAddedGift(giftQuoted.addedGift);
          if (giftLine) offerGift(giftLine, items);
          setGiftCode(code);
          setCoupon('');
          setQuote(readQuote(giftQuoted));
          setCouponPhase('הקוד אושר');
          await pause(560);
          setCouponMsg({ text: '✓ כרטיס מתנה הופעל', ok: true });
          return;
        }
        setCouponMsg({ text: reason, ok: false });
        return;
      }
      if (!body || typeof body.total !== 'number') return;
      if (!acceptQuote(body, items, code)) return;
      setCouponPhase('מעדכנים את הסכום');
      setAcceptedCode(code);
      setCouponPhase('הקוד אושר');
      await pause(560);
      const shown = (typeof body.discountCode === 'string' && body.discountCode) || code;
      setCouponMsg(shown ? { text: `✓ הקוד ${shown} הופעל`, ok: true } : (typeof body.discount === 'number' && body.discount > 0) ? { text: '✓ ההנחה הופעלה', ok: true } : null);
    } catch {
      setCouponMsg({ text: 'לא הצלחנו לבדוק את הקוד. נסי שוב.', ok: false });
    } finally {
      setCouponBusy(false);
      setCouponPhase('');
    }
  };

  const pay = async () => {
    if (!shippingMethods.length) { setErr('אין אפשרות משלוח, ואי אפשר להמשיך לתשלום'); return; }
    if (!selected) { setErr('בחרי אפשרות משלוח'); return; }
    if (quoting || !quote) { setErr(quoteMsg || 'הסכום לתשלום עדיין לא מוכן'); return; }
    if (gift && !giftReady) { setErr('נא למלא שם, מייל, טלפון וברכה של מי שמקבלת את המתנה'); return; }
    if (!weekOk) { setErr('שבוע הריון צריך להיות בין 1 ל־42'); return; }
    if (!about.heard) { setErr('נשמח לדעת איך שמעת עלינו'); return; }
    if (!valid) { setErr('נא למלא את כל השדות ולאשר את התקנון'); return; }
    setBusy(true);
    try {
      await onPay({
        ...f,
        phone: f.phone.replace(/\D/g, ''),
        shippingName: selected?.name || '',
        zone: selected?.zone || '',
        pregnancyWeek: week,
        babyAge: about.babyAge.trim(),
        heard: about.heard,
        heardOther: about.heard === 'אחר' ? about.heardOther.trim() : '',
        newsletter: news,
        coupon: acceptedCode || null,
        giftCard: giftCode || null,
        gift: gift ? { name: to.name.trim(), phone: giftPhone, email: to.email.trim(), message: to.message.trim() } : null,
      });
    } catch (error) {
      setErr(error instanceof Error && error.message && error.message !== "order" && error.message !== "track" ? error.message : 'לא הצלחנו להמשיך לתשלום. נסי שוב.');
    } finally { setBusy(false); }
  };

  const PayButton = ({ label }: { label: string }) => (
    <button className={`ck-pay${valid ? '' : ' is-disabled'}`} onClick={pay} disabled={busy || shippingMethods.length === 0}>
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
                {shippingMethods.length === 0 ? (
                  <p className="ck-ship-empty">אין אפשרות משלוח, ואי אפשר להמשיך לתשלום.</p>
                ) : (
                  <div className="ck-ships" role="radiogroup">
                    {shippingMethods.map((method) => (
                      <button key={method.name} role="radio" aria-checked={shippingName === method.name} className={`ck-ship${shippingName === method.name ? ' is-on' : ''}`} onClick={() => { setShippingName(method.name); setErr(''); }}>
                        <span className="ck-radio"><span /></span>
                        <span className="ck-ship__text"><span className="ck-ship__title">{method.name}</span></span>
                        <span className="ck-ship__price">{formatShippingPrice(freeShipping ? 0 : method.price, currency)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {digital && <span className="ck-digital__sub">כרטיס המתנה נשלח למייל ולטלפון.</span>}

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
                    <span className="ck-gift__sub">נשלח אל מישהי אחרת, למייל ולטלפון, עם ברכה</span>
                  </span>
                </label>

                {gift && (
                  <div className="ck-gift-panel" id="ck-gift-panel">
                    <div className="ck-gift-panel__head">
                      <span className="ck-gift-panel__kicker">למי השמחה</span>
                      <span className="ck-gift-panel__hint">{digital ? 'הקבלה נשארת אצלך. הכרטיס והברכה נשלחים למייל ולטלפון של המקבלת.' : 'הקבלה נשארת אצלך. הברכה נשלחת למייל ולטלפון, והחבילה יוצאת לכתובת של המקבלת.'}</span>
                    </div>
                    <div className="ck-row ck-row--auto">
                      <Field label="שם המקבלת" value={to.name} onChange={setGiftField('name')} autoComplete="off" placeholder="שם מלא" />
                      <Field label="טלפון של המקבלת" className="is-ltr" value={to.phone} onChange={setGiftField('phone')} type="tel" inputMode="numeric" autoComplete="off" placeholder="050-000-0000" />
                    </div>
                    <Field label="מייל של המקבלת" className="is-ltr" value={to.email} onChange={setGiftField('email')} type="email" autoComplete="off" placeholder="name@email.com" />
                    {!digital && !pickup ? (
                      <div className="ck-stack">
                        <div className="ck-row ck-row--city">
                          <Field label="עיר" value={f.city} onChange={set('city')} autoComplete="off" placeholder="עיר" />
                          <Field label="רחוב ומספר" value={f.street} onChange={set('street')} autoComplete="off" placeholder="רחוב ומספר" />
                        </div>
                        <div className="ck-row ck-row--3">
                          <Field label="דירה" value={f.apt} onChange={set('apt')} autoComplete="off" placeholder="—" />
                          <Field label="קומה" value={f.floor} onChange={set('floor')} autoComplete="off" placeholder="—" />
                          <Field label="מיקוד" optional className="is-ltr" value={f.zip} onChange={set('zip')} inputMode="numeric" autoComplete="off" placeholder="—" />
                        </div>
                        <label className="ck-field">
                          <span>הערות לשליח<span className="ck-field__opt"> (לא חובה)</span></span>
                          <textarea className="ck-input ck-textarea" rows={2} value={f.notes} onChange={set('notes')} placeholder="קוד לבניין, כניסה, להשאיר ליד הדלת…" />
                        </label>
                      </div>
                    ) : !digital ? (
                      <div className="ck-stack">
                        <Field label="עיר לאיסוף" value={f.city} onChange={set('city')} autoComplete="off" placeholder="נציג את נקודות האיסוף הקרובות" />
                        <span className="ck-note">[ כאן תוצג רשימת נקודות האיסוף מחברת השילוח ]</span>
                      </div>
                    ) : null}
                    <label className="ck-field">
                      <span>ברכה</span>
                      <textarea className="ck-input ck-textarea" rows={2} value={to.message} onChange={setGiftField('message')} placeholder="מזל טוב, שיהיה רך ומתוק…" />
                    </label>
                  </div>
                )}

                {!gift && !digital && (!pickup ? (
                  <div className="ck-stack">
                    <div className="ck-row ck-row--city">
                      <Field label="עיר" value={f.city} onChange={set('city')} autoComplete="address-level2" placeholder="עיר" />
                      <Field label="רחוב ומספר" value={f.street} onChange={set('street')} autoComplete="street-address" placeholder="רחוב ומספר" />
                    </div>
                    <div className="ck-row ck-row--3">
                      <Field label="דירה" value={f.apt} onChange={set('apt')} placeholder="—" />
                      <Field label="קומה" value={f.floor} onChange={set('floor')} placeholder="—" />
                      <Field label="מיקוד" optional className="is-ltr" value={f.zip} onChange={set('zip')} inputMode="numeric" placeholder="—" />
                    </div>
                    <label className="ck-field">
                      <span>הערות לשליח<span className="ck-field__opt"> (לא חובה)</span></span>
                      <textarea className="ck-input ck-textarea" rows={2} value={f.notes} onChange={set('notes')} placeholder="קוד לבניין, כניסה, להשאיר ליד הדלת…" />
                    </label>
                  </div>
                ) : (
                  <div className="ck-stack">
                    <Field label="עיר לאיסוף" value={f.city} onChange={set('city')} placeholder="נציג את נקודות האיסוף הקרובות" />
                    <span className="ck-note">[ כאן תוצג רשימת נקודות האיסוף מחברת השילוח ]</span>
                  </div>
                ))}
              </section>

              <section className="ck-card">
                <div className="ck-card__head"><span className="ck-num">3</span><h2>עלייך</h2></div>
                <div className="ck-row ck-row--auto">
                  <Field label="שבוע הריון" optional className="is-ltr" value={about.pregnancyWeek} onChange={setAboutField('pregnancyWeek')} type="number" inputMode="numeric" min={1} max={42} placeholder="למשל 24" />
                  <Field label="גיל הבייבי" optional value={about.babyAge} onChange={setAboutField('babyAge')} placeholder="למשל 3 חודשים" />
                </div>
                <div className="ck-hear">
                  <span className="ck-hear__q">נשמח לשמוע איך שמעת עלינו</span>
                  <div className="ck-ships" role="radiogroup" aria-label="איך שמעת עלינו">
                    {HEARD_OPTIONS.map((option) => (
                      <button key={option} type="button" role="radio" aria-checked={about.heard === option} className={`ck-ship${about.heard === option ? ' is-on' : ''}`} onClick={() => { setAbout({ ...about, heard: option }); setErr(''); }}>
                        <span className="ck-radio"><span /></span>
                        <span className="ck-ship__text"><span className="ck-ship__title">{option}</span></span>
                      </button>
                    ))}
                  </div>
                  {about.heard === 'אחר' && (
                    <Field label="ספרי לנו" optional value={about.heardOther} onChange={setAboutField('heardOther')} placeholder="איך הגעת אלינו" />
                  )}
                </div>
              </section>

              {/* 4. Confirmation */}
              <section className="ck-card">
                <div className="ck-card__head"><span className="ck-num">4</span><h2>אישור</h2></div>
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
                    <div className="ck-item__text">
                      <span className="ck-item__name">{it.name}</span>
                      {it.sub ? <span className="ck-item__sub">{it.sub}</span> : null}
                      <span className="ck-item__meta">{fmt(it.price)} × {it.qty}</span>
                    </div>
                    <span className="ck-item__price">{fmt(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className={`ck-coupon${couponBusy ? ' is-checking' : ''}${couponPhase === 'הקוד אושר' ? ' is-approved' : ''}`}>
                <input value={coupon} disabled={couponBusy} onChange={e => { setCoupon(e.target.value); setAcceptedCode(''); setGiftCode(''); setCouponMsg(null); }} onKeyDown={e => e.key === 'Enter' && applyCoupon()} placeholder="קוד הנחה או כרטיס מתנה" />
                <button onClick={applyCoupon} disabled={couponBusy} aria-busy={couponBusy}>
                  {couponBusy ? <span className="ck-coupon__spin" aria-hidden /> : 'החלה'}
                </button>
              </div>
              {couponPhase && (
                <p className={`ck-coupon__live${couponPhase === 'הקוד אושר' ? ' is-ok' : ''}`} aria-live="polite">
                  <span className="ck-coupon__mark" aria-hidden>{couponPhase === 'הקוד אושר' ? '✓' : ''}</span>
                  <span key={couponPhase}>{couponPhase}</span>
                </p>
              )}
              {!couponPhase && couponMsg && <span className={`ck-coupon__msg${couponMsg.ok ? ' is-ok' : ''}`}>{couponMsg.text}</span>}
              <div className="ck-totals">
                <div><span>סכום ביניים</span><span>{fmt(subtotal)}</span></div>
                <div><span>משלוח{selected ? ` · ${selected.name}` : ''}</span><span>{freeShipping ? formatShippingPrice(0, payCurrency) : quote?.shipping != null ? formatShippingPrice(quote.shipping, payCurrency) : selected ? formatShippingPrice(selected.price, currency) : 'לבחירה'}</span></div>
                {quote && quote.discount > 0 && <div className="ck-totals__disc"><span>הנחה{quote.discountCode ? ` (${quote.discountCode})` : ''}</span><span>−{formatMoney(quote.discount, payCurrency)}</span></div>}
                <div className="ck-totals__total"><span>סה״כ לתשלום</span><span>{amountDue != null ? formatMoney(amountDue, payCurrency) : fmt(subtotal)}</span></div>
                <span className="ck-totals__vat">{quoting ? 'מחשבים את הסכום…' : 'כולל מע״מ'}</span>
                {quoteMsg && <span className="ck-err">{quoteMsg}</span>}
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
          <PayButton label={amountDue != null ? `לתשלום מאובטח · ${formatMoney(amountDue, payCurrency)}` : 'לתשלום מאובטח'} />
        </div>
      )}
    </main>
  );
}
