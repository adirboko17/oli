import { promises as fs } from "fs";
import path from "path";

export type PromoLead = {
  code: string;
  name: string;
  phone: string;
  email: string;
  a1: string;
  a2: string;
  a3: string;
  path?: { questionId: string; choiceId: string }[];
  recommended: string[];
  used: boolean;
  createdAt: string;
};

const file = path.join(process.cwd(), ".data", "promo-leads.json");
let cache: PromoLead[] | null = null;
let queue = Promise.resolve();

function run<T>(fn: () => Promise<T>) {
  const next = queue.then(fn, fn);
  queue = next.then(() => undefined, () => undefined);
  return next;
}

async function read() {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function write(leads: PromoLead[]) {
  cache = leads;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(leads));
}

function freshCode(leads: PromoLead[]) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let code = "OLI";
    for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!leads.some((lead) => lead.code === code)) return code;
  }
  return "OLI" + Date.now().toString(36).toUpperCase();
}

export function issuePromoLead(lead: Omit<PromoLead, "code" | "used" | "createdAt">) {
  return run(async () => {
    const leads = await read();
    const existing = leads.find((item) => item.email === lead.email || item.phone === lead.phone);
    if (existing) {
      if (existing.used) return null;
      return existing.code;
    }
    const code = freshCode(leads);
    leads.push({ ...lead, code, used: false, createdAt: new Date().toISOString() });
    await write(leads);
    return code;
  });
}

export function promoPercent(code: string) {
  const key = code.trim().toUpperCase();
  if (key === "OLI5") return Promise.resolve(5);
  return run(async () => {
    const leads = await read();
    const lead = leads.find((item) => item.code === key);
    return lead && !lead.used ? 5 : 0;
  });
}

export function consumePromo(code: string) {
  const key = code.trim().toUpperCase();
  if (!key || key === "OLI5") return Promise.resolve(true);
  return run(async () => {
    const leads = await read();
    const lead = leads.find((item) => item.code === key);
    if (!lead || lead.used) return false;
    lead.used = true;
    await write(leads);
    return true;
  });
}
