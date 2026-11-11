import { NextResponse } from "next/server";
import { checkoutGiftLine, isGiftLine, resolvePrice, storefrontLines } from "@/lib/checkout-lines";
import { loadPublicCatalog } from "@/lib/catalog";
import { lookupGiftCard } from "@/lib/gift-cards";
import { moneyRound, oliminiBundleOffer, totalAfterOliminiBundle } from "@/lib/olimini-kits";
import { loadShopShipping, quoteCheckout } from "@/lib/storely-shop";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const shippingName = typeof body?.shippingName === "string" ? body.shippingName.trim() : "";
  const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const giftCode = typeof body?.giftCode === "string" ? body.giftCode.trim() : "";
  const rawItems = Array.isArray(body?.items) ? body.items : [];

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

  const catalog = await loadPublicCatalog();
  if (catalog.status !== "ready") {
    return NextResponse.json({ ok: false, message: "לא הצלחנו לחשב את הסכום לתשלום" }, { status: 503 });
  }
  const digital = items.every((item) => isGiftLine(item.id));
  const shop = await loadShopShipping(request.headers.get("host"));
  if (digital) {
    if (code) return NextResponse.json({ ok: false, message: "קוד ההנחה לא חל על כרטיס מתנה" }, { status: 400 });
    let merchandise = 0;
    for (const item of items) {
      const price = resolvePrice(catalog.catalog.products, item.id);
      if (price == null || price < 0) return NextResponse.json({ ok: false, message: "המוצר לא זמין להזמנה" }, { status: 400 });
      merchandise += price * item.qty;
    }
    merchandise = moneyRound(merchandise);
    let discount = 0;
    if (giftCode) {
      const card = await lookupGiftCard(giftCode);
      if (!card.ok || !card.balance) {
        return NextResponse.json({ ok: false, message: card.ok ? "היתרה בכרטיס נוצלה" : card.reason }, { status: 400 });
      }
      discount = Math.min(card.balance, merchandise);
    }
    return NextResponse.json({
      ok: true,
      total: moneyRound(merchandise - discount),
      discount,
      discountCode: discount > 0 ? "כרטיס מתנה" : "",
      shipping: 0,
      currency: shop.currency,
      bundleBlocked: false,
      addedGift: null,
      saleLocked: false,
      saleCustom: 0,
    });
  }
  if (!shippingName || !shop.methods.some((method) => method.name === shippingName)) {
    return NextResponse.json({ ok: false, message: shippingName ? "אפשרות המשלוח לא זמינה" : "בחרי אפשרות משלוח" }, { status: 400 });
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
  const merchandise = moneyRound(items.reduce((sum, item) => sum + (resolvePrice(catalog.catalog.products, item.id) ?? 0) * item.qty, 0));
  const bundle = oliminiBundleOffer(catalog.catalog.products, catalog.catalog.collections, items);
  const waived = totalAfterOliminiBundle({
    merchandise,
    shipping: quoted.shipping,
    total: quoted.total,
    savings: bundle.amount,
    saleLocked: quoted.saleLocked,
  });
  const addedGift = quoted.addedGift
    ? checkoutGiftLine(catalog.catalog.products, quoted.addedGift.variantId, quoted.addedGift.quantity, quoted.addedGift.title)
    : null;
  return NextResponse.json({
    ok: true,
    total: waived.total,
    discount: moneyRound(quoted.discount + bundle.amount),
    discountCode: quoted.discountCode || bundle.label,
    shipping: waived.shipping,
    currency: quoted.currency || shop.currency,
    bundleBlocked: quoted.bundleBlocked,
    addedGift,
    saleLocked: quoted.saleLocked,
    saleCustom: quoted.saleCustom,
  });
}
