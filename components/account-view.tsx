"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearUser, formatPhone, readOrders, readReview, saveReview, saveUser, useOliUser, type OliOrder, type OliOrderLine, type OliOrderStatus, type OliReview, type OliUser } from "@/lib/account-session";
import { productImage, type CatalogProduct } from "@/lib/catalog-model";
import { FF, fmt } from "@/lib/format";
import { useSite } from "@/components/site";

const TABS = [
  { id: "orders", label: "ההזמנות שלי" },
  { id: "details", label: "פרטים אישיים" },
  { id: "addr", label: "כתובות" },
] as const;

const TRACK = ["התקבלה", "נארזה ונשלחה", "בדרך אלייך", "נמסרה"];
const STATUS = { new: "התקבלה", progress: "בטיפול", hold: "בהמתנה", sent: "נארזה ונשלחה", transit: "בדרך אלייך", done: "נמסרה" } as const;
const STEP = { new: 0, progress: 0, hold: 0, sent: 1, transit: 2, done: 3 } as const;
const STARS = ["בחרי דירוג", "לא אהבתי", "סביר", "טוב", "טוב מאוד", "מושלם"];

type LiveItem = { title?: string; qty?: number; price?: number; image?: string | null; productId?: string };
type LiveOrder = { number?: number; status?: string; total?: number; title?: string; at?: string; items?: LiveItem[] };

function titleKey(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
}

function imageForTitle(products: CatalogProduct[], title: string) {
  const key = titleKey(title);
  if (!key) return null;
  if (key === "כרטיס מתנה") return "/assets/gift-card.png";
  const product = products.find((item) => titleKey(item.title) === key);
  return product ? productImage(product) : null;
}

function picturedLine(products: CatalogProduct[], line: OliOrderLine): OliOrderLine {
  if (line.image) return line;
  return { ...line, image: imageForTitle(products, line.name) };
}

function productIdFor(products: CatalogProduct[], title: string, given: unknown) {
  if (typeof given === "string" && /^[0-9a-f-]{36}$/i.test(given)) return given;
  const key = titleKey(title);
  return products.find((item) => titleKey(item.title) === key)?.id ?? "";
}

function liveLines(row: LiveOrder, products: CatalogProduct[]): OliOrderLine[] {
  const items = Array.isArray(row.items) ? row.items : [];
  const lines = items.flatMap((item, index) => {
    const name = String(item.title ?? "").trim();
    if (!name) return [];
    const qty = Number(item.qty);
    const price = Number(item.price);
    const image = typeof item.image === "string" && item.image ? item.image : imageForTitle(products, name);
    return [{ id: String(index), name, sub: "", qty: Number.isInteger(qty) && qty > 0 ? qty : 1, price: Number.isFinite(price) ? price : 0, image, productId: productIdFor(products, name, item.productId) }];
  });
  if (lines.length) return lines;
  const name = row.title || "הזמנה";
  return [{ id: "item", name, sub: "", qty: 1, price: Number(row.total) || 0, image: imageForTitle(products, name), productId: productIdFor(products, name, "") }];
}

function accountStatus(value: string | undefined): OliOrderStatus {
  if (value === "progress" || value === "hold" || value === "sent" || value === "transit") return value;
  if (value === "delivered") return "done";
  return "new";
}

async function liveAccountOrders(phone: string, email: string) {
  try {
    const response = await fetch("/api/account/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, email }),
    });
    const body = (await response.json()) as { orders?: LiveOrder[] };
    return Array.isArray(body.orders) ? body.orders : [];
  } catch {
    return [];
  }
}

function mergeAccountOrders(local: OliOrder[], live: LiveOrder[], products: CatalogProduct[]) {
  const byNumber = new Map(live.flatMap((row) => {
    const number = String(row.number ?? "");
    return number ? [[number, row] as const] : [];
  }));
  const seen = new Set<string>();
  const merged = local.map((order) => {
    const row = byNumber.get(order.no) ?? byNumber.get(order.id);
    seen.add(String(row?.number ?? order.no));
    const fromLive = row ? liveLines(row, products) : [];
    const lines: OliOrderLine[] = order.lines.map((line, index) => {
      const pictured = picturedLine(products, line);
      return { ...pictured, productId: pictured.productId || fromLive[index]?.productId || productIdFor(products, pictured.name, "") };
    });
    return row?.status ? { ...order, status: accountStatus(row.status), lines } : { ...order, lines };
  });
  live.forEach((row) => {
    const number = String(row.number ?? "");
    if (!number || seen.has(number)) return;
    const when = row.at ? new Date(row.at) : null;
    merged.push({
      id: number,
      no: number,
      date: when && !Number.isNaN(when.getTime()) ? when.toLocaleDateString("he-IL") : "",
      status: accountStatus(row.status),
      lines: liveLines(row, products),
      subtotal: Number(row.total) || 0,
      ship: 0,
      addr: "",
    });
  });
  return merged.sort((a, b) => Number(b.no) - Number(a.no));
}

export function AccountView() {
  const site = useSite();
  const router = useRouter();
  const user = useOliUser();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [draft, setDraft] = useState<OliUser | null>(null);
  const [orders, setOrders] = useState<OliOrder[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, OliReview | null>>({});
  const [reviewKey, setReviewKey] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addr, setAddr] = useState({ label: "בית", city: "", street: "" });
  const current = draft && user && draft.phone === user.phone ? draft : user;

  useEffect(() => {
    if (!user) return;
    let stop = false;
    const load = async () => {
      const local = readOrders(user.phone);
      const live = await liveAccountOrders(user.phone, user.email);
      const rows = mergeAccountOrders(local, live, site.products);
      if (stop) return;
      setOrders(rows);
      const next: Record<string, OliReview | null> = {};
      rows.forEach((order) => order.lines.forEach((line) => { next[order.id + line.id] = readReview(order.id + line.id); }));
      setReviews(next);
    };
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    window.addEventListener("oli-user", load);
    window.addEventListener("focus", load);
    return () => {
      stop = true;
      window.clearInterval(timer);
      window.removeEventListener("oli-user", load);
      window.removeEventListener("focus", load);
    };
  }, [user, site.products]);

  if (!current) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
        <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 40 }}>האזור האישי</h1>
        <p style={{ fontSize: 16, color: "#5E4844" }}>כדי לראות הזמנות ופרטים, נכנסים עם מספר הנייד.</p>
        <button type="button" onClick={site.openAccount} style={darkBtn}>התחברות</button>
      </main>
    );
  }

  const initial = current.name.trim()[0] || "O";
  const addresses = [{ id: "home", label: "בית", city: current.city, addr: current.addr }, ...(current.addresses ?? [])];
  const reviewing = reviewKey ? orders.flatMap((order) => order.lines.map((line) => ({ order, line }))).find((item) => item.order.id + item.line.id === reviewKey) : null;

  return (
    <main style={{ width: "100%" }}>
      <section style={{ background: "#FBF5F1", borderBottom: "1px solid #F1E5DD" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(28px,5vw,48px) clamp(16px,4.5vw,32px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,3vw,22px)" }}>
            <span style={{ width: "clamp(56px,10vw,76px)", height: "clamp(56px,10vw,76px)", borderRadius: "50%", background: "#F3D9C6", color: "#3A2826", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FF, fontSize: "clamp(24px,4vw,32px)" }}>{initial}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, letterSpacing: ".06em", color: "#A85A3A" }}>האזור האישי</span>
              <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.1 }}>שלום, {current.name}</h1>
              <span style={{ fontSize: 14, color: "#6E5650", direction: "ltr", textAlign: "right" }}>{formatPhone(current.phone)}</span>
            </div>
          </div>
          <button type="button" onClick={() => { clearUser(); router.push("/"); }} style={{ height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid #E1CABD", background: "#FFFFFF", color: "#3A2826", fontSize: 14 }}>התנתקות</button>
        </div>
      </section>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(24px,5vw,48px) clamp(16px,4.5vw,32px) clamp(56px,9vw,96px)", display: "flex", flexDirection: "column", gap: 28 }}>
        {current.isNew && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "22px 26px", borderRadius: 20, background: "#3A2826", color: "#FFFFFF" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <span style={{ fontFamily: FF, fontSize: "clamp(34px,6vw,46px)", color: "#F3D9C6", lineHeight: 1 }}>5%</span>
              <span style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 360 }}>הנחת הצטרפות מחכה לך. היא תופעל אוטומטית בהזמנה הראשונה.</span>
            </div>
            <Link href="/products" style={{ height: 46, padding: "0 22px", borderRadius: 999, background: "#F3D9C6", color: "#3A2826", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>למוצרים</Link>
          </div>
        )}
        <nav style={{ display: "flex", gap: "clamp(20px,4vw,36px)", borderBottom: "1px solid #EFE4DC", overflowX: "auto" }}>
          {TABS.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} style={{ padding: "14px 0", border: 0, borderBottom: "2px solid " + (tab === item.id ? "#3A2826" : "transparent"), background: "transparent", color: "#3A2826", fontSize: 16, fontWeight: tab === item.id ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</button>
          ))}
        </nav>
        {tab === "orders" && !orders.length && (
          <div style={{ padding: "28px 0", display: "flex", flexDirection: "column", gap: 8, color: "#5E4844" }}>
            <span style={{ fontFamily: FF, fontSize: 22, color: "#3A2826" }}>עוד אין הזמנות</span>
            <span style={{ fontSize: 15 }}>כשתזמיני, ההזמנות יופיעו כאן עם מעקב משלוח.</span>
          </div>
        )}
        {tab === "orders" && orders.map((order) => {
          const open = openId === order.id;
          const step = STEP[order.status];
          return (
            <div key={order.id} style={{ border: "1px solid #F1E5DD", borderRadius: 20, background: "#FFFFFF", overflow: "hidden" }}>
              <button type="button" onClick={() => setOpenId(open ? null : order.id)} style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: "14px 24px", alignItems: "center", padding: "clamp(18px,3vw,24px) clamp(18px,3vw,28px)", border: 0, background: "transparent", color: "#3A2826", textAlign: "right" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 17, fontWeight: 600 }}>הזמנה {order.no}</span><span style={{ fontSize: 14, color: "#6E5650" }}>{order.date}</span></span>
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {order.lines.slice(0, 3).map((line) => <OrderThumb key={line.id} image={line.image} width={40} height={48} radius={10} />)}
                  <span style={{ fontSize: 13, color: "#6E5650" }}>{order.lines.length} פריטים</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: order.status === "done" ? "#6E9B6A" : "#D99A4E" }} />{STATUS[order.status]}</span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><span style={{ fontSize: 17, fontWeight: 600 }}>{fmt(order.subtotal + order.ship)}</span><span>{open ? "⌃" : "⌄"}</span></span>
              </button>
              {open && (
                <div style={{ borderTop: "1px solid #F1E5DD", padding: "clamp(18px,3vw,28px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(20px,4vw,40px)" }}>
                  <div>
                    {order.lines.map((line) => {
                      const key = order.id + line.id;
                      const review = reviews[key];
                      return (
                        <div key={line.id} style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr)", gap: 16, padding: "14px 0", borderBottom: "1px solid #F6EEE8" }}>
                          <OrderThumb image={line.image} width={64} height={80} radius={12} />
                          <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ fontSize: 16, fontWeight: 600 }}>{line.name}</span><span style={{ fontSize: 15, fontWeight: 600 }}>{fmt(line.price * line.qty)}</span></span>
                            <span style={{ fontSize: 13, color: "#6E5650" }}>{line.sub} · כמות {line.qty}</span>
                            {order.status === "done" && !review && <button type="button" onClick={() => setReviewKey(key)} style={reviewBtn}>כתיבת ביקורת</button>}
                            {review && (
                              <span style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, padding: "10px 12px", borderRadius: 12, background: "#FBF5F1" }}>
                                <span style={{ fontSize: 14, color: "#C9873E", letterSpacing: 2 }}>{"★".repeat(review.stars)}</span>
                                <span style={{ fontSize: 13, color: "#5E4844", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{review.pending ? "ממתינה לאישור" : review.text}</span>
                                <button type="button" onClick={() => setReviewKey(key)} style={{ marginRight: "auto", background: "transparent", border: 0, fontSize: 12, color: "#A85A3A", textDecoration: "underline" }}>עריכה</button>
                              </span>
                            )}
                            {order.status !== "done" && <span style={{ fontSize: 12, color: "#8A6C64" }}>אפשר לכתוב ביקורת אחרי שההזמנה תגיע</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "#A85A3A" }}>סטטוס משלוח</span>
                      {TRACK.map((label, index) => (
                        <div key={label} style={{ display: "grid", gridTemplateColumns: "14px minmax(0,1fr)", gap: 12 }}>
                          <span style={{ width: 10, height: 10, marginTop: 4, borderRadius: "50%", background: index <= step ? (order.status === "done" ? "#6E9B6A" : "#D99A4E") : "#E6D2C6" }} />
                          <span style={{ fontSize: 14, fontWeight: index === step ? 600 : 400, color: index <= step ? "#3A2826" : "#8A6C64" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, lineHeight: 1.55, color: "#5E4844", padding: 16, borderRadius: 14, background: "#FBF5F1" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "#A85A3A" }}>כתובת למשלוח</span>
                      <span>{order.addr}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#5E4844" }}>
                      <span style={{ display: "flex", justifyContent: "space-between" }}><span>מוצרים</span><span>{fmt(order.subtotal)}</span></span>
                      <span style={{ display: "flex", justifyContent: "space-between" }}><span>משלוח</span><span>{order.subtotal >= 250 ? "חינם" : "בתשלום"}</span></span>
                      <span style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1E5DD", fontSize: 16, fontWeight: 600, color: "#3A2826" }}><span>סה״כ</span><span>{fmt(order.subtotal + order.ship)}</span></span>
                    </div>
                    <button type="button" onClick={() => order.lines.forEach((line) => site.add({ id: line.id, name: line.name, sub: line.sub, price: line.price, image: line.image }, line.qty))} style={{ height: 46, borderRadius: 999, border: "1px solid #CDB5A8", background: "transparent", color: "#3A2826", fontSize: 14, fontWeight: 600 }}>הזמנה חוזרת</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {tab === "details" && (
          <form onSubmit={(e) => { e.preventDefault(); saveUser(current); setDraft(null); }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20, maxWidth: 760 }}>
            <Field label="שם" value={current.name} onChange={(name) => setDraft({ ...current, name })} />
            <label style={lab}>נייד<input value={formatPhone(current.phone)} disabled style={{ ...input, borderColor: "#EFE4DC", color: "#6E5650", background: "#FBF6F2", direction: "ltr", textAlign: "right" }} /></label>
            <Field label="אימייל" value={current.email} onChange={(email) => setDraft({ ...current, email })} ltr />
            <Field label="תאריך לידה משוער" value={current.due} onChange={(due) => setDraft({ ...current, due })} type="date" hint="נתאים לך המלצות לפי שלב ההריון" />
            <button type="submit" style={{ ...darkBtn, justifySelf: "start" }}>שמירה</button>
          </form>
        )}
        {tab === "addr" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 16 }}>
            {addresses.map((item) => (
              <div key={item.id} style={{ padding: 24, border: "1px solid #EFE4DC", borderRadius: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 15, lineHeight: 1.6, color: "#5E4844" }}>
                {item.id === "home" && <span style={{ fontSize: 13, fontWeight: 600, color: "#A85A3A" }}>ברירת מחדל</span>}
                <span style={{ fontSize: 17, fontWeight: 600, color: "#3A2826" }}>{item.label}</span>
                <span>{item.addr || "עדיין אין רחוב"}</span>
                <span>{item.city}</span>
              </div>
            ))}
            {adding ? (
              <form onSubmit={(e) => { e.preventDefault(); if (!addr.city.trim() || !addr.street.trim()) return; saveUser({ ...current, addresses: [...(current.addresses ?? []), { id: String(Date.now()), label: addr.label || "כתובת", city: addr.city, addr: addr.street }] }); setAdding(false); setAddr({ label: "בית", city: "", street: "" }); }} style={{ padding: 24, border: "1.5px dashed #CDB5A8", borderRadius: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="שם הכתובת" style={input} />
                <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="עיר" style={input} />
                <input value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} placeholder="רחוב ומספר" style={input} />
                <button type="submit" style={darkBtn}>שמירה</button>
              </form>
            ) : (
              <button type="button" onClick={() => setAdding(true)} style={{ padding: 24, border: "1.5px dashed #CDB5A8", borderRadius: 18, background: "transparent", color: "#3A2826", fontSize: 15, minHeight: 140 }}> + הוספת כתובת</button>
            )}
          </div>
        )}
      </section>
      {reviewing && (
        <ReviewModal
          name={reviewing.line.name}
          sub={reviewing.line.sub}
          image={reviewing.line.image}
          initial={reviews[reviewKey!] ?? { stars: 0, text: "", photo: null }}
          error={reviewError}
          sending={reviewSending}
          onClose={() => { if (!reviewSending) { setReviewKey(null); setReviewError(""); } }}
          onSave={(review) => {
            const productId = reviewing.line.productId || "";
            const orderNumber = Number(reviewing.order.no);
            if (!user || !productId || !Number.isInteger(orderNumber)) {
              setReviewError("לא מצאנו את המוצר בהזמנה, אז הביקורת לא נשלחה.");
              return;
            }
            setReviewSending(true);
            setReviewError("");
            void fetch("/api/reviews", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ phone: user.phone, email: user.email, orderNumber, productId, stars: review.stars, text: review.text }),
            }).then(async (response) => {
              const result = (await response.json().catch(() => null)) as { ok?: boolean; status?: string; reason?: string } | null;
              if (!result?.ok) {
                setReviewError(result?.reason || "לא הצלחנו לשלוח את הביקורת.");
                return;
              }
              saveReview(reviewKey!, { ...review, pending: result.status === "pending" });
              setReviewKey(null);
            }).catch(() => setReviewError("לא הצלחנו לשלוח את הביקורת.")).finally(() => setReviewSending(false));
          }}
        />
      )}
    </main>
  );
}

function ReviewModal({ name, sub, image, initial, error, sending, onClose, onSave }: { name: string; sub: string; image: string | null; initial: OliReview; error: string; sending: boolean; onClose: () => void; onSave: (review: OliReview) => void }) {
  const [stars, setStars] = useState(initial.stars);
  const [text, setText] = useState(initial.text);
  const [photo, setPhoto] = useState<string | null>(initial.photo);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(42,28,26,.42)", backdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-label="כתיבת ביקורת" style={{ position: "fixed", zIndex: 81, background: "#FFFFFF", color: "#3A2826", width: "min(440px,92vw)", maxHeight: "90vh", overflow: "auto", borderRadius: 28, top: "50%", left: "50%", transform: "translate(-50%,-50%)", boxShadow: "0 30px 80px rgba(42,28,26,.28)" }}>
        <div style={{ position: "relative", background: "#FBF3EE", padding: "28px 24px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <button type="button" onClick={onClose} aria-label="סגירה" style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: 999, border: 0, background: "#FFFFFF" }}>✕</button>
          <OrderThumb image={image} width={76} height={92} radius={16} />
          <span style={{ fontFamily: FF, fontSize: 24, lineHeight: 1.15 }}>{name}</span>
          <span style={{ fontSize: 14, color: "#6E5650" }}>{sub}</span>
        </div>
        <div style={{ padding: "26px clamp(22px,5vw,32px) 26px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: FF, fontSize: 20 }}>איך היה לך?</span>
            <div style={{ display: "flex", gap: 4, direction: "ltr" }}>
              {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setStars(n)} aria-label={n + " כוכבים"} style={{ border: 0, background: "transparent", fontSize: 32, color: n <= stars ? "#C9873E" : "#E6D2C6" }}>★</button>)}
            </div>
            <span style={{ fontSize: 13, color: "#A85A3A", fontWeight: 600, minHeight: 18 }}>{STARS[stars]}</span>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, fontWeight: 600 }}>ספרי לנו עוד
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="מה אהבת? איך המרקם, הריח, התוצאה?" style={{ border: "1.5px solid transparent", borderRadius: 18, padding: "14px 16px", fontSize: 15, lineHeight: 1.6, fontFamily: "inherit", color: "#3A2826", background: "#FBF5F1", resize: "none" }} />
          </label>
          {photo ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, borderRadius: 18, border: "1px solid #F1E5DD" }}>
              <span style={{ width: 64, height: 64, borderRadius: 12, backgroundImage: `url("${photo}")`, backgroundSize: "cover" }} />
              <span style={{ flex: 1, fontSize: 14 }}>התמונה נוספה</span>
              <button type="button" onClick={() => setPhoto(null)} aria-label="הסרת תמונה" style={{ width: 32, height: 32, borderRadius: "50%", border: 0, background: "#FBF5F1" }}>✕</button>
            </div>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, border: "1.5px dashed #E1CABD", cursor: "pointer" }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3D9C6", display: "flex", alignItems: "center", justifyContent: "center" }}>◎</span>
              <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 14, fontWeight: 600 }}>הוספת תמונה</span><span style={{ fontSize: 12, color: "#8A6C64" }}>לא חובה · עוזר לאמהות אחרות</span></span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); }} />
            </label>
          )}
          {stars > 0 && stars < 4 ? <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8A6C64", textAlign: "center" }}>ביקורת מתחת ל-4 כוכבים נשלחת לאישור ולא מתפרסמת בחנות עד שמאשרים אותה.</span> : null}
          {error ? <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8E1F0B", textAlign: "center" }}>{error}</span> : null}
          <button type="button" disabled={!stars || sending} onClick={() => onSave({ stars, text, photo })} style={{ height: 54, border: 0, borderRadius: 999, background: stars && !sending ? "#3A2826" : "#E6D2C6", color: "#FFFFFF", fontSize: 16, fontWeight: 600 }}>{sending ? "שולחת…" : stars > 0 && stars < 4 ? "שליחה לאישור" : "פרסום הביקורת"}</button>
        </div>
      </div>
    </>
  );
}

function OrderThumb({ image, width, height, radius }: { image: string | null; width: number; height: number; radius: number }) {
  return (
    <span style={{ width, height, borderRadius: radius, background: "#F6EEE8", overflow: "hidden", display: "inline-flex", flexShrink: 0 }}>
      {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "darken" }} /> : null}
    </span>
  );
}

function Field({ label, value, onChange, ltr, type, hint }: { label: string; value: string; onChange: (v: string) => void; ltr?: boolean; type?: string; hint?: string }) {
  return (
    <label style={lab}>{label}
      <input value={value} type={type || "text"} onChange={(e) => onChange(e.target.value)} style={{ ...input, ...(ltr ? { direction: "ltr" as const, textAlign: "right" as const } : null) }} />
      {hint && <span style={{ fontSize: 13, fontWeight: 400, color: "#6E5650" }}>{hint}</span>}
    </label>
  );
}

const lab = { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600 } as const;
const input = { height: 52, border: "1px solid #CDB5A8", borderRadius: 14, padding: "0 16px", fontSize: 16, fontFamily: "inherit", color: "#3A2826", outline: "none", width: "100%" } as const;
const darkBtn = { height: 52, padding: "0 32px", borderRadius: 999, border: 0, background: "#3A2826", color: "#FFFFFF", fontSize: 15, fontWeight: 600 } as const;
const reviewBtn = { alignSelf: "flex-start", marginTop: 4, height: 36, padding: "0 16px", borderRadius: 999, border: "1px solid #3A2826", background: "transparent", color: "#3A2826", fontSize: 13, fontWeight: 600 } as const;
