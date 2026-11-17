import './OliminiPromise.css';

export interface PromiseItem { num: string; title: string; text: string; icon?: 'shield' }

const DEFAULT_ITEMS: PromiseItem[] = [
  { num: '', icon: 'shield', title: 'פותח בשיתוף מומחים', text: 'בשיתוף רופאים ואנשי מקצוע, מתוך היכרות עם הצרכים הייחודיים של עור התינוק.' },
  { num: '0%', title: 'פרבנים ושמנים מינרליים', text: 'פורמולות ללא פרבנים, שמנים מינרליים ופתלטים, עם רכיבים שנבחרו בקפידה.' },
  { num: '0+', title: 'מגיל לידה', text: 'פורמולות עדינות המותאמות לטיפוח עור התינוק כבר מהיום הראשון.' },
];

function ShieldIcon() {
  return (
    <svg className="opr__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.8 4.5 5.6v5.6c0 4.6 3.1 8.6 7.5 10 4.4-1.4 7.5-5.4 7.5-10V5.6L12 2.8Z" />
      <path d="m8.8 12.2 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

/** "ההבטחה של olimini" – placed directly below the To Go strip on the olimini page. */
export default function OliminiPromise({ items = DEFAULT_ITEMS }: { items?: PromiseItem[] }) {
  return (
    <section className="opr" dir="rtl">
      <div className="opr__inner">
        <div className="opr__head">
          <span className="opr__eyebrow">ההבטחה של olimini</span>
          <h2 className="opr__title">טיפוח עדין. פיתוח מקצועי.</h2>
          <p className="opr__sub">מוצרי טיפוח לתינוקות שפותחו בשיתוף מומחים, עם רכיבים שנבחרו בקפידה והתאמה לצורכי העור מהיום הראשון.</p>
        </div>
        <div className="opr__box">
          {items.map(it => (
            <div key={it.num + it.title} className="opr__item">
              <span className="opr__num">{it.icon === 'shield' ? <ShieldIcon /> : it.num}</span>
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
