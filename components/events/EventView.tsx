'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { OliEvent, RegistrationData, fmt, upcomingEvents } from './events';
import { EventCard, Status } from './EventCard';
import RegistrationForm from './RegistrationForm';
import './Events.css';

const MSG: Partial<Record<OliEvent['status'], [string, string]>> = {
  full: ['ההרשמה מלאה', 'כל המקומות במפגש הזה נתפסו. מפגשים נוספים מתפרסמים כאן באופן קבוע.'],
  ended: ['המפגש הסתיים', 'המפגש הזה כבר התקיים. אפשר להירשם לאחד המפגשים הקרובים.'],
  cancelled: ['המפגש בוטל', 'מי שנרשמה קיבלה הודעה במייל. מפגש חדש יפורסם כאן בהמשך.'],
};

const Icon = ({ d }: { d: React.ReactNode }) => (
  <span className="oe-detail__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg></span>
);
const I = {
  cal: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  tag: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-6.9 6.9a1 1 0 0 1-1.4 0z" /><circle cx="8" cy="8" r="1.3" /></>,
};

export default function EventView({ event: e, onRegister }: {
  event: OliEvent;
  /** TODO backend: save registration, send confirmation email with Zoom link, schedule reminders (day + hour before, email + SMS).
   *  For paid events: run the store checkout first and resolve only after payment succeeded. */
  onRegister: (data: RegistrationData) => Promise<void | { ok: false; message: string }>;
}) {
  const f = fmt(e);
  const asideRef = useRef<HTMLElement>(null);
  const scrollToForm = () => {
    const el = asideRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };
  const related = upcomingEvents().filter(x => x.slug !== e.slug && x.status !== 'cancelled').slice(0, 6);
  const msg = MSG[e.status];

  return (
    <main className="oe-page" dir="rtl">
      <section className="oe-container oe-event">
        <nav className="oe-crumbs"><Link href="/">דף הבית</Link><span>/</span><Link href="/events">אירועים</Link><span>/</span><span className="oe-crumbs__current">{e.title}</span></nav>

        <div className="oe-event__grid">
          <div className="oe-event__main">
            {e.image && <div className="oe-event__hero"><img src={e.image} alt={e.title} /></div>}
            <header className="oe-event__head">
              <div className="oe-card__tags"><Status e={e} /><span className="oe-muted">{f.typeLabel}</span></div>
              <h1 className="oe-event__title">{e.title}</h1>
              <p className="oe-event__lead">{e.short}</p>
              {e.status === 'open' && <button className="oe-btn oe-event__mcta" onClick={scrollToForm}>להרשמה · {f.priceLabel}</button>}
            </header>
            <div className="oe-event__about">
              <h2>על המפגש</h2>
              {e.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          <aside ref={asideRef} className="oe-event__aside">
            <div className="oe-panel">
              <div className="oe-details">
                <div className="oe-detail"><Icon d={I.cal} /><span><small>תאריך</small><b>{f.dateLabel}</b></span></div>
                <div className="oe-detail"><Icon d={I.clock} /><span><small>שעה</small><b>{f.timeLabel}</b></span></div>
                <div className="oe-detail"><Icon d={I.pin} /><span><small>מיקום</small><b>{f.where}</b><em>{f.whereNote}</em></span></div>
                <div className="oe-detail"><Icon d={I.tag} /><span><small>מחיר</small><b>{f.priceLabel}</b></span></div>
              </div>
              <div className="oe-panel__sep" />
              {e.status === 'open' && <RegistrationForm event={e} onRegister={onRegister} onDone={scrollToForm} />}
              {msg && (
                <div className="oe-msg">
                  <span className="oe-panel__title">{msg[0]}</span>
                  <p>{msg[1]}</p>
                  <Link href="/events" className="oe-btn oe-btn--ghost">לאירועים הקרובים ←</Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="oe-related">
          <div className="oe-container">
            <div className="oe-related__head"><h2>עוד מפגשים</h2><Link href="/events">לכל האירועים ←</Link></div>
            <div className="oe-related__track">{related.map(x => <EventCard key={x.slug} e={x} />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
