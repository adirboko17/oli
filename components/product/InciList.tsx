"use client";

import { useState, type CSSProperties } from "react";
import "./InciList.css";

export type InciItem = {
  inci: string;
  he: string;
  key?: boolean;
};

export default function InciList({ items }: { items: InciItem[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!items?.length) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(items.map((item) => item.inci).join(", "));
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="oinci" dir="rtl">
      <div className="oinci__box">
        <button className="oinci__toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="oinci-panel">
          <span className="oinci__label">
            <span className="oinci__title">{open ? "הסתרת רשימת הרכיבים" : "להצגת רשימת רכיבים מלאה"}</span>
            <span className="oinci__count">{items.length} רכיבים · INCI</span>
          </span>
          <span className={`oinci__plus${open ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span>
        </button>

        <div id="oinci-panel" className={`oinci__wrap${open ? " is-open" : ""}`}>
          <div className="oinci__clip">
            <div className="oinci__body">
              <ol className="oinci__grid">
                {items.map((item, index) => (
                  <li key={`${item.inci}-${index}`} className="oinci__row" style={{ "--d": `${0.12 + index * 0.05}s` } as CSSProperties}>
                    <span className="oinci__n">{String(index + 1).padStart(2, "0")}</span>
                    <span className="oinci__text">
                      <span className="oinci__name">{item.inci}</span>
                      <span className="oinci__he">{item.he}{item.key ? <span className="oinci__key">· רכיב מפתח</span> : null}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="oinci__foot">
                <span>לפי סדר הכמות במוצר, כפי שמופיע על האריזה.</span>
                <button type="button" onClick={copy} className="oinci__copy">{copied ? "הועתק" : "העתקת הרשימה"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
