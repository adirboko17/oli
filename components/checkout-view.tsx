"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CheckoutDetails, { type CheckoutPayload } from "@/components/CheckoutDetails";
import { useSite } from "@/components/site";
import { readUser, saveOrder, useOliUser } from "@/lib/account-session";
import { FF, fmt } from "@/lib/format";
import { trackPurchase } from "@/lib/storely-actions";

export function CheckoutView() {
  const site = useSite();
  const user = useOliUser();
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(0);

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

  async function validateCoupon(code: string) {
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return { ok: false as const };
    const data = await res.json().catch(() => null) as { ok?: boolean; percent?: number } | null;
    return data?.ok && data.percent ? { ok: true as const, percent: data.percent } : { ok: false as const };
  }

  async function onPay(data: CheckoutPayload) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ id: item.id, qty: item.qty })),
        method: data.method,
        coupon: data.coupon,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        street: data.street,
      }),
    });
    const body = await res.json().catch(() => null) as {
      ok?: boolean;
      orderId?: string;
      subtotal?: number;
      shipping?: number;
      total?: number;
      lines?: { id: string; qty: number; price: number }[];
    } | null;
    if (!res.ok || !body?.ok || body.total == null || !body.orderId) throw new Error("order");
    const recorded = await trackPurchase(body.total);
    if (!recorded) throw new Error("track");
    const account = readUser();
    if (account) {
      const prices = new Map((body.lines ?? []).map((line) => [line.id, line.price]));
      const place = data.method === "pickup"
        ? ["נקודת איסוף", data.city].filter(Boolean).join(", ")
        : [data.street, data.apt && "דירה " + data.apt, data.floor && "קומה " + data.floor, data.city].filter(Boolean).join(", ");
      const addr = data.gift ? ["מתנה · " + data.gift.name, place].filter(Boolean).join(" · ") : place;
      saveOrder(account.phone, {
        id: body.orderId,
        no: body.orderId.slice(-6),
        date: new Date().toLocaleDateString("he-IL"),
        status: "new",
        lines: items.map((item) => ({ id: item.id, name: item.name, sub: item.sub, qty: item.qty, price: prices.get(item.id) ?? item.price, image: item.image || null })),
        subtotal: body.subtotal ?? body.total,
        ship: body.shipping ?? 0,
        addr: addr || "הכתובת מהחשבון",
      });
    }
    setPaid(body.total);
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
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#5E4844" }}>קיבלנו את ההזמנה. הסכום שנרשם הוא {fmt(paid)}.</p>
          <Link href="/" style={{ alignSelf: "flex-start", background: "#3A2826", color: "#FBF5EF", borderRadius: 999, padding: "14px 26px", fontWeight: 600 }}>חזרה לחנות</Link>
        </div>
      </main>
    );
  }

  return (
    <CheckoutDetails
      items={items}
      user={profile}
      onEditCart={site.openCart}
      onLogin={site.openAccount}
      onPay={onPay}
      validateCoupon={validateCoupon}
    />
  );
}
