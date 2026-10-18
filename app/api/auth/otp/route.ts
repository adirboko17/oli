import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { isMobilePhone, phoneKey } from "@/lib/phone";
import { issueTicket, writeTicket } from "@/lib/otp-ticket";
import { pulseemReady, sendPulseemSms } from "@/lib/pulseem";

const sends = new Map<string, number[]>();

function allowSend(phone: string) {
  const now = Date.now();
  const recent = (sends.get(phone) ?? []).filter((at) => now - at < 10 * 60 * 1000);
  if (recent.length >= 5) return false;
  recent.push(now);
  sends.set(phone, recent);
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: unknown } | null;
  const phone = phoneKey(String(body?.phone ?? ""));
  if (!isMobilePhone(phone)) {
    return NextResponse.json({ ok: false, message: "המספר לא תקין" }, { status: 400 });
  }
  if (!allowSend(phone)) {
    return NextResponse.json({ ok: false, message: "יותר מדי בקשות. נסי שוב בעוד כמה דקות." }, { status: 429 });
  }
  if (!pulseemReady()) {
    return NextResponse.json({ ok: true, demo: true });
  }
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const failure = await sendPulseemSms(phone, `קוד הכניסה ל-Oli: ${code}`);
  if (failure) {
    return NextResponse.json({ ok: false, message: failure }, { status: 502 });
  }
  const response = NextResponse.json({ ok: true, demo: false });
  writeTicket(response, issueTicket(phone, code));
  return response;
}
