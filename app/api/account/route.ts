import { NextResponse } from "next/server";
import { acceptAccount, persistAccount, verifiedPhone, writeAccountBook } from "@/lib/site-accounts";
import { phoneKey } from "@/lib/phone";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const record = acceptAccount({
    name: String(body?.name ?? ""),
    phone: String(body?.phone ?? ""),
    email: String(body?.email ?? ""),
    age: String(body?.age ?? ""),
    city: String(body?.city ?? ""),
    addr: String(body?.addr ?? ""),
    due: String(body?.due ?? ""),
  });
  if (!record) return NextResponse.json({ ok: false, message: "חסרים פרטים" }, { status: 400 });
  const allowed = await verifiedPhone();
  if (allowed !== phoneKey(record.phone)) {
    return NextResponse.json({ ok: false, message: "צריך לאמת את המספר לפני יצירת חשבון" }, { status: 401 });
  }
  const book = await persistAccount(record);
  const response = NextResponse.json({ ok: true, user: { ...record, isNew: false } });
  writeAccountBook(response, book);
  return response;
}
