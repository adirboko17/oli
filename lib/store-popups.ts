import { articleSlugForPath, isArticleSection } from "@/lib/article-paths";

export type PopupAlign = "right" | "center" | "left";
export type PopupLayout = "modal" | "bar" | "corner";
export type PopupTrigger = "immediate" | "delay" | "scroll" | "exit";
export type PopupFrequency = "always" | "session" | "day" | "once";
export type PopupDevice = "all" | "desktop" | "mobile";
export type PopupClosePlace = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type PopupSpan = "full" | "half";
export type PopupMedia = "none" | "right" | "left";

export type PopupBlock =
  | { id: string; type: "heading"; text: string; color: string; size: number; align: PopupAlign; weight: "regular" | "bold"; span: PopupSpan }
  | { id: string; type: "text"; text: string; color: string; size: number; align: PopupAlign; span: PopupSpan }
  | { id: string; type: "image"; src: string; alt: string; radius: number; width: number; span: PopupSpan }
  | { id: string; type: "logo"; src: string; width: number; span: PopupSpan }
  | { id: string; type: "button"; label: string; href: string; background: string; color: string; radius: number; span: PopupSpan }
  | { id: string; type: "field"; fieldType: "text" | "email" | "tel" | "textarea"; label: string; name: string; placeholder: string; required: boolean; span: PopupSpan }
  | { id: string; type: "spacer"; height: number; span: PopupSpan }
  | { id: string; type: "row"; span: PopupSpan; columns: PopupColumn[] };

export type PopupLeaf = Exclude<PopupBlock, { type: "row" }>;
export type PopupColumn = { id: string; width: number; blocks: PopupLeaf[] };

export type PopupMobile = {
  layout: "same" | PopupLayout;
  width: number;
  radius: number;
  padding: number;
  gap: number;
  media: "same" | "stack" | "hide";
  columns: "same" | "stack";
};

export type PopupDesign = {
  layout: PopupLayout;
  width: number;
  radius: number;
  padding: number;
  gap: number;
  media: PopupMedia;
  mediaImage: string;
  background: string;
  backgroundImage: string;
  overlay: number;
  closeOnOverlay: boolean;
  closeColor: string;
  closeSize: number;
  closePlace: PopupClosePlace;
  mobile: PopupMobile;
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

function spanOf(value: unknown): PopupSpan {
  return value === "half" ? "half" : "full";
}

function parseMobile(value: unknown): PopupMobile {
  const row = record(value);
  const layout: PopupMobile["layout"] = row?.layout === "modal" || row?.layout === "bar" || row?.layout === "corner" ? row.layout : "same";
  const media: PopupMobile["media"] = row?.media === "same" || row?.media === "hide" ? row.media : "stack";
  return {
    layout,
    width: num(row?.width, 0, 480, 0),
    radius: typeof row?.radius === "number" ? num(row.radius, 0, 40, 0) : -1,
    padding: typeof row?.padding === "number" ? num(row.padding, 0, 64, 0) : -1,
    gap: typeof row?.gap === "number" ? num(row.gap, 0, 40, 0) : -1,
    media,
    columns: row?.columns === "same" ? "same" : "stack",
  };
}

export function popupLook(design: PopupDesign, device: "desktop" | "mobile") {
  const mobile = device === "mobile";
  const phone = design.mobile;
  const media = !mobile || phone.media === "same" ? design.media : phone.media === "hide" ? "none" : design.media;
  return {
    layout: mobile && phone.layout !== "same" ? phone.layout : design.layout,
    width: mobile && phone.width > 0 ? phone.width : mobile ? Math.min(design.width, 360) : design.width,
    radius: mobile && phone.radius >= 0 ? phone.radius : design.radius,
    padding: mobile && phone.padding >= 0 ? phone.padding : design.padding,
    gap: mobile && phone.gap >= 0 ? phone.gap : design.gap,
    media,
    mediaImage: design.mediaImage,
    stackColumns: mobile && phone.columns === "stack",
    stackMedia: mobile && phone.media === "stack" && design.media !== "none" && Boolean(design.mediaImage),
  };
}

export function columnGrid(columns: { width: number }[], stack: boolean) {
  if (stack || columns.length < 2) return "minmax(0,1fr)";
  return columns.map((column) => `minmax(0,${Math.max(1, column.width)}fr)`).join(" ");
}

function fitColumnWidths(columns: PopupColumn[]): PopupColumn[] {
  if (columns.length <= 1) return columns.map((column) => ({ ...column, width: 100 }));
  const known = columns.map((column) => (column.width > 0 ? column.width : 0));
  const blanks = known.filter((width) => width === 0).length;
  const each = Math.floor(100 / columns.length);
  const equal = Array.from({ length: columns.length }, (_, index) => (index === columns.length - 1 ? 100 - each * (columns.length - 1) : each));
  const seeded = blanks === columns.length ? equal : blanks === 0 ? known : known.map((width) => width || each);
  const seededTotal = seeded.reduce((sum, width) => sum + width, 0) || 1;
  const scaled = seeded.map((width) => Math.max(15, Math.round((width / seededTotal) * 100)));
  let sum = scaled.reduce((total, width) => total + width, 0);
  let guard = 0;
  while (sum !== 100 && guard < 40) {
    const step = sum > 100 ? -1 : 1;
    let pick = 0;
    scaled.forEach((width, index) => {
      if (step < 0 && width > scaled[pick]!) pick = index;
      if (step > 0 && width < scaled[pick]!) pick = index;
    });
    if (step < 0 && scaled[pick]! <= 15) break;
    scaled[pick] = scaled[pick]! + step;
    sum += step;
    guard += 1;
  }
  return columns.map((column, index) => ({ ...column, width: scaled[index] ?? column.width }));
}

function parseBlock(value: unknown, index: number): PopupBlock | null {
  const row = record(value);
  if (!row) return null;
  const id = text(row.id, 80) || `block-${index}`;
  if (row.type === "row" && Array.isArray(row.columns)) {
    const columns = row.columns.flatMap((entry) => {
      const column = record(entry);
      if (!column) return [];
      const blocks = Array.isArray(column.blocks) ? column.blocks.flatMap((child, childIndex) => {
        const next = parseBlock(child, childIndex);
        return next && next.type !== "row" ? [next] : [];
      }).slice(0, 8) : [];
      return [{ id: text(column.id, 80) || `column-${index}`, width: num(column.width, 15, 100, 0), blocks }];
    }).slice(0, 4);
    if (!columns.length) return null;
    return { id, type: "row", span: "full", columns: fitColumnWidths(columns) };
  }
  const align: PopupAlign = row.align === "center" || row.align === "left" ? row.align : "right";
  if (row.type === "heading") {
    return { id, type: "heading", text: text(row.text, 160), color: hex(row.color, "#1a1a1a"), size: num(row.size, 16, 48, 28), align, weight: row.weight === "regular" ? "regular" : "bold", span: spanOf(row.span) };
  }
  if (row.type === "text") return { id, type: "text", text: text(row.text, 800), color: hex(row.color, "#4a4a4a"), size: num(row.size, 12, 24, 15), align, span: spanOf(row.span) };
  if (row.type === "image") return { id, type: "image", src: safeImage(text(row.src, 500)), alt: text(row.alt, 120), radius: num(row.radius, 0, 40, 12), width: num(row.width, 30, 100, 100), span: spanOf(row.span) };
  if (row.type === "logo") return { id, type: "logo", src: safeImage(text(row.src, 500)), width: num(row.width, 48, 220, 112), span: spanOf(row.span) };
  if (row.type === "button") {
    return {
      id,
      type: "button",
      label: text(row.label, 40) || "לחצו כאן",
      href: safeHref(text(row.href, 300)),
      background: hex(row.background, "#1a1a1a"),
      color: hex(row.color, "#ffffff"),
      radius: row.radius === 999 ? 999 : num(row.radius, 0, 28, 12),
      span: spanOf(row.span),
    };
  }
  if (row.type === "field") {
    const fieldType = row.fieldType === "email" || row.fieldType === "tel" || row.fieldType === "textarea" ? row.fieldType : "text";
    const name = text(row.name, 32).toLowerCase();
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(name)) return null;
    return { id, type: "field", fieldType, label: text(row.label, 60), name, placeholder: text(row.placeholder, 80), required: row.required !== false, span: spanOf(row.span) };
  }
  if (row.type === "spacer") return { id, type: "spacer", height: num(row.height, 4, 80, 16), span: spanOf(row.span) };
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
        width: num(design.width, 280, 880, 420),
        radius: num(design.radius, 0, 40, 24),
        padding: num(design.padding, 0, 64, 28),
        gap: num(design.gap, 0, 40, 12),
        media: design.media === "right" || design.media === "left" ? design.media : "none",
        mediaImage: safeImage(text(design.mediaImage, 500)),
        background: hex(design.background, "#fffaf6"),
        backgroundImage: safeImage(text(design.backgroundImage, 500)),
        overlay: num(design.overlay, 0, 80, 46),
        closeOnOverlay: design.closeOnOverlay !== false,
        closeColor: hex(design.closeColor, "#1a1a1a"),
        closeSize: num(design.closeSize, 14, 36, 22),
        closePlace: design.closePlace === "top-right" || design.closePlace === "bottom-left" || design.closePlace === "bottom-right" ? design.closePlace : "top-left",
        mobile: parseMobile(design.mobile),
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

function decodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function prefixHit(path: string, prefix: string) {
  if (prefix === "/") return path === "/";
  return path === prefix || path.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`);
}

function articleKey(path: string) {
  const decoded = decodePath(path);
  if (decoded.startsWith("/articles/") && decoded.length > "/articles/".length) return decoded.slice("/articles/".length);
  if (decoded.startsWith("/journal/") && decoded.length > "/journal/".length) return decoded.slice("/journal/".length);
  return articleSlugForPath(decoded);
}

function pageHit(path: string, prefix: string) {
  if (prefixHit(path, prefix)) return true;
  const current = articleKey(path);
  const target = articleKey(prefix);
  return Boolean(current && current === target);
}

export function popupMatchesPage(popup: StorefrontPopup, pathname: string) {
  const path = pathOf(pathname);
  const pages = popup.pages;
  if (pages.all) return true;
  if (pages.home && path === "/") return true;
  if (pages.product && (path === "/product" || path.startsWith("/product/") || path === "/product-page" || path.startsWith("/product-page/"))) return true;
  if (pages.catalog && (path === "/products" || path.startsWith("/products/") || path === "/olimini" || path.startsWith("/olimini/"))) return true;
  if (pages.checkout && (path === "/checkout" || path.startsWith("/checkout/"))) return true;
  if (pages.content && (isArticleSection(path) || path === "/podcast" || path.startsWith("/podcast/"))) return true;
  return pages.paths.some((prefix) => pageHit(path, prefix));
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
