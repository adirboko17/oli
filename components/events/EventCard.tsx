import Link from 'next/link';
import { OliEvent, fmt } from './events';

const Status = ({ e }: { e: OliEvent }) => <span className={`oe-status oe-status--${e.status}`}>{fmt(e).statusLabel}</span>;
export { Status };

/** Photo card – desktop grid + "more events" carousel */
export function EventCard({ e }: { e: OliEvent }) {
  const f = fmt(e);
  return (
    <Link href={`/events/${e.slug}`} className={`oe-card${f.dim ? ' is-dim' : ''}`}>
      <div className="oe-card__img">
        {e.image && <img src={e.image} alt={e.title} loading="lazy" />}
        <div className="oe-date"><span className="oe-date__day">{f.day}</span><span className="oe-date__mon">{f.month}</span></div>
      </div>
      <div className="oe-card__tags"><Status e={e} /><span className="oe-muted">{f.typeLabel}</span></div>
      <h3 className="oe-card__title">{e.title}</h3>
      <div className="oe-card__foot"><span>{f.weekday} · {f.timeLabel}</span><strong>{f.priceLabel}</strong></div>
    </Link>
  );
}

/** Compact row – events list on mobile */
export function EventRow({ e }: { e: OliEvent }) {
  const f = fmt(e);
  return (
    <Link href={`/events/${e.slug}`} className={`oe-row${f.dim ? ' is-dim' : ''}`}>
      <div className="oe-row__img">
        {e.image ? <img src={e.image} alt="" loading="lazy" /> : <span className="oe-row__noimg"><b>{f.day}</b>{f.month}</span>}
      </div>
      <div className="oe-row__text">
        <span className="oe-row__when">{f.day} ב{f.month} · {f.weekday} · {e.from}</span>
        <span className="oe-row__title">{e.title}</span>
        <div className="oe-row__meta"><span>{f.typeLabel}</span><i className="oe-dot" /><strong>{f.priceLabel}</strong>{e.status !== 'open' && <Status e={e} />}</div>
      </div>
    </Link>
  );
}
