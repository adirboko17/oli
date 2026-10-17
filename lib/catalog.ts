import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { STORE_ID } from "@/lib/store";
import { emptyCatalogPage, type CatalogBundle, type CatalogCollection, type CatalogMedia, type CatalogPage, type CatalogProduct, type CatalogVariant, type PublicCatalog } from "@/lib/catalog-model";

export type CatalogLoad =
  | { status: "ready"; catalog: PublicCatalog }
  | { status: "inactive" }
  | { status: "error" };

export const loadPublicCatalog = cache(async (): Promise<CatalogLoad> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("store_public_catalog", { target_store: STORE_ID });
    if (error) return { status: "error" };
    if (data == null) return { status: "inactive" };
    const catalog = await parseCatalog(data);
    return catalog ? { status: "ready", catalog } : { status: "error" };
  } catch {
    return { status: "error" };
  }
});

async function parseCatalog(data: unknown): Promise<PublicCatalog | null> {
  const row = record(data);
  if (!row || !Array.isArray(row.products)) return null;
  const products = (await Promise.all(row.products.map(parseProduct))).filter((product): product is CatalogProduct => product !== null);
  return {
    name: text(row.name),
    hostname: text(row.hostname),
    products,
    collections: Array.isArray(row.collections) ? row.collections.flatMap(parseCollection) : [],
  };
}

function parseCollection(value: unknown): CatalogCollection[] {
  const row = record(value);
  const title = text(row?.title).trim();
  if (!row || !title || row.hidden === true) return [];
  const productIds = Array.isArray(row.productIds) ? row.productIds.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  const subcategories = Array.isArray(row.subcategories)
    ? [...new Set(row.subcategories.flatMap((name) => (typeof name === "string" && name.trim() ? [name.trim()] : [])))]
    : [];
  return [{ id: typeof row.id === "string" && row.id ? row.id : title, title, description: text(row.description), productIds, subcategories }];
}

async function parseProduct(value: unknown): Promise<CatalogProduct | null> {
  const row = record(value);
  const price = money(row?.price);
  if (!row || typeof row.id !== "string" || typeof row.title !== "string" || price == null) return null;
  const media = Array.isArray(row.media) ? (await Promise.all(row.media.map(parseMedia))).filter((item): item is CatalogMedia => item !== null) : [];
  const variants = Array.isArray(row.variants) ? row.variants.map(parseVariant).filter((item): item is CatalogVariant => item !== null) : [];
  return {
    id: row.id,
    title: row.title,
    handle: typeof row.handle === "string" && row.handle ? row.handle : null,
    description: text(row.description),
    vendor: text(row.vendor),
    category: text(row.category),
    price,
    compareAt: money(row.compareAt),
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
    variants: variants.sort((a, b) => a.position - b.position),
    media: media.sort((a, b) => a.position - b.position),
    bundles: parseBundles(row.merch),
    page: parsePage(row.merch),
    badge: badgeLabel(row.merch),
    badgeHidden: badgeHidden(row.merch),
  };
}

function parseVariant(value: unknown): CatalogVariant | null {
  const row = record(value);
  if (!row || typeof row.id !== "string") return null;
  return {
    id: row.id,
    title: text(row.title),
    sku: typeof row.sku === "string" && row.sku ? row.sku : null,
    price: money(row.price),
    position: money(row.position) ?? 0,
  };
}

async function parseMedia(value: unknown): Promise<CatalogMedia | null> {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.path !== "string") return null;
  const kind = /\.(mp4|webm|mov)(\?|$)/i.test(row.path) ? "video" : "image";
  return {
    id: row.id,
    position: money(row.position) ?? 0,
    src: await reachableMedia(row.path, kind),
    kind,
  };
}

async function reachableMedia(path: string, kind: "image" | "video") {
  if (!/^https?:\/\//i.test(path)) return null;
  const mediaRoot = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/product-media/`;
  if (path.startsWith(mediaRoot) || kind === "video") return path;
  try {
    const response = await fetch(path, { method: "HEAD", redirect: "follow", cache: "no-store" });
    const type = response.headers.get("content-type") ?? "";
    return response.ok && type.startsWith("image/") ? path : null;
  } catch {
    return null;
  }
}

function badgeLabel(value: unknown) {
  const badge = record(record(value)?.badge);
  return text(badge?.label).trim().slice(0, 24);
}

function badgeHidden(value: unknown) {
  return record(record(value)?.badge)?.hidden === true;
}

function parseBundles(value: unknown): CatalogBundle[] {
  const merch = record(value);
  if (!Array.isArray(merch?.bundles)) return [];
  const seen = new Set<number>();
  const bundles: CatalogBundle[] = [];
  for (const item of merch.bundles) {
    const row = record(item);
    const qty = money(row?.qty);
    const price = money(row?.price);
    if (qty == null || price == null || !Number.isInteger(qty) || qty < 1 || qty > 99 || price < 0) continue;
    if (seen.has(qty)) continue;
    seen.add(qty);
    bundles.push({ qty, price, label: text(row?.label) || `קנה ${qty}` });
  }
  return bundles.sort((a, b) => a.qty - b.qty);
}

function parsePage(value: unknown): CatalogPage {
  const merch = record(value);
  const row = record(merch?.page);
  const page = emptyCatalogPage();
  if (!row) return page;
  page.panels = objects(row.panels, 8).flatMap((item) => {
    const title = text(item.title);
    const paras = text(item.body).split("\n").map((part) => part.trim()).filter(Boolean);
    return title && paras.length ? [{ title, paras }] : [];
  });
  page.stories = objects(row.stories, 20).flatMap((item) => {
    const handle = text(item.handle);
    const url = /^https:\/\/([a-z0-9-]+\.)*instagram\.com\/\S+$/i.test(text(item.url)) ? text(item.url) : "";
    return handle ? [{ handle, url }] : [];
  });
  page.steps = objects(row.steps, 8).flatMap((item) => {
    const title = text(item.title);
    const body = text(item.body);
    return title && body ? [{ title, body }] : [];
  });
  page.ingredientsIntro = text(row.ingredientsIntro);
  page.ingredients = objects(row.ingredients, 12).flatMap((item) => {
    const en = text(item.en);
    const he = text(item.he);
    const body = text(item.body);
    return (en || he) && body ? [{ en, he, body }] : [];
  });
  page.reviews = objects(row.reviews, 30).flatMap((item) => {
    const name = text(item.name);
    const body = text(item.body);
    if (!name || !body) return [];
    const date = text(item.date);
    const verified = item.verified === true ? " · רכישה מאומתת" : "";
    return [{ name, title: text(item.title), body, initial: name.trim()[0]?.toUpperCase() || "•", meta: date + verified }];
  });
  return page;
}

function objects(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, limit).flatMap((item) => {
    const row = record(item);
    return row ? [row] : [];
  });
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function money(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}
