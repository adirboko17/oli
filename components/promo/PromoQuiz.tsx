'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { builtinQuizFlow, type QuizAnswer, type QuizFlow } from '@/lib/shop-quiz';
import './PromoQuiz.css';

export type QuizProduct = { id: string; name: string; sub: string; priceLabel: string; image: string; href: string };
export type QuizLead = { name: string; phone: string; email: string; answers: QuizAnswer[]; recommended: string[] };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: QuizLead) => Promise<{ code: string }>;
  getProduct: (id: string) => QuizProduct | undefined;
  onAddToCart: (id: string) => void;
  onShop: () => void;
  image?: string;
  flow?: QuizFlow | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;
const DEFAULT_IMAGE = 'https://static.wixstatic.com/media/db159b_023efbddb9054a1695b0af97979b8d28f000.jpg';

function Options({ opts, value, onPick }: { opts: { id: string; label: string }[]; value?: string; onPick: (id: string) => void }) {
  return (
    <div className="pq-opts">
      {opts.map(option => (
        <button key={option.id} className={`pq-opt${value === option.id ? ' is-on' : ''}`} onClick={() => onPick(option.id)}>
          <span className="pq-opt__dot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <span className="pq-opt__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

function lines(value: string) {
  const parts = value.split('\n');
  return parts.map((line, index) => <Fragment key={index}>{index > 0 ? <br /> : null}{line}</Fragment>);
}

export default function PromoQuiz({ open, onClose, onSubmit, getProduct, onAddToCart, onShop, image, flow }: Props) {
  const quiz = flow ?? builtinQuizFlow();
  const [stack, setStack] = useState<string[]>(['welcome']);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const node = stack[stack.length - 1] ?? 'welcome';
  const question = quiz.questions.find(item => item.id === node);

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pick = (questionId: string, choiceId: string, next: string) => {
    setPicked(prev => ({ ...prev, [questionId]: choiceId }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStack(prev => {
        const at = prev.lastIndexOf(questionId);
        const base = at >= 0 ? prev.slice(0, at + 1) : prev;
        return [...base, next];
      });
    }, 260);
  };

  const phoneOk = PHONE_RE.test(form.phone.replace(/\D/g, ''));
  const ok = !!form.name.trim() && phoneOk && EMAIL_RE.test(form.email);
  const formAt = stack.indexOf('form');
  const answeredId = formAt > 0 ? stack[formAt - 1] : '';
  const answered = quiz.questions.find(item => item.id === answeredId)?.choices.find(choice => choice.id === picked[answeredId]);
  const recIds = (answered?.products ?? []).slice(0, 4);
  const marks = stack.filter(id => id !== 'welcome' && id !== 'done');
  const asked = stack.filter(id => quiz.questions.some(item => item.id === id)).length;
  const photo = image || quiz.image || DEFAULT_IMAGE;
  const first = form.name.trim().split(' ')[0];

  const submit = async () => {
    if (!ok) { setErr(!form.name.trim() ? 'נא למלא שם מלא' : !phoneOk ? 'מספר הטלפון לא תקין' : 'כתובת האימייל לא תקינה'); return; }
    const answers = stack.filter(id => quiz.questions.some(item => item.id === id)).map(id => ({ questionId: id, choiceId: picked[id] || '' }));
    setBusy(true);
    try {
      const result = await onSubmit({ name: form.name, phone: form.phone.replace(/\D/g, ''), email: form.email, answers, recommended: recIds });
      setCode(result.code);
      setStack(prev => [...prev.filter(id => id !== 'done'), 'done']);
    } catch { setErr('משהו השתבש, נסי שוב'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className={`pq-backdrop${open ? ' is-open' : ''}`} onClick={onClose} />
      <div className={`pq-panel${open ? ' is-open' : ''}`} dir="rtl" role="dialog" aria-modal="true" aria-label="5% הנחה">
        <button className="pq-close" onClick={onClose} aria-label="סגירה">✕</button>
        <div className="pq-grid">
          <div className="pq-media">
            <img src={photo} alt="" />
            <div className="pq-media__shade" />
            <div className="pq-media__text">
              <span className="pq-media__pct">{quiz.mediaPercent}</span>
              <span className="pq-media__lbl"><span className="pq-media__eyebrow">{quiz.mediaEyebrow}</span><span>{quiz.mediaLabel}</span></span>
            </div>
          </div>

          <div className="pq-body">
            {node === 'welcome' && (
              <div className="pq-intro">
                <div className="pq-intro__copy">
                  <span className="pq-intro__eyebrow">{quiz.introEyebrow}</span>
                  <h3 className="pq-intro__title">{lines(quiz.introTitle)}</h3>
                  <p className="pq-intro__text">{quiz.introText}</p>
                </div>
                <div className="pq-pills">
                  {quiz.pills.map(label => <span key={label} className="pq-pill">{label}</span>)}
                </div>
                <button className="pq-cta" onClick={() => setStack(['welcome', quiz.entry])}>{quiz.startLabel}</button>
              </div>
            )}
            {node !== 'welcome' && node !== 'done' && (
              <div className="pq-flow">
                <div className="pq-progress">
                  <div className="pq-progress__left">
                    <div className="pq-dots">{marks.map((id, index) => <span key={`${id}-${index}`} className={`pq-dot${index === marks.length - 1 ? ' is-cur' : ' is-done'}`} />)}</div>
                    <span className="pq-progress__lbl">{node === 'form' ? 'כמעט סיימנו' : `שאלה ${asked}`}</span>
                  </div>
                  <button className="pq-back" onClick={() => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev)}>→ חזרה</button>
                </div>

                {question && (
                  <div key={question.id} className="pq-step">
                    <h3 className="pq-q">{question.title}</h3>
                    <Options opts={question.choices} value={picked[question.id]} onPick={(id) => {
                      const choice = question.choices.find(item => item.id === id);
                      if (choice) pick(question.id, choice.id, choice.next);
                    }} />
                  </div>
                )}
                {node === 'form' && (
                  <div key="form" className="pq-step pq-step--form">
                    <div className="pq-form-head">
                      <h3 className="pq-q">{quiz.formTitle}</h3>
                      <p className="pq-text">{quiz.formText}</p>
                    </div>
                    <input className="pq-input" value={form.name} onChange={event => { setForm({ ...form, name: event.target.value }); setErr(''); }} autoComplete="name" placeholder="שם מלא" />
                    <input className="pq-input is-ltr" value={form.phone} onChange={event => { setForm({ ...form, phone: event.target.value }); setErr(''); }} type="tel" inputMode="numeric" autoComplete="tel" placeholder="מספר טלפון" />
                    <input className="pq-input is-ltr" value={form.email} onChange={event => { setForm({ ...form, email: event.target.value }); setErr(''); }} type="email" autoComplete="email" placeholder="אימייל" />
                    {err && <span className="pq-err">{err}</span>}
                    <button className={`pq-cta${ok ? '' : ' is-dim'}`} onClick={submit} disabled={busy}>{busy ? 'רגע…' : quiz.submitLabel}</button>
                    {quiz.legal ? <span className="pq-legal">{quiz.legal}</span> : null}
                  </div>
                )}
              </div>
            )}
            {node === 'done' && (
              <div className="pq-step pq-done">
                <div className="pq-form-head">
                  <span className="pq-eyebrow">{quiz.doneEyebrow.replace('{name}', first)}</span>
                  <h3 className="pq-q">{quiz.doneTitle}</h3>
                  <p className="pq-text pq-text--sm">{quiz.doneText}</p>
                </div>
                <button className="pq-code" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); }}>
                  <span className="pq-code__val">{code}</span><span className="pq-code__copy">{copied ? 'הועתק ✓' : 'העתקה'}</span>
                </button>
                <div className="pq-reco">
                  <span className="pq-reco__title">{quiz.recoTitle}</span>
                  {recIds.map(id => getProduct(id)).filter(Boolean).map(product => (
                    <div key={product!.id} className="pq-reco__item">
                      <a href={product!.href} className="pq-reco__img" style={{ backgroundImage: `url("${product!.image}")` }} aria-label={product!.name} />
                      <span className="pq-reco__text"><span className="pq-reco__name">{product!.name}</span><span className="pq-reco__sub">{product!.sub}</span><span className="pq-reco__price">{product!.priceLabel}</span></span>
                      <button className="pq-reco__add" onClick={() => onAddToCart(product!.id)} aria-label="הוספה לסל">+</button>
                    </div>
                  ))}
                </div>
                <button className="pq-shop" onClick={onShop}>{quiz.shopLabel}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
