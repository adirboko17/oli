"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";
import { useSite } from "@/components/site";
import {
  blockOnDevice,
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
const POPUP_MOTION_CSS = `
@keyframes storely-rise-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes storely-rise-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(12px); } }
@keyframes storely-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes storely-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes storely-scale-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes storely-scale-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: scale(.98); } }
@keyframes storely-slide-in { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes storely-slide-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(22px); } }
@keyframes storely-bloom-in { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes storely-bloom-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(8px) scale(.98); } }
@media (prefers-reduced-motion: reduce) { [data-popup-move] { animation: none !important; } }
`;

function motionAnimation(motion: "rise" | "fade" | "scale" | "slide" | "bloom" | "none", phase: "in" | "out") {
  if (motion === "none") return undefined;
  const time = phase === "in" ? ".56s cubic-bezier(.22,1,.36,1)" : ".42s cubic-bezier(.4,0,.2,1)";
  return `storely-${motion}-${phase} ${time} both`;
}

function subscribeNarrow(listener: () => void) {
  const media = window.matchMedia("(max-width: 760px)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getNarrow() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function closeButtonStyle(design: { closeSize: number; closePlace: PopupDesign["closePlace"]; closeColor: string }): CSSProperties {
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
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const visible = useRef(false);
  const leaving = useRef(false);
  const closeTimer = useRef(0);
  const [present, setPresent] = useState<"in" | "out">("in");
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, () => false);

  useEffect(() => {
    window.clearTimeout(closeTimer.current);
    leaving.current = false;
    visible.current = false;
    setPresent("in");
    setShown(null);
    setDone(false);
    setCoupon("");
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
      leaving.current = false;
      setPresent("in");
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
    if (!shown || leaving.current) return;
    rememberPopup(shown);
    visible.current = true;
    const motion = popupLook(shown.design, narrow ? "mobile" : "desktop").motion;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motion === "none" || reduceMotion) {
      setShown(null);
      return;
    }
    leaving.current = true;
    setPresent("out");
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      leaving.current = false;
      setPresent("in");
      setShown(null);
    }, 440);
  }

  if (!shown) return null;
  const active = shown;
  const design = active.design;
  const device = narrow ? "mobile" : "desktop";
  const look = popupLook(design, device);
  const blocks = design.blocks.map((block) => blockOnDevice(block, device));
  const lead = blocks[0];
  const leadBleed = (lead?.type === "image" && lead.bleed) || (lead?.type === "row" && lead.columns.some((column, columnIndex) => {
    const child = column.blocks[0];
    const across = look.stackColumns || lead.columns.length < 2;
    return (across || columnIndex === 0 || columnIndex === lead.columns.length - 1) && child?.type === "image" && child.bleed;
  }));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasRow = design.blocks.some((block) => block.type === "row");
  const split = !hasRow && look.media !== "none" && !look.stackMedia && look.layout !== "bar";
  const card: CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: look.stackMedia ? "column" : "row",
    width: look.layout === "bar" ? "100%" : `min(${look.width}px, calc(100vw - 32px))`,
    height: look.height > 0 ? look.height : undefined,
    background: look.background,
    borderRadius: look.layout === "bar" ? `${look.radius}px ${look.radius}px 0 0` : look.radius,
    boxShadow: "0 24px 70px rgba(20,16,14,.28)",
    color: "#1a1a1a",
    animation: reduce || look.motion === "none" ? undefined : motionAnimation(look.motion, present),
    maxHeight: "min(86dvh, 760px)",
    overflow: "hidden",
  };
  const place: CSSProperties = look.layout === "bar"
    ? { position: "fixed", right: 0, bottom: 0, left: 0, zIndex: 80 }
    : look.layout === "corner"
      ? { position: "fixed", bottom: 18, left: 18, zIndex: 80 }
      : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 80 };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};
    const fieldsBlocks = design.blocks.flatMap((block) => block.type === "row" ? block.columns.flatMap((column) => column.blocks) : [block]);
    for (const block of fieldsBlocks) {
      if (block.type !== "field") continue;
      if (block.fieldType === "checkbox") {
        const checked = data.get(block.name) === "yes";
        if (block.required && !checked) {
          setError("יש לסמן את השדות החובה");
          return;
        }
        if (checked) fields[block.name] = "yes";
        continue;
      }
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
      const payload = await response.json().catch(() => null) as { ok?: boolean; reason?: string; coupon?: string } | null;
      if (!response.ok || payload?.ok !== true) {
        setError(payload?.reason || "לא הצלחנו לשלוח");
        setSending(false);
        return;
      }
      rememberPopup(active);
      setCoupon(typeof payload.coupon === "string" ? payload.coupon : "");
      setDone(true);
    } catch {
      setError("לא הצלחנו לשלוח");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{POPUP_MOTION_CSS}</style>
      {look.layout === "modal" ? (
        <button type="button" aria-label="סגירה" data-popup-move onClick={() => { if (design.closeOnOverlay) close(); }} style={{ position: "fixed", inset: 0, zIndex: 80, border: 0, background: `rgba(20,16,14,${look.overlay / 100})`, animation: reduce || look.motion === "none" ? undefined : motionAnimation("fade", present) }} />
      ) : null}
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} style={place}>
        <div data-popup-move style={card}>
          {look.backgroundImage ? <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url("${look.backgroundImage}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: (100 - look.imageFade) / 100, pointerEvents: "none" }} /> : null}
          {look.backgroundImage && look.imageWash ? <span aria-hidden style={{ position: "absolute", inset: 0, background: look.imageWash, opacity: look.imageWashOpacity / 100, pointerEvents: "none" }} /> : null}
          <button type="button" aria-label="סגירה" onClick={close} style={{ ...closeButtonStyle(look), zIndex: 2 }}>×</button>
          {!hasRow && look.media !== "none" && (look.media === "right" || look.stackMedia) ? look.mediaImage ? <img src={look.mediaImage} alt="" style={{ width: split ? "42%" : "100%", flex: split ? "0 0 42%" : "none", height: split ? "auto" : 160, minHeight: split ? 220 : 160, objectFit: "cover" }} /> : <div style={{ width: split ? "42%" : "100%", flex: split ? "0 0 42%" : "none", minHeight: split ? 220 : 120, display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>אזור</div> : null}
          {done ? (
            <div style={{ flex: 1, textAlign: "center", padding: look.padding }}>
              <b id={titleId} style={{ display: "block", fontSize: 26 }}>{design.successTitle}</b>
              <p style={{ margin: "10px 0 0", lineHeight: 1.5 }}>{design.successText}</p>
              {coupon ? <p style={{ margin: "16px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "0.06em" }}>{coupon}</p> : null}
            </div>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0, minHeight: 0, overflow: look.height > 0 ? "auto" : undefined, padding: look.padding, display: "grid", gridTemplateColumns: "1fr 1fr", gap: look.gap, alignContent: leadBleed ? "start" : "center" }}>
              {blocks.map((block, index) => block.type === "row" ? (
                <div key={block.id} style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: columnGrid(block.columns, look.stackColumns), gap: look.gap, alignItems: "stretch" }}>
                  {block.columns.map((column, columnIndex) => {
                    const across = look.stackColumns || block.columns.length < 2;
                    const edges = { start: across || columnIndex === 0, end: across || columnIndex === block.columns.length - 1 };
                    const poster = !across && column.blocks[0]?.type === "image" && column.blocks[0].bleed && (columnIndex === 0 || columnIndex === block.columns.length - 1);
                    const photo = poster && column.blocks[0]?.type === "image" ? column.blocks[0] : null;
                    return (
                      <div key={column.id} style={{ position: "relative", alignSelf: "stretch", minHeight: photo ? Math.max(photo.frame, 1) : undefined }}>
                        {column.blocks.map((child, childIndex) => (
                          <div key={child.id} style={poster && childIndex > 0 ? { position: "relative", zIndex: 2 } : undefined}>
                            <BlockView block={child} busy={sending} titleId={index === 0 && childIndex === 0 ? titleId : undefined} pad={look.padding} flushTop={index === 0 && childIndex === 0} edges={edges} fill={poster && childIndex === 0} surface={design.background} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div key={block.id} style={{ gridColumn: !look.stackColumns && block.span === "half" ? "span 1" : "1 / -1" }}>
                  <BlockView block={block} busy={sending} titleId={index === 0 ? titleId : undefined} pad={look.padding} flushTop={index === 0} surface={design.background} />
                </div>
              ))}
              {error ? <p style={{ gridColumn: "1 / -1", margin: 0, color: "#8a1f11", fontSize: 13 }}>{error}</p> : null}
            </form>
          )}
          {!hasRow && look.media === "left" && !look.stackMedia ? look.mediaImage ? <img src={look.mediaImage} alt="" style={{ width: "42%", flex: "0 0 42%", minHeight: 220, objectFit: "cover" }} /> : <div style={{ width: "42%", flex: "0 0 42%", minHeight: 220, display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>אזור</div> : null}
        </div>
      </div>
    </>
  );
}

function richCopy(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    part.startsWith("**") && part.endsWith("**") && part.length > 4
      ? <strong key={index} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      : part
  ));
}

function textFontStack(font: "inherit" | "heebo" | "frank") {
  if (font === "heebo") return '"Heebo","Assistant",sans-serif';
  if (font === "frank") return '"Frank Ruhl Libre","Times New Roman",serif';
  return undefined;
}

function textWeightValue(weight: "regular" | "medium" | "semibold" | "bold") {
  if (weight === "bold") return 700;
  if (weight === "semibold") return 600;
  if (weight === "medium") return 500;
  return 400;
}

function ImageVeil({ fade, fadeSide, edges, surface }: { fade: number; fadeSide: number; edges?: { start: boolean; end: boolean }; surface: string }) {
  const alongEnd = !(edges && edges.end && !edges.start);
  return (
    <>
      {fade > 0 ? <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${fade}%`, background: `linear-gradient(to top, ${surface}, transparent)`, pointerEvents: "none" }} /> : null}
      {fadeSide > 0 ? <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, width: `${fadeSide}%`, insetInlineStart: alongEnd ? undefined : 0, insetInlineEnd: alongEnd ? 0 : undefined, background: alongEnd ? `linear-gradient(to inline-start, ${surface}, transparent)` : `linear-gradient(to inline-end, ${surface}, transparent)`, pointerEvents: "none" }} /> : null}
    </>
  );
}

function BlockView({ block, titleId, pad = 0, flushTop = false, edges, fill = false, surface = "#ffffff", busy = false }: { block: Exclude<PopupBlock, { type: "row" }>; titleId?: string; pad?: number; flushTop?: boolean; edges?: { start: boolean; end: boolean }; fill?: boolean; surface?: string; busy?: boolean }) {
  const align = block.type === "heading" || block.type === "text" ? block.align : "right";
  if (block.type === "heading") return <div id={titleId} style={{ color: block.color, fontFamily: textFontStack(block.font), fontSize: block.size, fontWeight: textWeightValue(block.weight), textAlign: align, lineHeight: 1.25, whiteSpace: "pre-wrap" }}>{richCopy(block.text)}</div>;
  if (block.type === "text") return <div id={titleId} style={{ color: block.color, fontFamily: textFontStack(block.font), fontSize: block.size, fontWeight: textWeightValue(block.weight), textAlign: align, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{richCopy(block.text)}</div>;
  if (block.type === "image" && block.src) {
    const fit = block.fit === "contain" ? "contain" : "cover";
    const bleed = block.bleed && pad > 0;
    const pullStart = bleed && (edges ? edges.start : true);
    const pullEnd = bleed && (edges ? edges.end : true);
    const pull = (pullStart ? pad : 0) + (pullEnd ? pad : 0);
    const frame = fit === "cover" && block.frame > 0 ? block.frame : 0;
    const fade = block.fade > 0 ? block.fade : 0;
    const fadeSide = block.fadeSide > 0 ? block.fadeSide : 0;
    const radius = bleed || fade > 0 || fadeSide > 0 ? 0 : block.radius;
    const veil = <ImageVeil fade={fade} fadeSide={fadeSide} edges={edges} surface={surface} />;
    if (fill) {
      return (
        <div style={{ position: "absolute", top: flushTop ? -pad : 0, bottom: -pad, insetInlineStart: pullStart ? -pad : 0, insetInlineEnd: pullEnd ? -pad : 0, overflow: "hidden" }}>
          <img src={block.src} alt={block.alt} style={{ display: "block", width: "100%", height: "100%", objectFit: fit, objectPosition: block.focus }} />
          {veil}
        </div>
      );
    }
    return (
      <div style={{ position: "relative", width: pull ? `calc(100% + ${pull}px)` : `${block.width}%`, maxWidth: pull ? "none" : "100%", marginInline: pull ? undefined : "auto", marginInlineStart: pullStart ? -pad : undefined, marginInlineEnd: pullEnd ? -pad : undefined, marginTop: bleed && flushTop ? -pad : undefined, height: frame || undefined, overflow: radius || fade || fadeSide ? "hidden" : undefined, borderRadius: radius || undefined }}>
        <img src={block.src} alt={block.alt} style={{ display: "block", width: "100%", height: frame ? "100%" : "auto", maxHeight: frame ? undefined : fit === "cover" ? 420 : undefined, objectFit: fit, objectPosition: block.focus }} />
        {veil}
      </div>
    );
  }
  if (block.type === "logo" && block.src) return <div style={{ width: "100%", textAlign: block.align }}><img src={block.src} alt="" style={{ display: "inline-block", width: block.width, maxWidth: "100%", height: "auto", objectFit: "contain" }} /></div>;
  if (block.type === "button") {
    const buttonStyle = { display: "grid", width: "100%", height: 44, placeItems: "center", background: block.background, color: block.color, borderRadius: block.radius, fontWeight: 700, textDecoration: "none", border: 0, cursor: "pointer", font: "inherit" } as const;
    if (block.action === "submit") return <button type="submit" id={titleId} disabled={busy} style={buttonStyle}>{busy ? "שולחים…" : block.label}</button>;
    if (block.href) return <a id={titleId} href={block.href} style={buttonStyle}>{block.label}</a>;
    return <span style={buttonStyle}>{block.label}</span>;
  }
  if (block.type === "field") {
    const common = { name: block.name, required: block.required, placeholder: block.placeholder, style: { width: "100%", boxSizing: "border-box" as const, border: "1px solid rgba(0,0,0,.14)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,.86)", font: "inherit" } };
    if (block.fieldType === "checkbox") {
      return (
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.45, cursor: "pointer" }}>
          <input type="checkbox" name={block.name} value="yes" required={block.required} style={{ width: 18, height: 18, marginTop: 1, accentColor: "#1a1a1a" }} />
          <span>{block.label || "אני מאשר/ת"}{block.required ? " *" : ""}</span>
        </label>
      );
    }
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
