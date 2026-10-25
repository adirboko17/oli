import './OliminiPromise.css';

export interface PromiseItem { num: string; title: string; text: string }

const DEFAULT_ITEMS: PromiseItem[] = [
  { num: '0+', title: 'מגיל לידה', text: 'נוסחות עדינות שמתאימות לעור של תינוק מהיום הראשון.' },
  { num: '0%', title: 'סבונים, פרפום ופתלטים', text: 'רק מה שהעור של התינוק צריך, בלי תוספות מיותרות.' },
  { num: '3', title: 'צעדים בחבילה אחת', text: 'רחצה, לחות ועיסוי. רגע קבוע של מגע ורוגע.' },
];

/** "ההבטחה של olimini" – placed directly below the To Go strip on the olimini page. */
export default function OliminiPromise({ items = DEFAULT_ITEMS }: { items?: PromiseItem[] }) {
  return (
    <section className="opr" dir="rtl">
      <div className="opr__inner">
        <div className="opr__head">
          <span className="opr__eyebrow">ההבטחה של olimini</span>
          <h2 className="opr__title">עדין מספיק ליום הראשון</h2>
        </div>
        <div className="opr__box">
          {items.map(it => (
            <div key={it.num + it.title} className="opr__item">
              <span className="opr__num">{it.num}</span>
              <div className="opr__text">
                <span className="opr__name">{it.title}</span>
                <span className="opr__desc">{it.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
