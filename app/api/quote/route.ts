import { NextResponse } from "next/server";
import { checkoutGiftLine, storefrontLines } from "@/lib/checkout-lines";
import { loadPublicCatalog } from "@/lib/catalog";
import { loadShopShipping, quoteCheckout } from "@/lib/storely-shop";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const shippingName = typeof body?.shippingName === "string" ? body.shippingName.trim() : "";
  const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const giftCode = typeof body?.giftCode === "string" ? body.giftCode.trim() : "";
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!shippingName) return NextResponse.json({ ok: false, message: "בחרי אפשרות משלוח" }, { status: 400 });

  const items: { id: string; qty: number }[] = [];
  for (const item of rawItems) {
    const id = typeof item?.id === "string" ? item.id : "";
    const qty = item?.qty;
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ ok: false, message: "הסל לא זמין לחישוב" }, { status: 400 });
    }
    items.push({ id, qty });
  }
  if (!items.length) return NextResponse.json({ ok: false, message: "הסל ריק" }, { status: 400 });

  const shop = await loadShopShipping(request.headers.get("host"));
  if (!shop.methods.some((method) => method.name === shippingName)) {
    return NextResponse.json({ ok: false, message: "אפשרות המשלוח לא זמינה" }, { status: 400 });
  }

  const catalog = await loadPublicCatalog();
  if (catalog.status !== "ready") {
    return NextResponse.json({ ok: false, message: "לא הצלחנו לחשב את הסכום לתשלום" }, { status: 503 });
  }
  const lines = storefrontLines(catalog.catalog.products, items);
  if (!lines.ok) return NextResponse.json({ ok: false, message: "המוצר לא זמין להזמנה" }, { status: 400 });

  const quoted = await quoteCheckout({
    hostHeader: request.headers.get("host"),
    shippingName,
    lines: lines.lines,
    code,
    customerEmail,
    giftCode,
  });
  if (!quoted.ok) return NextResponse.json({ ok: false, message: quoted.reason }, { status: 400 });
  const addedGift = quoted.addedGift
    ? checkoutGiftLine(catalog.catalog.products, quoted.addedGift.variantId, quoted.addedGift.quantity, quoted.addedGift.title)
    : null;
  return NextResponse.json({
    ok: true,
    total: quoted.total,
    discount: quoted.discount,
    discountCode: quoted.discountCode,
    shipping: quoted.shipping,
    currency: quoted.currency || shop.currency,
    bundleBlocked: quoted.bundleBlocked,
    addedGift,
  });
}
