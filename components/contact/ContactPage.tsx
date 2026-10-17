'use client';
import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import './ContactPage.css';

export type ContactPayload = { topic: string; name: string; phone: string; email: string; order: string; message: string; company?: string };

const TOPICS: [string, string][] = [['product', 'שאלה על מוצר'], ['order', 'הזמנה קיימת'], ['collab', 'שיתוף פעולה'], ['other', 'אחר']];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WA_HREF = 'https://wa.me/972559739670';
const EMAIL = 'info@olisafecare.com';

const WaIcon = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.29A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" /></svg>
);

function Social({ className }: { className: string }) {
  return (
    <div className={className}>
      <span className="ct-label">עקבי אחרינו</span>
      <div className="ct-social__icons">
        <a href="https://instagram.com/oli_safecare" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
        </a>
        <a href="https://open.spotify.com/show/0OQnglgNAHROK4QMU7sZxB" target="_blank" rel="noopener" aria-label="Spotify">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3-1 6.5-.8 9.2.7M8 12.6c2.5-.7 5.3-.5 7.5.7M8.6 15.4c2-.5 4-.3 5.7.6" /></svg>
        </a>
        <a href={WA_HREF} target="_blank" rel="noopener" aria-label="WhatsApp"><WaIcon /></a>
      </div>
    </div>
  );
}

// "צרי קשר" page: contact details (WhatsApp, email, social) + form.
// Desktop: two columns. Mobile: details → form → "עקבי אחרינו" below the form.
export default function ContactPage({ onSubmit }: { onSubmit: (data: ContactPayload) => Promise<void> }) {
  const [topic, setTopic] = useState('product');
  const [f, setF] = useState({ name: '', phone: '', email: '', order: '', message: '' });
  const [company, setCompany] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const ok = !!f.name.trim() && EMAIL_RE.test(f.email) && f.message.trim().length > 2;

  const send = async () => {
    if (!ok) { setErr('נא למלא שם, אימייל תקין והודעה'); return; }
    setBusy(true);
    try { await onSubmit({ topic, ...f, company }); setDone(true); }
    catch { setErr('משהו השתבש. נסי שוב או כתבי לנו בוואטסאפ'); }
    finally { setBusy(false); }
  };

  return (
    <main className="ct-page" dir="rtl">
      <section className="ct-wrap">
        <nav className="ct-crumbs"><Link href="/">דף הבית</Link><span>/</span><span className="ct-crumbs__cur">צרי קשר</span></nav>

        <div className="ct-grid">
          <div className="ct-info">
            <div className="ct-head">
              <span className="ct-eyebrow">אנחנו כאן בשבילך</span>
              <h1 className="ct-title">צרי קשר</h1>
              <p className="ct-lead">שאלה על מוצר, הזמנה קיימת או שיתוף פעולה? כתבי לנו ונחזור אלייך בהקדם.</p>
            </div>
            <div className="ct-rows">
              <a href={WA_HREF} target="_blank" rel="noopener" className="ct-row">
                <span className="ct-row__text"><span className="ct-label">וואטסאפ</span><span className="ct-row__val">+972 55-973-9670</span></span>
                <span className="ct-row__arrow">←</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="ct-row">
                <span className="ct-row__text"><span className="ct-label">מייל</span><span className="ct-row__val">{EMAIL}</span></span>
                <span className="ct-row__arrow">←</span>
              </a>
              <Social className="ct-social ct-social--desk" />
            </div>
          </div>

          <div className="ct-panel">
            {!done ? (
              <>
                <span className="ct-panel__title">כתבי לנו</span>
                <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden value={company} onChange={(e) => setCompany(e.target.value)} />
                <div className="ct-topics-wrap">
                  <span className="ct-flabel">במה נוכל לעזור?</span>
                  <div className="ct-topics" role="radiogroup">
                    {TOPICS.map(([k, l]) => (
                      <button key={k} role="radio" aria-checked={topic === k} className={`ct-topic${topic === k ? ' is-on' : ''}`} onClick={() => setTopic(k)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="ct-two">
                  <label className="ct-field"><span className="ct-flabel">שם מלא</span><input className="ct-input" value={f.name} onChange={set('name')} autoComplete="name" placeholder="השם שלך" /></label>
                  <label className="ct-field"><span className="ct-flabel">טלפון</span><input className="ct-input is-ltr" value={f.phone} onChange={set('phone')} type="tel" inputMode="numeric" autoComplete="tel" placeholder="050-000-0000" /></label>
                </div>
                <label className="ct-field"><span className="ct-flabel">אימייל</span><input className="ct-input is-ltr" value={f.email} onChange={set('email')} type="email" autoComplete="email" placeholder="name@email.com" /></label>
                {topic === 'order' && (
                  <label className="ct-field"><span className="ct-flabel">מספר הזמנה <span className="ct-opt">(אם יש)</span></span><input className="ct-input is-ltr" value={f.order} onChange={set('order')} placeholder="#10482" /></label>
                )}
                <label className="ct-field"><span className="ct-flabel">הודעה</span><textarea className="ct-input ct-textarea" rows={3} value={f.message} onChange={set('message')} placeholder="כתבי לנו כאן…" /></label>
                {err && <span className="ct-err">{err}</span>}
                <button className={`ct-send${ok ? '' : ' is-dim'}`} onClick={send} disabled={busy}>{busy ? 'שולחות…' : 'שליחה'}</button>
              </>
            ) : (
              <div className="ct-done">
                <span className="ct-done__check">✓</span>
                <span className="ct-done__title">תודה, {f.name.trim().split(' ')[0]}!</span>
                <span className="ct-done__text">ההודעה התקבלה. נחזור אלייך בהקדם.</span>
                <button className="ct-done__again" onClick={() => { setDone(false); setF({ name: '', phone: '', email: '', order: '', message: '' }); }}>הודעה נוספת</button>
              </div>
            )}
          </div>

          <Social className="ct-social ct-social--mob" />
        </div>
      </section>
    </main>
  );
}

/* Small "צרי קשר" button for the desktop header (next to "חיפוש" and "החשבון שלי") */
export function HeaderContactLink({ showLabel = true }: { showLabel?: boolean }) {
  return (
    <Link href="/contact" className="ct-headlink" aria-label="צרי קשר">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12.5a8 8 0 0 1-11.6 7.1L4 21l1.4-4.2A8 8 0 1 1 20 12.5z" /><path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" strokeWidth="2.2" /></svg>
      {showLabel && <span>צרי קשר</span>}
    </Link>
  );
}
