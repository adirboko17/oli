"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CheckoutDetails, { type CheckoutPayload } from "@/components/CheckoutDetails";
import { useSite } from "@/components/site";
import { readUser, saveOrder, useOliUser } from "@/lib/account-session";
import { FF, fmt } from "@/lib/format";
import { isPickupZone, type ShippingChoice } from "@/lib/shipping";
import { trackPurchase } from "@/lib/storely-actions";

export function CheckoutView({ shippingMethods, currency }: { shippingMethods: ShippingChoice[]; currency: string }) {
  const site = useSite();
  const user = useOliUser();
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [issued, setIssued] = useState<{ code: string; amount: number }[]>([]);

  const items = useMemo(() => site.items.map((item) => ({
    id: item.id,
    name: item.name,
    sub: item.sub,
    price: item.price,
    qty: item.qty,
    image: item.image || "",
  })), [site.items]);

  const profile = useMemo(() => (
    user ? { name: user.name, phone: user.phone, email: user.email, city: user.city, street: user.addr } : null
  ), [user]);

  async function onPay(data: CheckoutPayload) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ id: item.id, qty: item.qty })),
        shippingName: data.shippingName,
        coupon: data.coupon,
        giftCard: data.giftCard,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        street: [
          data.gift ? `מתנה ל${data.gift.name} (${data.gift.phone}, ${data.gift.email})` : "",
          data.street,
          data.apt && `דירה ${data.apt}`,
          data.floor && `קומה ${data.floor}`,
          data.notes,
          data.pregnancyWeek && `שבוע הריון ${data.pregnancyWeek}`,
          data.babyAge && `גיל הבייבי ${data.babyAge}`,
          data.heard && `שמעה עלינו: ${data.heard}${data.heardOther ? ` (${data.heardOther})` : ""}`,
          data.gift?.message && `ברכה: ${data.gift.message}`,
        ].filter(Boolean).join(", "),
        zip: data.zip,
      }),
    });
    const body = await res.json().catch(() => null) as {
      ok?: boolean;
      orderId?: string;
      orderNumber?: string;
      subtotal?: number;
      shipping?: number;
      total?: number;
      lines?: { id: string; qty: number; price: number }[];
      issued?: { code: string; amount: number }[];
      message?: string;
    } | null;
    const number = body?.orderNumber || body?.orderId;
    if (!res.ok || !body?.ok || body.total == null || !number) throw new Error(body?.message || "order");
    if (!body.orderNumber) {
      const recorded = await trackPurchase(body.total);
      if (!recorded) throw new Error("track");
    }
    const account = readUser();
    if (account) {
      const prices = new Map((body.lines ?? []).map((line) => [line.id, line.price]));
      const digitalOrder = items.every((item) => item.id.startsWith("oli-gift:") || item.id.includes(":gift:"));
      const place = digitalOrder
        ? data.shippingName
        : [
            data.shippingName,
            !isPickupZone(data.zone) ? data.street : "",
            data.apt && "דירה " + data.apt,
            data.floor && "קומה " + data.floor,
            data.city,
          ].filter(Boolean).join(", ");
      const addr = data.gift ? ["מתנה · " + data.gift.name, data.gift.email, place].filter(Boolean).join(" · ") : place;
      saveOrder(account.phone, {
        id: number,
        no: number,
        date: new Date().toLocaleDateString("he-IL"),
        status: "new",
        lines: items.map((item) => ({ id: item.id, name: item.name, sub: item.sub, qty: item.qty, price: prices.get(item.id) ?? item.price, image: item.image || null })),
        subtotal: body.subtotal ?? body.total,
        ship: body.shipping ?? 0,
        addr: addr || "הכתובת מהחשבון",
      });
    }
    setPaid(body.total);
    setOrderNumber(number);
    setIssued(body.issued ?? []);
    setDone(true);
    site.clearCart();
  }

  if (done) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(28px,6vw,56px) clamp(16px,4.5vw,32px) 72px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>תשלום</span>
          <h1 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(32px,6vw,48px)", letterSpacing: "-.02em" }}>ההזמנה הושלמה</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#5E4844" }}>קיבלנו את ההזמנה. מספר ההזמנה הוא {orderNumber}. הסכום שנרשם הוא {fmt(paid)}.</p>
          {issued.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 16, lineHeight: 1.5, color: "#3A2826" }}>הקוד של כרטיס המתנה מוכן. אפשר להעתיק אותו ולשלוח למי שמקבלת.</p>
              {issued.map((card) => (
                <div key={card.code} dir="ltr" style={{ display: "flex", justifyContent: "space-between", gap: 16, background: "#FFFFFF", border: "1px solid #E7D5C9", borderRadius: 16, padding: "14px 18px", fontFamily: "ui-monospace, monospace", fontSize: 18 }}>
                  <span>{card.code}</span>
                  <span>{fmt(card.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/" style={{ alignSelf: "flex-start", background: "#3A2826", color: "#FBF5EF", borderRadius: 999, padding: "14px 26px", fontWeight: 600 }}>חזרה לחנות</Link>
        </div>
      </main>
    );
  }

  return (
    <CheckoutDetails
      items={items}
      shippingMethods={shippingMethods}
      currency={currency}
      user={profile}
      onEditCart={site.openCart}
      onLogin={site.openAccount}
      onAddGift={(gift) => site.add({ id: gift.id, name: gift.name, sub: gift.sub, price: gift.price, image: gift.image || null }, gift.qty, true)}
      onPay={onPay}
    />
  );
}
