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

export const STATUS_LABEL: Record<Exclude<EventStatus, 'draft'>, string> = {
  open: 'פתוח להרשמה', full: 'ההרשמה מלאה', ended: 'הסתיים', cancelled: 'בוטל',
};

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

export const publicEvents = (events: OliEvent[]) => events.filter(e => e.status !== 'draft');
export const upcomingEvents = (events: OliEvent[]) => publicEvents(events).filter(e => e.status !== 'ended').sort((a, b) => a.date.localeCompare(b.date) || a.from.localeCompare(b.from));
export const pastEvents = (events: OliEvent[]) => publicEvents(events).filter(e => e.status === 'ended').sort((a, b) => b.date.localeCompare(a.date) || b.from.localeCompare(a.from));
export const getEvent = (events: OliEvent[], slug: string) => publicEvents(events).find(e => e.slug === slug);

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
