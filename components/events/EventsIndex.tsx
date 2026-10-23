'use client';
import { useState } from 'react';
import Link from 'next/link';
import { OliEvent, fmt, upcomingEvents, pastEvents, MONTHS } from './events';
import { EventCard, EventRow, Status } from './EventCard';
import './Events.css';

export default function EventsIndex({ upcoming = upcomingEvents(), past = pastEvents() }: { upcoming?: OliEvent[]; past?: OliEvent[] }) {
  const [tab, setTab] = useState<'up' | 'past'>('up');
  const feat = tab === 'up' ? upcoming.find(e => e.status === 'open') : undefined;
  const list = (tab === 'up' ? upcoming : past).filter(e => e !== feat);

  return (
    <main className="oe-page" dir="rtl">
      <section className="oe-container oe-index">
        <nav className="oe-crumbs"><Link href="/">דף הבית</Link><span>/</span><span className="oe-crumbs__current">אירועים</span></nav>

        <header className="oe-index__head">
          <span className="oe-eyebrow">מפגשים וסדנאות</span>
          <h1 className="oe-index__title">אירועים</h1>
          <p className="oe-index__intro">מפגשים אונליין ופרונטליים להריון, ללידה ולתקופה שאחרי. רוב המפגשים ללא עלות, וההרשמה פתוחה עד שהמקומות נגמרים.</p>
        </header>

        <nav className="oe-tabs">
          {([['up', 'אירועים קרובים', upcoming.length], ['past', 'אירועים שהתקיימו', past.length]] as const).map(([k, label, n]) => (
            <button key={k} onClick={() => setTab(k)} className={`oe-tab${tab === k ? ' is-on' : ''}`}>{label}<span>{n}</span></button>
          ))}
        </nav>

        {feat && <Featured e={feat} />}

        {list.length > 0 && (
          <>
            <div className="oe-grid">{list.map(e => <EventCard key={e.slug} e={e} />)}</div>
            <div className="oe-rows">{list.map(e => <EventRow key={e.slug} e={e} />)}</div>
          </>
        )}

        {tab === 'up' && upcoming.length === 0 && <EmptyUpcoming />}
        {tab === 'past' && past.length === 0 && <p className="oe-none">אין כרגע אירועים להצגה.</p>}
      </section>
    </main>
  );
}

function Featured({ e }: { e: OliEvent }) {
  const f = fmt(e);
  return (
    <Link href={`/events/${e.slug}`} className="oe-feat">
      <div className="oe-feat__img">{e.image && <img src={e.image} alt={e.title} />}</div>
      <div className="oe-feat__body">
        <div className="oe-feat__tags"><span className="oe-eyebrow">המפגש הקרוב</span><Status e={e} /></div>
        <h2 className="oe-feat__title">{e.title}</h2>
        <p className="oe-feat__short">{e.short}</p>
        <div className="oe-feat__meta"><span>{f.dateLabel} · {f.timeLabel}</span><span className="oe-muted">{f.where} · {f.priceLabel}</span></div>
        <span className="oe-btn oe-feat__cta">לפרטים ולהרשמה ←</span>
      </div>
    </Link>
  );
}

/** Empty state – no upcoming events */
function EmptyUpcoming() {
  const [email, setEmail] = useState('');
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState(false);
  const now = new Date();
  const m = (k: number) => MONTHS[(now.getMonth() + k) % 12];

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setBad(true);
    const response = await fetch("/api/events/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (!response.ok) return setBad(true);
    setDone(true);
  };

  return (
    <div className="oe-empty">
      <div className="oe-empty__art" aria-hidden="true">
        <span className="oe-empty__tile oe-empty__tile--r"><b>··</b>{m(1)}</span>
        <span className="oe-empty__tile oe-empty__tile--l"><b>··</b>{m(2)}</span>
        <span className="oe-empty__tile oe-empty__tile--front"><b>בקרוב</b>{m(0)}</span>
      </div>
      <h2 className="oe-empty__title">אין כרגע אירועים קרובים</h2>
      <p className="oe-empty__text">אנחנו כבר עובדות על המפגש הבא. השאירי מייל ונעדכן אותך ברגע שההרשמה תיפתח.</p>
      {done ? (
        <span className="oe-empty__done">✓ מעולה, נעדכן אותך במייל</span>
      ) : (
        <div className="oe-empty__form">
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setBad(false); }} placeholder="המייל שלך" aria-label="מייל לעדכון" className={`oe-input oe-input--pill${bad ? ' is-err' : ''}`} />
          <button onClick={submit} className="oe-btn">עדכנו אותי</button>
        </div>
      )}
      <div className="oe-empty__links"><span className="oe-muted">בינתיים:</span><Link href="/articles">למאמרים ←</Link><Link href="/podcast">לפודקאסט ←</Link></div>
    </div>
  );
}
