'use client';
import { useEffect, useRef, useState } from 'react';
import { Q1, Q1_TITLE, Q2, Q3_TITLE, q3Options, RECOMMEND, Opt } from './quiz';
import './PromoQuiz.css';

export type QuizProduct = { id: string; name: string; sub: string; priceLabel: string; image: string; href: string };
export type QuizLead = { name: string; phone: string; email: string; a1: string; a2: string; a3: string; recommended: string[] };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: QuizLead) => Promise<{ code: string }>; // saves the lead and returns the code (e.g. OLI5)
  getProduct: (id: string) => QuizProduct | undefined;     // from the existing catalog
  onAddToCart: (id: string) => void;
  onShop: () => void;                                       // "לכל המוצרים"
  image?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;

function Options({ opts, value, onPick }: { opts: Opt[]; value?: string; onPick: (k: string) => void }) {
  return (
    <div className="pq-opts">
      {opts.map(o => (
        <button key={o.k} className={`pq-opt${value === o.k ? ' is-on' : ''}`} onClick={() => onPick(o.k)}>
          <span className="pq-opt__dot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <span className="pq-opt__label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

const INTRO_PILLS = ['3 שאלות קצרות', 'פחות מדקה', 'המלצות אישיות'];

// The quiz popup: welcome → 3 questions → details → code + recommended products.
// Desktop: image on the side. Mobile: a centered popup with an image banner on top and the progress dots at the bottom.
export default function PromoQuiz({ open, onClose, onSubmit, getProduct, onAddToCart, onShop,
  image = 'https://static.wixstatic.com/media/db159b_023efbddb9054a1695b0af97979b8d28f000.jpg' }: Props) {
  const [step, setStep] = useState(0); // 0 welcome, 1-3 questions, 4 details, 5 done
  const [a, setA] = useState<{ a1?: string; a2?: string; a3?: string }>({});
  const [f, setF] = useState({ name: '', phone: '', email: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  // Picking an answer advances to the next question after a short beat (so the selection is visible)
  const pick = (key: 'a1' | 'a2' | 'a3', next: number) => (k: string) => {
    setA(prev => ({ ...prev, [key]: k, ...(key === 'a1' && prev.a1 !== k ? { a2: undefined, a3: undefined } : {}) }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStep(next), 260);
  };

  const phoneOk = PHONE_RE.test(f.phone.replace(/\D/g, ''));
  const ok = !!f.name.trim() && phoneOk && EMAIL_RE.test(f.email);
  const recIds = (RECOMMEND[a.a3 || 'self'] || RECOMMEND.self).slice(0, 2);

  const submit = async () => {
    if (!ok) { setErr(!f.name.trim() ? 'נא למלא שם מלא' : !phoneOk ? 'מספר הטלפון לא תקין' : 'כתובת האימייל לא תקינה'); return; }
    setBusy(true);
    try {
      const r = await onSubmit({ ...f, phone: f.phone.replace(/\D/g, ''), a1: a.a1!, a2: a.a2!, a3: a.a3!, recommended: recIds });
      setCode(r.code); setStep(5);
    } catch { setErr('משהו השתבש, נסי שוב'); }
    finally { setBusy(false); }
  };

  const q2 = Q2[a.a1 || 'preg'];
  const first = f.name.trim().split(' ')[0];

  return (
    <>
      <div className={`pq-backdrop${open ? ' is-open' : ''}`} onClick={onClose} />
      <div className={`pq-panel${open ? ' is-open' : ''}`} dir="rtl" role="dialog" aria-modal="true" aria-label="5% הנחה">
        <button className="pq-close" onClick={onClose} aria-label="סגירה">✕</button>
        <div className="pq-grid">
          {/* Image: on the side on desktop, a banner on top on mobile */}
          <div className="pq-media">
            <img src={image} alt="" />
            <div className="pq-media__shade" />
            <div className="pq-media__text">
              <span className="pq-media__pct">5%</span>
              <span className="pq-media__lbl"><span className="pq-media__eyebrow">מתנת הצטרפות</span><span>על ההזמנה הראשונה</span></span>
            </div>
          </div>

          <div className="pq-body">
            {step === 0 && (
              <div className="pq-intro">
                <div className="pq-intro__copy">
                  <span className="pq-intro__eyebrow">מתנת הצטרפות</span>
                  <h3 className="pq-intro__title">ענו על 3 שאלות<br />וקבלו 5% הנחה</h3>
                  <p className="pq-intro__text">לרכישה הקרובה שלכן באתר. ובדרך נתאים לכן את המוצרים שהכי מתאימים לתקופה שלכן.</p>
                </div>
                <div className="pq-pills">
                  {INTRO_PILLS.map(label => <span key={label} className="pq-pill">{label}</span>)}
                </div>
                <button className="pq-cta" onClick={() => setStep(1)}>בואו נתחיל</button>
              </div>
            )}
            {step > 0 && step < 5 && (
              <div className="pq-flow">
                <div className="pq-progress">
                  <div className="pq-progress__left">
                    <div className="pq-dots">{[1, 2, 3, 4].map(n => <span key={n} className={`pq-dot${n === step ? ' is-cur' : n < step ? ' is-done' : ''}`} />)}</div>
                    <span className="pq-progress__lbl">{step < 4 ? `${step} / 3` : 'כמעט סיימנו'}</span>
                  </div>
                  <button className="pq-back" onClick={() => setStep(step - 1)}>→ חזרה</button>
                </div>

                {step === 1 && <div key="s1" className="pq-step"><h3 className="pq-q">{Q1_TITLE}</h3><Options opts={Q1} value={a.a1} onPick={pick('a1', 2)} /></div>}
                {step === 2 && <div key="s2" className="pq-step"><h3 className="pq-q">{q2.title}</h3><Options opts={q2.opts} value={a.a2} onPick={pick('a2', 3)} /></div>}
                {step === 3 && <div key="s3" className="pq-step"><h3 className="pq-q">{Q3_TITLE}</h3><Options opts={q3Options(a.a1, a.a2)} value={a.a3} onPick={pick('a3', 4)} /></div>}
                {step === 4 && (
                  <div key="s4" className="pq-step pq-step--form">
                    <div className="pq-form-head">
                      <h3 className="pq-q">יש לנו משהו במיוחד בשבילך 🤎</h3>
                      <p className="pq-text">השאירי פרטים, קבלי 5% הנחה וגלי את המוצרים שמתאימים לך.</p>
                    </div>
                    <input className="pq-input" value={f.name} onChange={e => { setF({ ...f, name: e.target.value }); setErr(''); }} autoComplete="name" placeholder="שם מלא" />
                    <input className="pq-input is-ltr" value={f.phone} onChange={e => { setF({ ...f, phone: e.target.value }); setErr(''); }} type="tel" inputMode="numeric" autoComplete="tel" placeholder="מספר טלפון" />
                    <input className="pq-input is-ltr" value={f.email} onChange={e => { setF({ ...f, email: e.target.value }); setErr(''); }} type="email" autoComplete="email" placeholder="אימייל" />
                    {err && <span className="pq-err">{err}</span>}
                    <button className={`pq-cta${ok ? '' : ' is-dim'}`} onClick={submit} disabled={busy}>{busy ? 'רגע…' : 'קבלי את ההטבה שלי'}</button>
                    <span className="pq-legal">בהשארת הפרטים את מאשרת לקבל מאיתנו עדכונים והטבות. אפשר להסיר בכל עת.</span>
                  </div>
                )}
              </div>
            )}
            {step === 5 && (
              <div className="pq-step pq-done">
                <div className="pq-form-head">
                  <span className="pq-eyebrow">ברוכה הבאה, {first}</span>
                  <h3 className="pq-q">ההטבה שלך מוכנה</h3>
                  <p className="pq-text pq-text--sm">שלחנו את הקוד גם למייל. מזינים אותו בקופה.</p>
                </div>
                <button className="pq-code" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); }}>
                  <span className="pq-code__val">{code}</span><span className="pq-code__copy">{copied ? 'הועתק ✓' : 'העתקה'}</span>
                </button>
                <div className="pq-reco">
                  <span className="pq-reco__title">המוצרים שמתאימים לך</span>
                  {recIds.map(id => getProduct(id)).filter(Boolean).map(p => (
                    <div key={p!.id} className="pq-reco__item">
                      <a href={p!.href} className="pq-reco__img" style={{ backgroundImage: `url("${p!.image}")` }} aria-label={p!.name} />
                      <span className="pq-reco__text"><span className="pq-reco__name">{p!.name}</span><span className="pq-reco__sub">{p!.sub}</span><span className="pq-reco__price">{p!.priceLabel}</span></span>
                      <button className="pq-reco__add" onClick={() => onAddToCart(p!.id)} aria-label="הוספה לסל">+</button>
                    </div>
                  ))}
                </div>
                <button className="pq-shop" onClick={onShop}>לכל המוצרים</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
