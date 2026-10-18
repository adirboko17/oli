import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { blankAccount, type AccountRecord } from "@/lib/account-record";
import { isMobilePhone, phoneKey } from "@/lib/phone";
import { cookieBase, readSigned, signValue } from "@/lib/signed-cookie";
import { STORE_ID } from "@/lib/store";
import { pulseemReady } from "@/lib/pulseem";

const BOOK = "oli_accounts";
const VERIFIED = "oli_phone_ok";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CustomerRow = { id: string; name: string; email: string | null; phone: string | null };

function serviceEnv() {
  const url = (process.env.STORELY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim().replace(/\/$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

export async function readAccountBook() {
  const jar = await cookies();
  const raw = readSigned(jar.get(BOOK)?.value);
  if (!raw) return [] as AccountRecord[];
  try {
    const parsed = JSON.parse(raw) as AccountRecord[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && isMobilePhone(item.phone || "")) : [];
  } catch {
    return [];
  }
}

export function writeAccountBook(response: NextResponse, accounts: AccountRecord[]) {
  response.cookies.set(BOOK, signValue(JSON.stringify(accounts.slice(-30))), { ...cookieBase, maxAge: 60 * 60 * 24 * 365 });
}

export function markPhoneVerified(response: NextResponse, phone: string) {
  const payload = JSON.stringify({ phone: phoneKey(phone), exp: Date.now() + 15 * 60 * 1000 });
  response.cookies.set(VERIFIED, signValue(payload), { ...cookieBase, maxAge: 15 * 60 });
}

export async function verifiedPhone() {
  const jar = await cookies();
  const raw = readSigned(jar.get(VERIFIED)?.value);
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as { phone?: string; exp?: number };
    if (!parsed.exp || parsed.exp < Date.now() || !isMobilePhone(parsed.phone || "")) return "";
    return phoneKey(parsed.phone || "");
  } catch {
    return "";
  }
}

function samePhone(left: string, right: string) {
  return phoneKey(left) === phoneKey(right);
}

async function customerByPhone(phone: string) {
  const env = serviceEnv();
  if (!env || !pulseemReady()) return null;
  const last9 = phoneKey(phone).slice(-9);
  const query = new URLSearchParams({
    select: "id,name,email,phone",
    store_id: `eq.${STORE_ID}`,
    phone: `ilike.*${last9}*`,
    limit: "8",
  });
  const response = await fetch(`${env.url}/rest/v1/customers?${query}`, {
    headers: { apikey: env.secret, authorization: `Bearer ${env.secret}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const rows = (await response.json().catch(() => [])) as CustomerRow[];
  return rows.find((row) => samePhone(row.phone || "", phone)) ?? rows[0] ?? null;
}

async function addressFor(customerId: string) {
  const env = serviceEnv();
  if (!env) return { city: "", addr: "" };
  const query = new URLSearchParams({
    select: "city,street",
    store_id: `eq.${STORE_ID}`,
    customer_id: `eq.${customerId}`,
    limit: "1",
  });
  const response = await fetch(`${env.url}/rest/v1/customer_addresses?${query}`, {
    headers: { apikey: env.secret, authorization: `Bearer ${env.secret}` },
    cache: "no-store",
  });
  if (!response.ok) return { city: "", addr: "" };
  const rows = (await response.json().catch(() => [])) as { city?: string; street?: string }[];
  return { city: rows[0]?.city || "", addr: rows[0]?.street || "" };
}

export async function findRememberedAccount(phone: string) {
  const key = phoneKey(phone);
  const local = (await readAccountBook()).find((item) => samePhone(item.phone, key)) ?? null;
  const row = await customerByPhone(key);
  if (!row && !local) return null;
  if (!row) return local;
  const address = local?.city || local?.addr ? { city: local.city, addr: local.addr } : await addressFor(row.id);
  return blankAccount(key, {
    name: local?.name || row.name || "",
    email: local?.email || row.email || "",
    age: local?.age || "",
    city: address.city,
    addr: address.addr,
    due: local?.due || "",
  });
}

export function acceptAccount(input: Partial<AccountRecord>) {
  const phone = phoneKey(String(input.phone || ""));
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  if (!isMobilePhone(phone) || name.length < 2 || !EMAIL_RE.test(email)) return null;
  return blankAccount(phone, { ...input, name, email, phone });
}

export async function persistAccount(record: AccountRecord) {
  const book = (await readAccountBook()).filter((item) => !samePhone(item.phone, record.phone));
  book.push(record);
  const env = serviceEnv();
  if (!env || !pulseemReady()) return book;
  const headers = {
    apikey: env.secret,
    authorization: `Bearer ${env.secret}`,
    "content-type": "application/json",
  };
  const existing = await customerByPhone(record.phone);
  let customerId = existing?.id || "";
  if (existing) {
    await fetch(`${env.url}/rest/v1/customers?id=eq.${existing.id}&store_id=eq.${STORE_ID}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name: record.name, email: record.email, phone: record.phone }),
    });
  } else {
    const created = await fetch(`${env.url}/rest/v1/customers`, {
      method: "POST",
      headers: { ...headers, prefer: "return=representation" },
      body: JSON.stringify({ store_id: STORE_ID, name: record.name, email: record.email, phone: record.phone }),
    });
    const rows = (await created.json().catch(() => [])) as { id?: string }[];
    customerId = rows[0]?.id || "";
    if (!created.ok) console.error("Customer was not saved");
  }
  if (customerId && (record.city || record.addr)) {
    const current = await addressFor(customerId);
    if (!current.city && !current.addr) {
      await fetch(`${env.url}/rest/v1/customer_addresses`, {
        method: "POST",
        headers,
        body: JSON.stringify({ store_id: STORE_ID, customer_id: customerId, street: record.addr, city: record.city, zip: "" }),
      });
    }
  }
  return book;
}
