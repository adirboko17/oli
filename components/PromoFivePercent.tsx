"use client";
/**
 * 5% side tab. Opening it shows the quiz from promo-quiz-handoff.
 */
import { useEffect, useState } from "react";
import { findCatalogProduct, productBlurb, productHref, productImage } from "@/lib/catalog-model";
import { fmt } from "@/lib/format";
import { useSite } from "./site";
import { usePromoGate } from "./promo/promo-gate";
import PromoQuiz, { type QuizLead } from "./promo/PromoQuiz";
import "./PromoFivePercent.css";

type Props = {
  hidden?: boolean;
  imageSrc?: string;
  onShop?: () => void;
  delayMs?: number;
};

const ALIAS: Record<string, string> = { babyafter: "bottle" };

export default function PromoFivePercent({ hidden = false, imageSrc, onShop, delayMs = 6000 }: Props) {
  const site = useSite();
  const { quizOpen, openQuiz, closeQuiz, markFinished } = usePromoGate();
  const [entered, setEntered] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (hidden) closeQuiz();
  }, [hidden, closeQuiz]);

  const submit = async (lead: QuizLead) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || typeof data?.code !== "string") throw new Error("lead");
    markFinished();
    return { code: data.code };
  };

  return (
    <>
      {tabVisible && !quizOpen && !hidden && (
        <div className={"oliPromo-tabWrap" + (entered ? " is-in" : "")} dir="rtl" aria-hidden={!entered}>
          <button className="oliPromo-tab" onClick={openQuiz} aria-label="5% הנחה להזמנה הראשונה">
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

      <PromoQuiz
        open={quizOpen && !hidden}
        onClose={closeQuiz}
        onSubmit={submit}
        image={imageSrc}
        getProduct={(id) => {
          const product = findCatalogProduct(site.products, ALIAS[id] || id);
          if (!product) return undefined;
          return {
            id: product.id,
            name: product.title,
            sub: productBlurb(product),
            priceLabel: fmt(product.price),
            image: productImage(product) || "",
            href: productHref(product),
          };
        }}
        onAddToCart={(id) => {
          const product = findCatalogProduct(site.products, id);
          if (!product) return;
          site.add({ id: product.id, name: product.title, sub: productBlurb(product), price: product.price, image: productImage(product) });
        }}
        onShop={() => { closeQuiz(); onShop?.(); }}
      />
    </>
  );
}
