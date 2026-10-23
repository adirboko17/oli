'use client';
import { useState } from 'react';
import Link from 'next/link';
import { OliEvent, RegistrationData, googleCalendarUrl, downloadIcs } from './events';

type Errs = Partial<Record<'name' | 'phone' | 'email' | 'due' | 'week' | 'baby' | 'terms', boolean>>;
const WEEKS = Array.from({ length: 39 }, (_, i) => i + 4);

export default function RegistrationForm({ event: e, onRegister, onDone }: {
  event: OliEvent; onRegister: (d: RegistrationData) => Promise<void>; onDone?: () => void;
}) {
  const [v, setV] = useState({ name: '', phone: '', email: '', stage: 'pregnant' as 'pregnant' | 'born', mode: 'date' as 'date' | 'week', due: '', week: '', baby: '', terms: false, news: true });
  const [errs, setErrs] = useState<Errs>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof v) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = ev.target.type === 'checkbox' ? (ev.target as HTMLInputElement).checked : ev.target.value;
    setV(s => ({ ...s, [k]: val })); setErrs(s => ({ ...s, [k]: false })); setErr('');
  };

  const submit = async () => {
    const er: Errs = {};
    if (v.name.trim().length < 2) er.name = true;
    if (!/^0\d{8,9}$/.test(v.phone.replace(/\D/g, ''))) er.phone = true;
    if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = true;
    if (v.stage === 'pregnant') { if (v.mode === 'date' ? !v.due : !v.week) er[v.mode === 'date' ? 'due' : 'week'] = true; }
    else if (!v.baby) er.baby = true;
    if (!v.terms) er.terms = true;
    if (Object.keys(er).length) {
      setErrs(er);
      setErr(er.terms && Object.keys(er).length === 1 ? 'יש לאשר את תנאי ההשתתפות' : 'יש להשלים את השדות המסומנים');
      return;
    }
    setBusy(true);
    try {
      await onRegister({
        eventSlug: e.slug, fullName: v.name.trim(), phone: v.phone.replace(/\D/g, ''), email: v.email.trim(), stage: v.stage,
        dueDate: v.stage === 'pregnant' && v.mode === 'date' ? v.due : undefined,
        pregnancyWeek: v.stage === 'pregnant' && v.mode === 'week' ? Number(v.week) : undefined,
        babyBirthDate: v.stage === 'born' ? v.baby : undefined,
        acceptTerms: v.terms, marketing: v.news,
      });
      setDone(true); onDone?.();
    } catch { setErr('משהו השתבש. נסי שוב בעוד רגע.'); }
    finally { setBusy(false); }
  };

  if (done) {
    const first = v.name.trim().split(/\s+/)[0];
    return (
      <div className="oe-done">
        <span className="oe-done__check"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <span className="oe-done__title">נרשמת, {first}!</span>
        <p>{e.online
          ? `שלחנו מייל אישור ל־${v.email} עם קישור הזום. הקישור לא מופיע באתר, אז כדאי לשמור את המייל.`
          : `שלחנו מייל אישור ל־${v.email} עם כל הפרטים והוראות ההגעה.`}{e.price ? ' החשבונית נשלחה באותו מייל.' : ''}</p>
        <div className="oe-done__cal">
          <a href={googleCalendarUrl(e)} target="_blank" rel="noopener" className="oe-btn">הוסיפי ליומן Google</a>
          <button onClick={() => downloadIcs(e)} className="oe-btn oe-btn--ghost">הוסיפי ליומן Apple / Outlook</button>
        </div>
        <span className="oe-muted oe-small">תזכורת תישלח אלייך יום לפני ושעה לפני המפגש, במייל וב־SMS.</span>
      </div>
    );
  }

  const cls = (k: keyof Errs) => `oe-input${errs[k] ? ' is-err' : ''}`;
  return (
    <div className="oe-form">
      <span className="oe-panel__title">הרשמה למפגש</span>
      <label className="oe-field">שם מלא<input value={v.name} onChange={set('name')} autoComplete="name" className={cls('name')} /></label>
      <label className="oe-field">טלפון<input type="tel" inputMode="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" placeholder="05X-XXXXXXX" className={cls('phone')} /></label>
      <label className="oe-field">מייל<input type="email" value={v.email} onChange={set('email')} autoComplete="email" className={cls('email')} /></label>

      <div className="oe-field">
        <span>איפה את עכשיו?</span>
        <div className="oe-seg">
          <button type="button" className={v.stage === 'pregnant' ? 'is-on' : ''} onClick={() => setV(s => ({ ...s, stage: 'pregnant' }))}>בהריון</button>
          <button type="button" className={v.stage === 'born' ? 'is-on' : ''} onClick={() => setV(s => ({ ...s, stage: 'born' }))}>ילדתי</button>
        </div>
      </div>

      {v.stage === 'pregnant' ? (
        <div className="oe-field">
          <div className="oe-mode">
            <button type="button" className={v.mode === 'date' ? 'is-on' : ''} onClick={() => setV(s => ({ ...s, mode: 'date' }))}>תאריך לידה משוער</button>
            <button type="button" className={v.mode === 'week' ? 'is-on' : ''} onClick={() => setV(s => ({ ...s, mode: 'week' }))}>שבוע הריון</button>
          </div>
          {v.mode === 'date'
            ? <input type="date" aria-label="תאריך לידה משוער" value={v.due} onChange={set('due')} className={cls('due')} />
            : <select aria-label="שבוע הריון" value={v.week} onChange={set('week')} className={cls('week')}><option value="">בחרי שבוע</option>{WEEKS.map(w => <option key={w} value={w}>שבוע {w}</option>)}</select>}
        </div>
      ) : (
        <label className="oe-field">תאריך הלידה של הבייבי<input type="date" value={v.baby} onChange={set('baby')} className={cls('baby')} /></label>
      )}

      <div className="oe-checks">
        <label className={`oe-check${errs.terms ? ' is-err' : ''}`}><input type="checkbox" checked={v.terms} onChange={set('terms')} /><span>קראתי ואני מאשרת את <Link href="/terms">תנאי ההשתתפות</Link></span></label>
        <label className="oe-check"><input type="checkbox" checked={v.news} onChange={set('news')} /><span>אשמח לקבל עדכונים, הטבות ומפגשים חדשים במייל</span></label>
      </div>

      {err && <span className="oe-err">{err}</span>}
      <button onClick={submit} disabled={busy} className="oe-btn oe-btn--lg">{e.price ? `להרשמה ותשלום · ₪${e.price}` : 'להרשמה חינם'}</button>
      <span className="oe-muted oe-small oe-center">{e.price
        ? 'התשלום מתבצע במערכת התשלום של החנות. החשבונית ומייל האישור יישלחו אלייך.'
        : e.online ? 'אחרי ההרשמה יישלח אלייך מייל אישור עם קישור הזום.' : 'אחרי ההרשמה יישלח אלייך מייל אישור עם כל הפרטים.'}</span>
    </div>
  );
}
