"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";
import { useSite } from "@/components/site";
import {
  columnGrid,
  popupAlreadySeen,
  popupInWindow,
  popupMatchesDevice,
  popupMatchesPage,
  popupLook,
  rememberPopup,
  safeHref,
  type PopupBlock,
  type PopupDesign,
  type StorefrontPopup,
} from "@/lib/store-popups";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function subscribeNarrow(listener: () => void) {
  const media = window.matchMedia("(max-width: 760px)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getNarrow() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function closeButtonStyle(design: PopupDesign): CSSProperties {
  const edge = 8;
  const box = design.closeSize + 10;
  const corner = design.closePlace === "top-right"
    ? { top: edge, right: edge }
    : design.closePlace === "bottom-left"
      ? { bottom: edge, left: edge }
      : design.closePlace === "bottom-right"
        ? { bottom: edge, right: edge }
        : { top: edge, left: edge };
  return {
    position: "absolute",
    width: box,
    height: box,
    border: 0,
    borderRadius: 999,
    background: "transparent",
    color: design.closeColor,
    fontSize: design.closeSize,
    lineHeight: 1,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
    ...corner,
  };
}

export function StorePopups({ popups }: { popups: StorefrontPopup[] }) {
  const pathname = usePathname();
  const site = useSite();
  const blocked = site.menu || site.search || site.account || site.cartOpen;
  const [shown, setShown] = useState<StorefrontPopup | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const visible = useRef(false);
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, () => false);

  useEffect(() => {
    visible.current = false;
    setShown(null);
    setDone(false);
    setError("");
  }, [pathname]);

  useEffect(() => {
    if (blocked || visible.current) return;
    const width = window.innerWidth;
    const chosen = popups.find((popup) => popupMatchesPage(popup, pathname) && popupMatchesDevice(popup, width) && popupInWindow(popup) && !popupAlreadySeen(popup));
    if (!chosen) return;
    let timer = 0;
    let remove = () => {};
    const reveal = () => {
      if (visible.current) return;
      visible.current = true;
      setShown(chosen);
    };
    const delayMs = Math.max(chosen.delaySeconds, chosen.trigger === "immediate" ? 0 : 4) * 1000;
    if (chosen.trigger === "immediate") reveal();
    else if (chosen.trigger === "delay") timer = window.setTimeout(reveal, chosen.delaySeconds * 1000);
    else if (chosen.trigger === "scroll") {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max < 200) timer = window.setTimeout(reveal, delayMs);
      else {
        const onScroll = () => {
          const height = document.documentElement.scrollHeight - window.innerHeight;
          const percent = height <= 0 ? 0 : (window.scrollY / height) * 100;
          if (percent >= chosen.scrollPercent) reveal();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        remove = () => window.removeEventListener("scroll", onScroll);
      }
    } else {
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      timer = window.setTimeout(reveal, (chosen.delaySeconds || 8) * 1000);
      if (!mobile) {
        const onOut = (event: MouseEvent) => {
          if (event.clientY <= 8 && (!event.relatedTarget || event.relatedTarget === null)) reveal();
        };
        document.addEventListener("mouseout", onOut);
        const dropScroll = remove;
        remove = () => {
          dropScroll();
          document.removeEventListener("mouseout", onOut);
        };
      }
    }
    return () => {
      window.clearTimeout(timer);
      remove();
    };
  }, [blocked, pathname, popups]);

  useEffect(() => {
    const layout = shown ? popupLook(shown.design, narrow ? "mobile" : "desktop").layout : "bar";
    if (!shown || layout !== "modal") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [shown, narrow]);

  useEffect(() => {
    if (!shown) return;
    dialog.current?.querySelector<HTMLElement>("button, input, textarea, a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shown]);

  function close() {
    if (shown) rememberPopup(shown);
    visible.current = true;
    setShown(null);
  }

  if (!shown) return null;
  const active = shown;
  const design = active.design;
  const look = popupLook(design, narrow ? "mobile" : "desktop");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFields = design.blocks.some((block) => block.type === "field" || (block.type === "row" && block.columns.some((column) => column.blocks.some((item) => item.type === "field"))));
  const hasRow = design.blocks.some((block) => block.type === "row");
  const split = !hasRow && look.media !== "none" && !look.stackMedia && look.layout !== "bar";
  const card: CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: look.stackMedia ? "column" : "row",
    width: look.layout === "bar" ? "100%" : `min(${look.width}px, calc(100vw - 32px))`,
    background: design.background,
    backgroundImage: design.backgroundImage ? `url("${design.backgroundImage}")` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: look.layout === "bar" ? `${look.radius}px ${look.radius}px 0 0` : look.radius,
    boxShadow: "0 24px 70px rgba(20,16,14,.28)",
    color: "#1a1a1a",
    maxHeight: "min(86dvh, 760px)",
    overflow: "auto",
  };
  const place: CSSProperties = look.layout === "bar"
    ? { position: "fixed", right: 0, bottom: 0, left: 0, zIndex: 80 }
    : look.layout === "corner"
      ? { position: "fixed", bottom: 18, left: 18, zIndex: 80 }
      : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 80 };
  if (!reduce && look.layout === "modal") place.animation = "storelyPopupIn .35s ease";
  else if (!reduce) place.animation = "storelyPopupUp .35s ease";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};
    const fieldsBlocks = design.blocks.flatMap((block) => block.type === "row" ? block.columns.flatMap((column) => column.blocks) : [block]);
    for (const block of fieldsBlocks) {
      if (block.type !== "field") continue;
      const value = String(data.get(block.name) ?? "").trim();
      if (block.required && !value) {
        setError("מלאו את השדות החובה");
        return;
      }
      if (block.fieldType === "email" && value && !EMAIL.test(value)) {
        setError("האימייל לא תקין");
        return;
      }
      if (value) fields[block.name] = value;
    }
    if (!Object.keys(fields).length) {
      setError("מלאו את השדות");
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/popup-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ popupId: active.id, fields, path: pathname }),
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean; reason?: string } | null;
      if (!response.ok || payload?.ok !== true) {
        setError(payload?.reason || "לא הצלחנו לשלוח");
        setSending(false);
        return;
      }
      rememberPopup(active);
      setDone(true);
    } catch {
      setError("לא הצלחנו לשלוח");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`@keyframes storelyPopupIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } } @keyframes storelyPopupUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }`}</style>
      {look.layout === "modal" ? (
        <button type="button" aria-label="סגירה" onClick={() => { if (design.closeOnOverlay) close(); }} style={{ position: "fixed", inset: 0, zIndex: 80, border: 0, background: `rgba(20,16,14,${design.overlay / 100})` }} />
      ) : null}
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} style={place}>
        <div style={card}>
          <button type="button" aria-label="סגירה" onClick={close} style={{ ...closeButtonStyle(design), zIndex: 2 }}>×</button>
          {!hasRow && look.media !== "none" && (look.media === "right" || look.stackMedia) ? look.mediaImage ? <img src={look.mediaImage} alt="" style={{ width: split ? "42%" : "100%", flex: split ? "0 0 42%" : "none", height: split ? "auto" : 160, minHeight: split ? 220 : 160, objectFit: "cover" }} /> : <div style={{ width: split ? "42%" : "100%", flex: split ? "0 0 42%" : "none", minHeight: split ? 220 : 120, display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>אזור</div> : null}
          {done ? (
            <div style={{ flex: 1, textAlign: "center", padding: look.padding }}>
              <b id={titleId} style={{ display: "block", fontSize: 26 }}>{design.successTitle}</b>
              <p style={{ margin: "10px 0 0", lineHeight: 1.5 }}>{design.successText}</p>
            </div>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} style={{ flex: 1, minWidth: 0, padding: look.padding, display: "grid", gridTemplateColumns: "1fr 1fr", gap: look.gap, alignContent: "center" }}>
              {design.blocks.map((block, index) => block.type === "row" ? (
                <div key={block.id} style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: columnGrid(block.columns, look.stackColumns), gap: look.gap }}>
                  {block.columns.map((column) => (
                    <div key={column.id}>
                      {column.blocks.map((child, childIndex) => <BlockView key={child.id} block={child} titleId={index === 0 && childIndex === 0 ? titleId : undefined} />)}
                    </div>
                  ))}
                </div>
              ) : (
                <div key={block.id} style={{ gridColumn: !look.stackColumns && block.span === "half" ? "span 1" : "1 / -1" }}>
                  <BlockView block={block} titleId={index === 0 ? titleId : undefined} />
                </div>
              ))}
              {hasFields ? <button type="submit" disabled={sending} style={{ gridColumn: "1 / -1", height: 44, border: 0, borderRadius: 999, background: design.submitBackground, color: design.submitColor, fontWeight: 700, cursor: "pointer" }}>{sending ? "שולחים…" : design.submitLabel}</button> : null}
              {error ? <p style={{ gridColumn: "1 / -1", margin: 0, color: "#8a1f11", fontSize: 13 }}>{error}</p> : null}
            </form>
          )}
          {!hasRow && look.media === "left" && !look.stackMedia ? look.mediaImage ? <img src={look.mediaImage} alt="" style={{ width: "42%", flex: "0 0 42%", minHeight: 220, objectFit: "cover" }} /> : <div style={{ width: "42%", flex: "0 0 42%", minHeight: 220, display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>אזור</div> : null}
        </div>
      </div>
    </>
  );
}

function BlockView({ block, titleId }: { block: Exclude<PopupBlock, { type: "row" }>; titleId?: string }) {
  const align = block.type === "heading" || block.type === "text" ? block.align : "right";
  if (block.type === "heading") return <div id={titleId} style={{ color: block.color, fontSize: block.size, fontWeight: block.weight === "bold" ? 700 : 500, textAlign: align, lineHeight: 1.25, whiteSpace: "pre-wrap" }}>{block.text}</div>;
  if (block.type === "text") return <div id={titleId} style={{ color: block.color, fontSize: block.size, textAlign: align, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{block.text}</div>;
  if (block.type === "image" && block.src) return <img src={block.src} alt={block.alt} style={{ display: "block", width: `${block.width}%`, maxWidth: "100%", maxHeight: 240, objectFit: "cover", borderRadius: block.radius, margin: "0 auto" }} />;
  if (block.type === "logo" && block.src) return <img src={block.src} alt="" style={{ display: "block", width: block.width, maxWidth: "100%", height: "auto", margin: "0 auto", objectFit: "contain" }} />;
  if (block.type === "button" && block.href) return <a id={titleId} href={block.href} style={{ display: "grid", height: 44, placeItems: "center", background: block.background, color: block.color, borderRadius: block.radius, fontWeight: 700, textDecoration: "none" }}>{block.label}</a>;
  if (block.type === "field") {
    const common = { name: block.name, required: block.required, placeholder: block.placeholder, style: { width: "100%", boxSizing: "border-box" as const, border: "1px solid rgba(0,0,0,.14)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,.86)", font: "inherit" } };
    return (
      <label style={{ display: "block" }}>
        {block.label ? <span style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{block.label}</span> : null}
        {block.fieldType === "textarea" ? <textarea {...common} rows={3} /> : <input {...common} type={block.fieldType === "tel" ? "tel" : block.fieldType === "email" ? "email" : "text"} />}
      </label>
    );
  }
  if (block.type === "spacer") return <div style={{ height: block.height }} />;
  return null;
}
