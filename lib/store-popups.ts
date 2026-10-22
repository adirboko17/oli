export type PopupAlign = "right" | "center" | "left";
export type PopupLayout = "modal" | "bar" | "corner";
export type PopupTrigger = "immediate" | "delay" | "scroll" | "exit";
export type PopupFrequency = "always" | "session" | "day" | "once";
export type PopupDevice = "all" | "desktop" | "mobile";

export type PopupBlock =
  | { id: string; type: "heading"; text: string; color: string; size: number; align: PopupAlign; weight: "regular" | "bold" }
  | { id: string; type: "text"; text: string; color: string; size: number; align: PopupAlign }
  | { id: string; type: "image"; src: string; alt: string; radius: number }
  | { id: string; type: "logo"; src: string; width: number }
  | { id: string; type: "button"; label: string; href: string; background: string; color: string; radius: number }
  | { id: string; type: "field"; fieldType: "text" | "email" | "tel" | "textarea"; label: string; name: string; placeholder: string; required: boolean }
  | { id: string; type: "spacer"; height: number };

export type PopupDesign = {
  layout: PopupLayout;
  width: number;
  radius: number;
  padding: number;
  background: string;
  backgroundImage: string;
  overlay: number;
  closeOnOverlay: boolean;
  closeColor: string;
  submitLabel: string;
  submitBackground: string;
  submitColor: string;
  successTitle: string;
  successText: string;
  blocks: PopupBlock[];
};

export type PopupPages = {
  all: boolean;
  home: boolean;
  product: boolean;
  catalog: boolean;
  checkout: boolean;
  content: boolean;
  paths: string[];
};

export type StorefrontPopup = {
  id: string;
  design: PopupDesign;
  pages: PopupPages;
  trigger: PopupTrigger;
  delaySeconds: number;
  scrollPercent: number;
  frequency: PopupFrequency;
  device: PopupDevice;
  startsAt: string | null;
  endsAt: string | null;
};

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function hex(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function num(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : NaN;
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : "";
}

export function safeImage(value: string) {
  return /^https:\/\/[^\s"'()<>]+$/i.test(value) ? value : "";
}

export function safeHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^https:\/\/[^\s"'()<>]+$/i.test(value)) return value;
  if (/^mailto:[^\s]+$/i.test(value)) return value;
  if (/^tel:\+?[0-9-]{6,20}$/i.test(value)) return value;
  return "";
}

function parseBlock(value: unknown, index: number): PopupBlock | null {
  const row = record(value);
  if (!row) return null;
  const id = text(row.id, 80) || `block-${index}`;
  const align: PopupAlign = row.align === "center" || row.align === "left" ? row.align : "right";
  if (row.type === "heading") {
    return { id, type: "heading", text: text(row.text, 160), color: hex(row.color, "#1a1a1a"), size: num(row.size, 16, 48, 28), align, weight: row.weight === "regular" ? "regular" : "bold" };
  }
  if (row.type === "text") return { id, type: "text", text: text(row.text, 800), color: hex(row.color, "#4a4a4a"), size: num(row.size, 12, 24, 15), align };
  if (row.type === "image") return { id, type: "image", src: safeImage(text(row.src, 500)), alt: text(row.alt, 120), radius: num(row.radius, 0, 28, 12) };
  if (row.type === "logo") return { id, type: "logo", src: safeImage(text(row.src, 500)), width: num(row.width, 48, 220, 112) };
  if (row.type === "button") {
    return {
      id,
      type: "button",
      label: text(row.label, 40) || "לחצו כאן",
      href: safeHref(text(row.href, 300)),
      background: hex(row.background, "#1a1a1a"),
      color: hex(row.color, "#ffffff"),
      radius: row.radius === 999 ? 999 : num(row.radius, 0, 28, 12),
    };
  }
  if (row.type === "field") {
    const fieldType = row.fieldType === "email" || row.fieldType === "tel" || row.fieldType === "textarea" ? row.fieldType : "text";
    const name = text(row.name, 32).toLowerCase();
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(name)) return null;
    return { id, type: "field", fieldType, label: text(row.label, 60), name, placeholder: text(row.placeholder, 80), required: row.required !== false };
  }
  if (row.type === "spacer") return { id, type: "spacer", height: num(row.height, 4, 80, 16) };
  return null;
}

export function parseShopPopups(value: unknown): StorefrontPopup[] {
  if (!Array.isArray(value)) return [];
  const popups: StorefrontPopup[] = [];
  for (const item of value) {
    const row = record(item);
    const design = record(row?.design);
    const targeting = record(row?.targeting);
    const pages = record(targeting?.pages);
    const id = typeof row?.id === "string" ? row.id : "";
    if (!row || !design || !targeting || !/^[0-9a-f-]{36}$/i.test(id)) continue;
    const blocks = Array.isArray(design.blocks) ? design.blocks.flatMap((block, index) => {
      const next = parseBlock(block, index);
      return next ? [next] : [];
    }).slice(0, 24) : [];
    if (!blocks.length) continue;
    const trigger: PopupTrigger = targeting.trigger === "immediate" || targeting.trigger === "scroll" || targeting.trigger === "exit" ? targeting.trigger : "delay";
    const frequency: PopupFrequency = targeting.frequency === "always" || targeting.frequency === "session" || targeting.frequency === "once" ? targeting.frequency : "day";
    const device: PopupDevice = targeting.device === "desktop" || targeting.device === "mobile" ? targeting.device : "all";
    const layout: PopupLayout = design.layout === "bar" || design.layout === "corner" ? design.layout : "modal";
    const paths = Array.isArray(pages?.paths) ? pages.paths.flatMap((path) => {
      if (typeof path !== "string") return [];
      const clean = path.trim().split("?")[0]?.split("#")[0] ?? "";
      return clean.startsWith("/") && !clean.startsWith("//") && clean.length <= 120 && !/\s/.test(clean) ? [clean] : [];
    }).slice(0, 20) : [];
    popups.push({
      id,
      design: {
        layout,
        width: num(design.width, 280, 640, 420),
        radius: num(design.radius, 0, 36, 24),
        padding: num(design.padding, 12, 48, 28),
        background: hex(design.background, "#fffaf6"),
        backgroundImage: safeImage(text(design.backgroundImage, 500)),
        overlay: num(design.overlay, 0, 80, 46),
        closeOnOverlay: design.closeOnOverlay !== false,
        closeColor: hex(design.closeColor, "#1a1a1a"),
        submitLabel: text(design.submitLabel, 40) || "שליחה",
        submitBackground: hex(design.submitBackground, "#1a1a1a"),
        submitColor: hex(design.submitColor, "#ffffff"),
        successTitle: text(design.successTitle, 80) || "קיבלנו",
        successText: text(design.successText, 240) || "תודה.",
        blocks,
      },
      pages: {
        all: pages?.all === true,
        home: pages?.home === true,
        product: pages?.product === true,
        catalog: pages?.catalog === true,
        checkout: pages?.checkout === true,
        content: pages?.content === true,
        paths,
      },
      trigger,
      delaySeconds: num(targeting.delaySeconds, 0, 180, 5),
      scrollPercent: num(targeting.scrollPercent, 5, 100, 40),
      frequency,
      device,
      startsAt: typeof targeting.startsAt === "string" ? targeting.startsAt : null,
      endsAt: typeof targeting.endsAt === "string" ? targeting.endsAt : null,
    });
    if (popups.length >= 20) break;
  }
  return popups;
}

function pathOf(pathname: string) {
  return pathname.split("?")[0]?.split("#")[0] || "/";
}

function prefixHit(path: string, prefix: string) {
  if (prefix === "/") return path === "/";
  return path === prefix || path.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`);
}

export function popupMatchesPage(popup: StorefrontPopup, pathname: string) {
  const path = pathOf(pathname);
  const pages = popup.pages;
  if (pages.all) return true;
  if (pages.home && path === "/") return true;
  if (pages.product && (path === "/product" || path.startsWith("/product/"))) return true;
  if (pages.catalog && (path === "/products" || path.startsWith("/products/") || path === "/olimini" || path.startsWith("/olimini/"))) return true;
  if (pages.checkout && (path === "/checkout" || path.startsWith("/checkout/"))) return true;
  if (pages.content && (path.startsWith("/journal") || path.startsWith("/articles") || path.startsWith("/podcast"))) return true;
  return pages.paths.some((prefix) => prefixHit(path, prefix));
}

export function popupMatchesDevice(popup: StorefrontPopup, width: number) {
  if (popup.device === "desktop") return width > 760;
  if (popup.device === "mobile") return width <= 760;
  return true;
}

export function popupInWindow(popup: StorefrontPopup, now = Date.now()) {
  if (popup.startsAt) {
    const start = Date.parse(popup.startsAt);
    if (Number.isFinite(start) && start > now) return false;
  }
  if (popup.endsAt) {
    const end = Date.parse(popup.endsAt);
    if (Number.isFinite(end) && end <= now) return false;
  }
  return true;
}

const storageKey = (id: string) => `storely-popup:${id}`;

export function popupAlreadySeen(popup: StorefrontPopup) {
  if (popup.frequency === "always" || typeof window === "undefined") return false;
  try {
    if (popup.frequency === "session") return sessionStorage.getItem(storageKey(popup.id)) === "1";
    const raw = localStorage.getItem(storageKey(popup.id));
    if (!raw) return false;
    if (popup.frequency === "once") return true;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function rememberPopup(popup: StorefrontPopup) {
  if (popup.frequency === "always") return;
  try {
    if (popup.frequency === "session") sessionStorage.setItem(storageKey(popup.id), "1");
    else localStorage.setItem(storageKey(popup.id), String(Date.now()));
  } catch {
    /* Private browsing can block storage. The popup can show again next time. */
  }
}
