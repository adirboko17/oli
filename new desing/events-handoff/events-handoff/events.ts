export type EventStatus = 'draft' | 'open' | 'full' | 'ended' | 'cancelled';

export interface OliEvent {
  slug: string;
  title: string;
  short: string;          // תיאור קצר
  body: string[];         // תיאור מלא – פסקאות
  date: string;           // YYYY-MM-DD
  from: string;           // HH:MM
  to: string;             // HH:MM
  online: boolean;
  address?: string;       // אם לא אונליין
  price: number;          // 0 = חינם
  status: EventStatus;
  image?: string;
}

// Demo data – replace with data from the admin / DB. Images are temporary.
export const EVENTS: OliEvent[] = [
  { slug: 'birth-prep', title: 'סדנת הכנה ללידה', short: 'מפגש אונליין על שלבי הלידה, נשימות ותנוחות, ומה כדאי לארוז לתיק ללידה.', date: '2026-11-04', from: '20:00', to: '21:30', online: true, price: 0, status: 'open', image: '/assets/stage-birth.png',
    body: ['מפגש של שעה וחצי שמסדר את כל מה שקורה בלידה: איך מזהים שהיא מתחילה, מתי לצאת לבית החולים ומה קורה בכל שלב.', 'נתרגל יחד נשימות ותנוחות שעוזרות בצירים, ונעבור על רשימה מסודרת לתיק ללידה, לך ולבייבי.', 'בסוף המפגש יהיה זמן לשאלות. המפגש מתקיים בזום, וקישור יישלח אלייך במייל האישור.'] },
  { slug: 'skin-in-pregnancy', title: 'טיפוח העור בהריון: מה בטוח ומה לא', short: 'שאלות ותשובות על רכיבים, סימני מתיחה ושגרת טיפוח בטוחה לאורך ההריון.', date: '2026-11-12', from: '20:30', to: '21:30', online: true, price: 0, status: 'open', image: '/assets/stage-preg.png',
    body: ['אילו רכיבים כדאי להוריד מהמדף בזמן ההריון, ובמה אפשר להמשיך להשתמש בלי חשש.', 'נדבר על מניעת סימני מתיחה, יובש וגירוד בבטן, ועל שגרת טיפוח פשוטה לכל טרימסטר.', 'אפשר לשלוח שאלות מראש בטופס ההרשמה או לשאול בזמן המפגש.'] },
  { slug: 'nursing-prep', title: 'מפגש הכנה להנקה', short: 'מפגש פרונטלי בקבוצה קטנה: תנוחות הנקה, ימים ראשונים ומה עושים כשקשה.', date: '2026-11-19', from: '10:00', to: '12:30', online: false, address: 'הברזל 30, תל אביב', price: 120, status: 'full', image: '/assets/research.png',
    body: ['מפגש בקבוצה קטנה שמכין להנקה עוד לפני הלידה: איך נראית הנקה בימים הראשונים, תנוחות ואחיזה נכונה.', 'נעבור על הקשיים הנפוצים, איך מזהים שהבייבי אוכל מספיק ומתי כדאי לפנות לייעוץ.', 'מספר המקומות מוגבל. כיבוד קל במקום.'] },
  { slug: 'postpartum-body', title: 'הגוף אחרי לידה', short: 'מה קורה לגוף בשבועות שאחרי הלידה, החלמה, טיפוח וחזרה הדרגתית לתנועה.', date: '2026-12-02', from: '20:00', to: '21:00', online: true, price: 60, status: 'open', image: '/assets/stage-baby.png',
    body: ['השבועות הראשונים אחרי לידה מביאים איתם שינויים שלא תמיד מדברים עליהם. במפגש נעבור על מה נורמלי ומה דורש בדיקה.', 'נדבר על החלמה של אזור הפרינאום, טיפוח העור והפטמות, ומתי ואיך חוזרים לתנועה.', 'המפגש מתקיים בזום. התשלום מתבצע במערכת התשלום של החנות, והחשבונית נשלחת למייל.'] },
  { slug: 'baby-sleep', title: 'שינה של תינוקות בחודשים הראשונים', short: 'שאלות ותשובות על שגרת שינה, יקיצות לילה וסביבת שינה בטוחה.', date: '2026-10-28', from: '20:30', to: '21:30', online: true, price: 0, status: 'cancelled',
    body: ['מפגש שאלות ותשובות על שינה של תינוקות בחודשים הראשונים.', 'המפגש בוטל. מפגש חדש יפורסם כאן בהמשך.'] },
  { slug: 'safe-pregnancy-evening', title: 'ערב היריון בטוח', short: 'ערב מפגש ושיחה על בחירת מוצרים בטוחים לאורך ההריון.', date: '2026-09-15', from: '19:30', to: '21:30', online: false, address: 'הברזל 30, תל אביב', price: 0, status: 'ended', image: '/assets/research-2.png',
    body: ['ערב מפגש ושיחה על בחירת מוצרים בטוחים לאורך ההריון.', 'המפגש התקיים. מפגשים חדשים מתפרסמים בעמוד האירועים.'] },
];

export const STATUS_LABEL: Record<Exclude<EventStatus, 'draft'>, string> = {
  open: 'פתוח להרשמה', full: 'ההרשמה מלאה', ended: 'הסתיים', cancelled: 'בוטל',
};

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

export const publicEvents = () => EVENTS.filter(e => e.status !== 'draft');       // drafts never shown
export const upcomingEvents = () => publicEvents().filter(e => e.status !== 'ended').sort((a, b) => a.date.localeCompare(b.date));
export const pastEvents = () => publicEvents().filter(e => e.status === 'ended').sort((a, b) => b.date.localeCompare(a.date));
export const getEvent = (slug: string) => publicEvents().find(e => e.slug === slug);

export function fmt(e: OliEvent) {
  const d = new Date(`${e.date}T${e.from}`);
  const wd = `יום ${DAYS[d.getDay()]}`;
  return {
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
    weekday: wd,
    dateLabel: `${wd}, ${d.getDate()} ב${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    timeLabel: `${e.from}–${e.to}`,
    where: e.online ? 'אונליין, בזום' : e.address ?? '',
    whereNote: e.online ? 'הקישור יישלח במייל האישור בלבד' : 'הוראות הגעה יישלחו במייל האישור',
    typeLabel: e.online ? 'אונליין' : 'פרונטלי',
    priceLabel: e.price ? `₪${e.price}` : 'חינם',
    statusLabel: e.status === 'draft' ? '' : STATUS_LABEL[e.status],
    dim: e.status === 'ended' || e.status === 'cancelled',
  };
}

const stamp = (e: OliEvent, t: string) => `${e.date.replace(/-/g, '')}T${t.replace(':', '')}00`;
const calDetails = (e: OliEvent) => (e.online ? 'קישור הזום נמצא במייל האישור.' : e.short);

export function googleCalendarUrl(e: OliEvent) {
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: `${e.title} · Oli`, dates: `${stamp(e, e.from)}/${stamp(e, e.to)}`,
    ctz: 'Asia/Jerusalem', location: fmt(e).where, details: calDetails(e),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadIcs(e: OliEvent) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Oli Safe Care//HE', 'BEGIN:VEVENT', `UID:${e.slug}@olisafecare.com`,
    `DTSTART;TZID=Asia/Jerusalem:${stamp(e, e.from)}`, `DTEND;TZID=Asia/Jerusalem:${stamp(e, e.to)}`, `SUMMARY:${e.title} · Oli`,
    `LOCATION:${fmt(e).where}`, `DESCRIPTION:${calDetails(e)}`, 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `${e.slug}.ics`;
  a.click();
}

export interface RegistrationData {
  eventSlug: string;
  fullName: string;
  phone: string;
  email: string;
  stage: 'pregnant' | 'born';
  dueDate?: string;        // stage = pregnant, mode = date
  pregnancyWeek?: number;  // stage = pregnant, mode = week
  babyBirthDate?: string;  // stage = born
  acceptTerms: boolean;
  marketing: boolean;
}
