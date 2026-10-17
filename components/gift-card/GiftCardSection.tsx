"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { giftAmountsFromTags, openGiftMax, productHref, productImage } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { useSite } from "@/components/site";
import "./GiftCard.css";

const PRESETS = [150, 250, 400, 600] as const;
const MIN = 50;
const MAX = 2500;

const WAVE = [
  ["M-20 40 C 240 -30, 480 110, 720 40 S 1200 -30, 1460 40", "0.90"],
  ["M-20 66 C 240 -4, 480 136, 720 66 S 1200 -4, 1460 66", "0.82"],
  ["M-20 92 C 240 22, 480 162, 720 92 S 1200 22, 1460 92", "0.74"],
  ["M-20 118 C 240 48, 480 188, 720 118 S 1200 48, 1460 118", "0.66"],
  ["M-20 144 C 240 74, 480 214, 720 144 S 1200 74, 1460 144", "0.58"],
  ["M-20 170 C 240 100, 480 240, 720 170 S 1200 100, 1460 170", "0.50"],
  ["M-20 196 C 240 126, 480 266, 720 196 S 1200 126, 1460 196", "0.42"],
  ["M-20 222 C 240 152, 480 292, 720 222 S 1200 152, 1460 222", "0.34"],
] as const;

function Waves({ edge }: { edge: "top" | "bottom" }) {
  return (
    <svg className={`oli-gc__waves oli-gc__waves--${edge}`} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
      {WAVE.map(([d, opacity]) => <path key={d} d={d} opacity={opacity} />)}
    </svg>
  );
}

export default function GiftCardSection() {
  const { products, add } = useSite();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preset, setPreset] = useState<number | "custom">(250);
  const [custom, setCustom] = useState("");

  const giftProduct = useMemo(
    () => products.find((product) => giftAmountsFromTags(product.tags).length > 0 || openGiftMax(product.tags) != null) ?? null,
    [products],
  );
  const presets: number[] = giftProduct ? giftAmountsFromTags(giftProduct.tags) : [...PRESETS];
  const allowCustom = giftProduct ? openGiftMax(giftProduct.tags) != null : true;
  const min = giftProduct ? 1 : MIN;
  const max = MAX;
  const presetKey = presets.join(",");

  useEffect(() => {
    setPreset((current) => {
      if (current === "custom" && allowCustom) return current;
      if (typeof current === "number" && presets.includes(current)) return current;
      return presets.includes(250) ? 250 : presets[0] ?? "custom";
    });
  }, [presetKey, allowCustom]);

  const customOpen = allowCustom && preset === "custom";
  const typed = parseInt(custom, 10);
  const customValid = typed >= min && typed <= max;
  const amount = preset === "custom" ? (customOpen && customValid ? typed : null) : presets.includes(preset) ? preset : null;
  const customError = customOpen && custom.length > 0 && !customValid;
  const hint = !customError
    ? `בין ₪${min.toLocaleString("en-US")} ל־₪${max.toLocaleString("en-US")}`
    : typed > max
      ? `הסכום המקסימלי הוא ₪${max.toLocaleString("en-US")}`
      : `הסכום המינימלי הוא ₪${min}`;

  function choose(next: number | "custom") {
    setPreset(next);
    if (next === "custom") requestAnimationFrame(() => inputRef.current?.focus());
  }

  function buy() {
    if (amount == null) return;
    if (giftProduct) {
      router.push(`${productHref(giftProduct)}?amount=${amount}`);
      return;
    }
    add({
      id: `oli-gift:${amount}`,
      name: "כרטיס מתנה",
      sub: `כרטיס מתנה · ${fmt(amount)}`,
      price: amount,
      image: "/assets/gift-card.png",
    });
  }

  return (
    <section className="oli-gc" id="gift-card" dir="rtl" aria-labelledby="oli-gc-title">
      <Waves edge="top" />
      <Waves edge="bottom" />
      <div className="oli-gc__inner">
        <span className="oli-gc__eyebrow">כרטיס מתנה</span>
        <h2 className="oli-gc__title" id="oli-gc-title">תנו לה לבחור</h2>
        <p className="oli-gc__text">כרטיס מתנה דיגיטלי לאישה בהריון, ליולדת הטרייה או לתינוק החדש. היא בוחרת את המוצרים שמתאימים לה.</p>
        <div className="oli-gc__card">
          <img src={(giftProduct && productImage(giftProduct)) || "/assets/gift-card.png"} alt="כרטיס מתנה Oli Safe Care" />
        </div>
        <div className="oli-gc__buy">
          <div className="oli-gc__amounts" role="group" aria-label="בחירת סכום">
            {presets.map((value) => (
              <button key={value} type="button" className="oli-gc__amount" aria-pressed={preset === value} onClick={() => choose(value)}>₪{value}</button>
            ))}
            {allowCustom ? <button type="button" className="oli-gc__amount" aria-pressed={customOpen} onClick={() => choose("custom")}>סכום אחר</button> : null}
          </div>
          <div className={customOpen ? "oli-gc__custom is-open" : "oli-gc__custom"}>
            <label className="oli-gc__field">
              <span>₪</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="0"
                aria-label="סכום מותאם אישית"
                value={custom}
                onChange={(event) => setCustom(event.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </label>
            <span className={customError ? "oli-gc__hint is-error" : "oli-gc__hint"} aria-live="polite">{hint}</span>
          </div>
          <button type="button" className="oli-gc__cta" disabled={amount == null} onClick={buy}>
            {amount != null ? `לרכישת כרטיס מתנה · ₪${amount.toLocaleString("en-US")}` : "לרכישת כרטיס מתנה"}
          </button>
        </div>
        <ol className="oli-gc__steps">
          <li><b>01</b>בוחרים סכום</li>
          <li><b>02</b>כותבים ברכה אישית</li>
          <li><b>03</b>היא מקבלת במייל או ב־SMS</li>
        </ol>
      </div>
    </section>
  );
}
