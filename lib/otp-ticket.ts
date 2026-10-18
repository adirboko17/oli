import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { phoneKey } from "@/lib/phone";
import { cookieBase, readSigned, signValue } from "@/lib/signed-cookie";

const OTP = "oli_otp";

export type OtpTicket = { phone: string; codeHash: string; exp: number; tries: number };

function hashCode(phone: string, code: string) {
  const key = process.env.OTP_SECRET || process.env.PULSEEM_PASSWORD || "oli-otp";
  return createHmac("sha256", key).update(`${phone}:${code}`).digest("hex");
}

function codesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function issueTicket(phone: string, code: string): OtpTicket {
  const key = phoneKey(phone);
  return { phone: key, codeHash: hashCode(key, code), exp: Date.now() + 5 * 60 * 1000, tries: 0 };
}

export function writeTicket(response: NextResponse, ticket: OtpTicket) {
  response.cookies.set(OTP, signValue(JSON.stringify(ticket)), { ...cookieBase, maxAge: 5 * 60 });
}

export function clearTicket(response: NextResponse) {
  response.cookies.set(OTP, "", { ...cookieBase, maxAge: 0 });
}

export async function readTicket() {
  const jar = await cookies();
  const raw = readSigned(jar.get(OTP)?.value);
  if (!raw) return null;
  try {
    const ticket = JSON.parse(raw) as OtpTicket;
    if (!ticket?.phone || !ticket.codeHash || !ticket.exp) return null;
    return ticket;
  } catch {
    return null;
  }
}

export function ticketAccepts(ticket: OtpTicket, phone: string, code: string) {
  if (ticket.exp < Date.now() || ticket.tries >= 5) return "expired" as const;
  if (ticket.phone !== phoneKey(phone)) return "mismatch" as const;
  if (!codesMatch(ticket.codeHash, hashCode(ticket.phone, code))) return "wrong" as const;
  return "ok" as const;
}
