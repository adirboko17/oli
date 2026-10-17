"use client";
/**
 * Oli Safe Care: 5% discount side tab + popup.
 * Exact recreation of the design in "Oli Safe Care v2.dc.html".
 * Requires PromoFivePercent.css (import it here or in globals).
 *
 * Usage (e.g. in components/shell.tsx):
 *   <PromoFivePercent
 *     hidden={isLoggedIn || cartOpen || menuOpen}
 *     code="OLI5"
 *     onSubmitEmail={async (email) => { await fetch('/api/newsletter', {method:'POST', body: JSON.stringify({email})}) }}
 *     onShop={() => router.push('/category/all')}
 *   />
 */
import { useEffect, useState } from "react";
import "./PromoFivePercent.css";

type Props = {
  hidden?: boolean;
  code?: string;
  imageSrc?: string;
  onSubmitEmail?: (email: string) => void | Promise<void>;
  onShop?: () => void;
  delayMs?: number; // how long until the tab enters (default 6 seconds)
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PromoFivePercent({
  hidden = false,
  code = "OLI5",
  imageSrc = "https://static.wixstatic.com/media/db159b_023efbddb9054a1695b0af97979b8d28f000.jpg",
  onSubmitEmail,
  onShop,
  delayMs = 6000,
}: Props) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [shown, setShown] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const ok = EMAIL_RE.test(email);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShown(false);
      const t = window.setTimeout(() => setPresent(false), 520);
      return () => window.clearTimeout(t);
    }
    setPresent(true);
  }, [open]);

  useEffect(() => {
    if (!present || !open) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [present, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = async () => {
    if (!ok) return;
    await onSubmitEmail?.(email);
    setDone(true);
  };
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
  };

  return (
    <>
      {tabVisible && !open && !hidden && (
        <div className={"oliPromo-tabWrap" + (entered ? " is-in" : "")} dir="rtl" aria-hidden={!entered}>
          <button className="oliPromo-tab" onClick={() => setOpen(true)} aria-label="5% הנחה להזמנה הראשונה">
            <span className="oliPromo-tabIcon">
              <svg className="oliPromo-tabSvg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
                <path d="M2.5 9h19v-3h-19z" />
                <path d="M12 6v14.5" />
                <path d="M12 6c-1.6-3.2-5.2-3-5.2-.8C6.8 6 9 6 12 6zM12 6c1.6-3.2 5.2-3 5.2-.8C17.2 6 15 6 12 6z" />
              </svg>
            </span>
            <span className="oliPromo-tabPct">5%</span>
            <span className="oliPromo-tabLbl">הנחה</span>
          </button>
          <button className="oliPromo-tabHide" onClick={() => setTabVisible(false)} aria-label="הסתרה">✕</button>
        </div>
      )}

      {present ? (
        <div className={"oliPromo-backdrop" + (shown ? " is-open" : "")} onClick={() => setOpen(false)} />
      ) : null}

      {present ? (
      <div className={"oliPromo-panel" + (shown ? " is-open" : "")} dir="rtl" role="dialog" aria-modal={shown} aria-hidden={!shown} inert={!shown} aria-label="5% הנחה">
        <button className="oliPromo-close" onClick={() => setOpen(false)} aria-label="סגירה">✕</button>
        <div className="oliPromo-grid">
          {/* mobile header */}
          <div className="oliPromo-mHead">
            <div className="oliPromo-handle"><span /></div>
            <div className="oliPromo-mHeadInner">
              <span className="oliPromo-eyebrow">מתנת הצטרפות</span>
              <span className="oliPromo-mPct">5%</span>
              <span className="oliPromo-mTitle">הנחה על ההזמנה הראשונה</span>
              <span className="oliPromo-mSub">השאירי מייל ונשלח לך את הקוד</span>
            </div>
          </div>
          {/* desktop image */}
          <div className="oliPromo-media">
            <img src={imageSrc} alt="" />
            <div className="oliPromo-mediaShade" />
            <div className="oliPromo-mediaText">
              <span className="oliPromo-mediaPct">5%</span>
              <span className="oliPromo-mediaLbl">על ההזמנה הראשונה</span>
            </div>
          </div>
          {/* form / result */}
          <div className="oliPromo-body">
            {!done ? (
              <div className="oliPromo-stack">
                <div className="oliPromo-dHead">
                  <span className="oliPromo-eyebrow">מתנת הצטרפות</span>
                  <span className="oliPromo-title">הצטרפי לקהילת Oli וקבלי 5% הנחה</span>
                  <span className="oliPromo-text">נשלח לך את הקוד למייל, ואיתו מדי פעם טיפים לטיפוח בהריון ואחרי לידה.</span>
                </div>
                <div className="oliPromo-field">
                  <input
                    className="oliPromo-input"
                    type="email"
                    placeholder="כתובת המייל שלך"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  />
                  <button className="oliPromo-cta" disabled={!ok} onClick={submit}>שלחו לי את הקוד</button>
                </div>
                <button className="oliPromo-no" onClick={() => setOpen(false)}>לא תודה</button>
              </div>
            ) : (
              <div className="oliPromo-stack">
                <div className="oliPromo-dHead is-always">
                  <span className="oliPromo-eyebrow">ברוכה הבאה</span>
                  <span className="oliPromo-title">הקוד שלך מוכן</span>
                  <span className="oliPromo-text">שלחנו אותו גם למייל. מזינים אותו בקופה.</span>
                </div>
                <button className="oliPromo-code" onClick={copy}>
                  <span className="oliPromo-codeVal">{code}</span>
                  <span className="oliPromo-codeCopy">{copied ? "הועתק ✓" : "העתקה"}</span>
                </button>
                <button className="oliPromo-shop" onClick={() => { setOpen(false); setTabVisible(false); onShop?.(); }}>למוצרים</button>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}
