import { NextResponse } from "next/server";
import { findRememberedAccount, markPhoneVerified } from "@/lib/site-accounts";
import { isMobilePhone, phoneKey } from "@/lib/phone";
import { pulseemReady } from "@/lib/pulseem";
import { clearTicket, readTicket, ticketAccepts, writeTicket } from "@/lib/otp-ticket";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: unknown; code?: unknown } | null;
  const phone = phoneKey(String(body?.phone ?? ""));
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (!isMobilePhone(phone) || code.length !== 6) {
    return NextResponse.json({ ok: false, message: "הקוד לא תואם" }, { status: 400 });
  }

  if (pulseemReady()) {
    const ticket = await readTicket();
    const verdict = ticket ? ticketAccepts(ticket, phone, code) : "expired";
    if (verdict !== "ok") {
      const response = NextResponse.json({ ok: false, message: verdict === "expired" ? "הקוד פג. שלחי קוד חדש." : "הקוד לא תואם. נסי שוב." }, { status: 401 });
      if (ticket && verdict === "wrong") writeTicket(response, { ...ticket, tries: ticket.tries + 1 });
      else clearTicket(response);
      return response;
    }
  }

  const account = await findRememberedAccount(phone);
  const response = NextResponse.json({
    ok: true,
    user: account ? { ...account, isNew: false } : null,
  });
  markPhoneVerified(response, phone);
  if (pulseemReady()) clearTicket(response);
  return response;
}
