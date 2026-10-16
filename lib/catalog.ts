import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { STORE_ID } from "@/lib/store";
import type { CatalogMedia, CatalogProduct, CatalogVariant, PublicCatalog } from "@/lib/catalog-model";

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
  };
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
  return {
    id: row.id,
    position: money(row.position) ?? 0,
    src: await reachableImage(row.path),
  };
}

async function reachableImage(path: string) {
  if (!/^https?:\/\//i.test(path)) return null;
  const mediaRoot = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/product-media/`;
  if (path.startsWith(mediaRoot)) return path;
  try {
    const response = await fetch(path, { method: "HEAD", redirect: "follow", cache: "no-store" });
    const type = response.headers.get("content-type") ?? "";
    return response.ok && type.startsWith("image/") ? path : null;
  } catch {
    return null;
  }
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
