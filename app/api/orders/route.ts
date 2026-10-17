import { NextResponse } from "next/server";
import { loadPublicCatalog } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog-model";

const FREE_FROM = 250;
const SHIPPING = { home: 29, pickup: 19 } as const;
const COUPONS: Record<string, number> = { OLI5: 5 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^05\d{8}$/;

type Method = keyof typeof SHIPPING;

function resolvePrice(products: CatalogProduct[], id: string) {
  const bundle = /^(.+):x(\d+)$/.exec(id);
  const baseId = bundle?.[1] ?? id;
  const bundleQty = bundle ? Number(bundle[2]) : null;
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === baseId);
    if (product.id !== baseId && !variant) continue;
    if (bundleQty) {
      const pack = product.bundles.find((item) => item.qty === bundleQty);
      return pack ? pack.price : null;
    }
    return variant?.price ?? product.price;
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const method = body?.method === "pickup" ? "pickup" : body?.method === "home" ? "home" : null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const street = typeof body?.street === "string" ? body.street.trim() : "";
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!method || !name || !PHONE_RE.test(phone) || !EMAIL_RE.test(email) || !city || (method === "home" && !street)) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const qtyById = new Map<string, number>();
  for (const item of rawItems) {
    const id = typeof item?.id === "string" ? item.id : "";
    const qty = item?.qty;
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ ok: false, error: "items" }, { status: 400 });
    }
    qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
  }
  if (!qtyById.size) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  const catalog = await loadPublicCatalog();
  if (catalog.status !== "ready") return NextResponse.json({ ok: false, error: "catalog" }, { status: 503 });

  let subtotal = 0;
  const lines: { id: string; qty: number; price: number }[] = [];
  for (const [id, qty] of qtyById) {
    const price = resolvePrice(catalog.catalog.products, id);
    if (price == null || price < 0) return NextResponse.json({ ok: false, error: "price" }, { status: 400 });
    subtotal += price * qty;
    lines.push({ id, qty, price });
  }
  subtotal = Math.round(subtotal * 100) / 100;

  const coupon = typeof body?.coupon === "string" ? body.coupon.trim().toUpperCase() : "";
  const percent = coupon ? COUPONS[coupon] ?? 0 : 0;
  if (coupon && !percent) return NextResponse.json({ ok: false, error: "coupon" }, { status: 400 });

  const shipping = subtotal >= FREE_FROM ? 0 : SHIPPING[method as Method];
  const discount = percent ? Math.round(subtotal * percent) / 100 : 0;
  const total = Math.round((subtotal + shipping - discount) * 100) / 100;

  return NextResponse.json({
    ok: true,
    orderId: String(Date.now()),
    subtotal,
    shipping,
    discount,
    total,
    lines,
  });
}
