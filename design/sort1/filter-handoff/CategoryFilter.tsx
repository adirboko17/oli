"use client";
/**
 * Oli Safe Care: filter and sort (filter button + side drawer / bottom sheet).
 * Exact recreation of the design in "Oli Safe Care v2.dc.html".
 * Requires CategoryFilter.css.
 *
 * Controlled component: the page holds the state and the filtering logic.
 *
 * <CategoryFilter
 *   categories={[{ key:'all', label:'כל המוצרים', count:18 }, { key:'preg', label:'הריון', count:7 }, ...]}
 *   category={cat} onCategoryChange={setCat}
 *   sort={sort} onSortChange={setSort}
 *   resultCount={filteredProducts.length}
 * />
 */
import { useEffect, useState } from "react";
import "./CategoryFilter.css";

export type SortKey = "rec" | "low" | "high";
type Cat = { key: string; label: string; count: number };

type Props = {
  categories: Cat[];
  category: string;
  onCategoryChange: (key: string) => void;
  sort: SortKey;
  onSortChange: (key: SortKey) => void;
  resultCount: number;
  allKey?: string;
};

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rec", label: "מומלצים" },
  { key: "low", label: "מחיר: מהנמוך לגבוה" },
  { key: "high", label: "מחיר: מהגבוה לנמוך" },
];

function Radio({ on }: { on: boolean }) {
  return (
    <span className={"oliF-radio" + (on ? " is-on" : "")}>
      <span className="oliF-radioDot" />
    </span>
  );
}

export default function CategoryFilter({
  categories, category, onCategoryChange, sort, onSortChange, resultCount, allKey = "all",
}: Props) {
  const [open, setOpen] = useState(false);
  const activeN = (category !== allKey ? 1 : 0) + (sort !== "rec" ? 1 : 0);
  const activeCat = categories.find((c) => c.key === category);
  const countLabel = `${resultCount} מוצרים`;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <div className="oliF-bar" dir="rtl">
        <div className="oliF-barStart">
          <button className="oliF-btn" onClick={() => setOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
            </svg>
            סינון ומיון
            {activeN > 0 && <span className="oliF-badge">{activeN}</span>}
          </button>
          {category !== allKey && activeCat && (
            <button className="oliF-chip" onClick={() => onCategoryChange(allKey)}>
              {activeCat.label}<span className="oliF-chipX">✕</span>
            </button>
          )}
        </div>
        <span className="oliF-count">{countLabel}</span>
      </div>

      <div className={"oliF-backdrop" + (open ? " is-open" : "")} onClick={() => setOpen(false)} />

      <aside className={"oliF-panel" + (open ? " is-open" : "")} dir="rtl" aria-label="סינון ומיון" aria-hidden={!open}>
        <div className="oliF-handle"><span /></div>
        <div className="oliF-head">
          <span className="oliF-title">סינון ומיון</span>
          <button className="oliF-close" onClick={() => setOpen(false)} aria-label="סגירה">✕</button>
        </div>
        <div className="oliF-scroll">
          <div className="oliF-group">
            <span className="oliF-groupLbl">קטגוריה</span>
            {categories.map((c) => (
              <button key={c.key} className="oliF-opt" onClick={() => onCategoryChange(c.key)}>
                <span className="oliF-optMain"><Radio on={category === c.key} />{c.label}</span>
                <span className="oliF-optCount">{c.count}</span>
              </button>
            ))}
          </div>
          <div className="oliF-group">
            <span className="oliF-groupLbl">מיון לפי</span>
            {SORTS.map((o) => (
              <button key={o.key} className="oliF-opt" onClick={() => onSortChange(o.key)}>
                <span className="oliF-optMain"><Radio on={sort === o.key} />{o.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="oliF-foot">
          <button className="oliF-reset" onClick={() => { onCategoryChange(allKey); onSortChange("rec"); }}>ניקוי</button>
          <button className="oliF-apply" onClick={() => setOpen(false)}>הצגת {countLabel}</button>
        </div>
      </aside>
    </>
  );
}
