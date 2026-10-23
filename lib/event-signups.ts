import { promises as fs } from "fs";
import path from "path";
import { getEvent, type RegistrationData } from "@/components/events/events";

export type EventSignup = RegistrationData & { createdAt: string };
export type EventNotify = { email: string; createdAt: string };

const signupsFile = path.join(process.cwd(), ".data", "event-signups.json");
const notifyFile = path.join(process.cwd(), ".data", "event-notify.json");
let signupCache: EventSignup[] | null = null;
let notifyCache: EventNotify[] | null = null;
let queue = Promise.resolve();

function run<T>(fn: () => Promise<T>) {
  const next = queue.then(fn, fn);
  queue = next.then(() => undefined, () => undefined);
  return next;
}

async function readJson<T>(file: string, cache: T[] | null) {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [] as T[];
  }
}

async function writeJson(file: string, rows: unknown[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(rows));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0\d{8,9}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function registerForEvent(data: RegistrationData) {
  return run(async () => {
    const event = getEvent(data.eventSlug);
    if (!event || event.status !== "open") return { ok: false as const, message: "ההרשמה למפגש הזה סגורה." };
    if (event.price > 0) return { ok: false as const, message: "התשלום למפגש הזה עדיין לא זמין באתר. אפשר לפנות אלינו ונשלים את ההרשמה." };
    const fullName = data.fullName.trim().slice(0, 80);
    const phone = data.phone.replace(/\D/g, "");
    const email = data.email.trim().toLowerCase().slice(0, 120);
    if (fullName.length < 2 || !PHONE_RE.test(phone) || !EMAIL_RE.test(email) || !data.acceptTerms) {
      return { ok: false as const, message: "יש להשלים את השדות המסומנים" };
    }
    if (data.stage === "pregnant") {
      const hasDate = Boolean(data.dueDate && DATE_RE.test(data.dueDate));
      const week = data.pregnancyWeek;
      const hasWeek = typeof week === "number" && week >= 4 && week <= 42;
      if (!hasDate && !hasWeek) return { ok: false as const, message: "יש להשלים את השדות המסומנים" };
    } else if (data.stage !== "born" || !data.babyBirthDate || !DATE_RE.test(data.babyBirthDate)) {
      return { ok: false as const, message: "יש להשלים את השדות המסומנים" };
    }

    const signups = await readJson<EventSignup>(signupsFile, signupCache);
    signupCache = signups;
    const existing = signups.find((row) => row.eventSlug === event.slug && (row.phone === phone || row.email === email));
    if (existing) return { ok: true as const, event, created: false, email };

    const row: EventSignup = {
      eventSlug: event.slug,
      fullName,
      phone,
      email,
      stage: data.stage,
      dueDate: data.stage === "pregnant" ? data.dueDate : undefined,
      pregnancyWeek: data.stage === "pregnant" ? data.pregnancyWeek : undefined,
      babyBirthDate: data.stage === "born" ? data.babyBirthDate : undefined,
      acceptTerms: true,
      marketing: Boolean(data.marketing),
      createdAt: new Date().toISOString(),
    };
    signups.push(row);
    await writeJson(signupsFile, signups);
    return { ok: true as const, event, created: true, email, fullName };
  });
}

export function saveEventNotify(email: string) {
  return run(async () => {
    const clean = email.trim().toLowerCase().slice(0, 120);
    if (!EMAIL_RE.test(clean)) return false;
    const rows = await readJson<EventNotify>(notifyFile, notifyCache);
    notifyCache = rows;
    if (!rows.some((row) => row.email === clean)) {
      rows.push({ email: clean, createdAt: new Date().toISOString() });
      await writeJson(notifyFile, rows);
    }
    return true;
  });
}
