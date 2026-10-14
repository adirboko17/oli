"use client";

import Link from "next/link";
import { useState } from "react";
import { FF, fmt } from "@/lib/format";
import { trackPurchase } from "@/lib/storely-actions";
import { useSite } from "@/components/site";

export function CheckoutView() {
  const site = useSite();
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(0);
  const [pending, setPending] = useState(false);
  const total = site.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function complete() {
    if (pending || total <= 0) return;
    setPending(true);
    const recorded = await trackPurchase(total);
    if (!recorded) {
      setPending(false);
      return;
    }
    setPaid(total);
    site.clearCart();
    setDone(true);
    setPending(false);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(28px,6vw,56px) clamp(16px,4.5vw,32px) 72px", display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 13, letterSpacing: ".14em", color: "#A85A3A", fontWeight: 600 }}>תשלום</span>
        <h1 style={{ fontFamily: FF, fontWeight: 500, fontSize: "clamp(32px,6vw,48px)", letterSpacing: "-.02em" }}>{done ? "ההזמנה הושלמה" : "השלמת הזמנה"}</h1>
      </div>
      {done ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#5E4844" }}>קיבלנו את ההזמנה. הסכום שנרשם הוא {fmt(paid)}.</p>
          <Link href="/" style={{ alignSelf: "flex-start", background: "#3A2826", color: "#FBF5EF", borderRadius: 999, padding: "14px 26px", fontWeight: 600 }}>חזרה לחנות</Link>
        </div>
      ) : !site.items.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#5E4844" }}>הסל ריק, אז אין עדיין מה לשלם.</p>
          <Link href="/products" style={{ alignSelf: "flex-start", background: "#3A2826", color: "#FBF5EF", borderRadius: 999, padding: "14px 26px", fontWeight: 600 }}>למוצרים</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, background: "#FFFFFF", border: "1px solid #EADBCF", borderRadius: 24, padding: "8px 22px 22px" }}>
          {site.items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: "1px solid #EADBCF" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 18 }}>{item.name}</span>
                <span style={{ fontSize: 13, color: "#6E5650" }}>{item.qty} × {fmt(item.price)}</span>
              </div>
              <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ color: "#5E4844" }}>סכום לתשלום</span>
            <span style={{ fontFamily: FF, fontWeight: 500, fontSize: 28 }}>{fmt(total)}</span>
          </div>
          <button type="button" onClick={complete} disabled={pending} style={{ background: "#3A2826", color: "#FBF5EF", border: 0, height: 54, borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: "pointer", opacity: pending ? 0.7 : 1 }}>
            {pending ? "שולחים את ההזמנה" : "השלמת הזמנה"}
          </button>
        </div>
      )}
    </main>
  );
}
