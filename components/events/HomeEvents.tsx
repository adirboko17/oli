import Link from 'next/link';
import { useSite } from '@/components/site';
import { OliEvent, fmt, upcomingEvents } from './events';
import { Status } from './EventCard';
import './Events.css';

/** Home page strip "נפגשות בקרוב" – placed directly above "המומלצים שלנו". Hidden when there are no upcoming events. */
export default function HomeEvents({ events }: { events?: OliEvent[] }) {
  const source = events ?? upcomingEvents(useSite().events);
  const list = source.filter(e => e.status === 'open' || e.status === 'full').slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="oe-home" dir="rtl">
      <div className="oe-container oe-home__inner">
        <div className="oe-home__head">
          <span className="oe-eyebrow">אירועים קרובים</span>
          <h2 className="oe-home__title">נפגשות בקרוב</h2>
          <p className="oe-home__text">מפגשים אונליין ופרונטליים להריון, ללידה ולתקופה שאחרי. רוב המפגשים ללא עלות.</p>
          <Link href="/events" className="oe-btn oe-btn--ghost">לכל האירועים ←</Link>
        </div>
        <div className="oe-home__list">
          {list.map(e => {
            const f = fmt(e);
            return (
              <Link key={e.slug} href={`/events/${e.slug}`} className="oe-home__row">
                <span className="oe-home__date"><b>{f.day}</b><span>{f.month}</span></span>
                <span className="oe-home__info">
                  <span className="oe-home__name">{e.title}</span>
                  <span className="oe-home__meta"><span>{f.weekday} · {e.from}</span><i className="oe-dot" /><span>{f.typeLabel}</span><i className="oe-dot" /><strong>{f.priceLabel}</strong>{e.status === 'full' && <Status e={e} />}</span>
                </span>
                <span className="oe-home__arrow">←</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
