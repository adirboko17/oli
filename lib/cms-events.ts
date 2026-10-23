import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { EventStatus, OliEvent } from "@/components/events/events";
import { STORE_ID } from "@/lib/store";

const STATUSES = new Set<EventStatus>(["draft", "open", "full", "ended", "cancelled"]);

async function fetchPublicEvents(): Promise<OliEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.rpc("store_public_events", { target_store: STORE_ID });
    if (error || !Array.isArray(data)) return [];
    return data.flatMap(parseEvent);
  } catch {
    return [];
  }
}

const readCachedEvents = unstable_cache(fetchPublicEvents, ["public-events", STORE_ID], { revalidate: 60 });

export const loadPublicEvents = cache(readCachedEvents);

function parseEvent(value: unknown): OliEvent[] {
  const row = record(value);
  const slug = text(row?.slug).trim();
  const title = text(row?.title).trim();
  const date = text(row?.date).trim();
  const from = text(row?.from).trim();
  const to = text(row?.to).trim();
  const status = text(row?.status).trim();
  if (!row || !slug || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(from) || !/^\d{2}:\d{2}$/.test(to) || !STATUSES.has(status as EventStatus)) return [];
  const price = money(row.price);
  if (price == null || price < 0) return [];
  const body = Array.isArray(row.body) ? row.body.flatMap((part) => {
    const paragraph = text(part).trim();
    return paragraph ? [paragraph] : [];
  }) : [];
  const address = text(row.address).trim();
  const image = imageSrc(row.image);
  return [{
    slug,
    title,
    short: text(row.short).trim(),
    body,
    date,
    from,
    to,
    online: row.online === true,
    ...(address ? { address } : {}),
    price,
    status: status as EventStatus,
    ...(image ? { image } : {}),
  }];
}

function imageSrc(value: unknown) {
  const src = text(value).trim();
  if (!/^https:\/\/\S+$/i.test(src) || /\/product-media\/?$/i.test(src)) return "";
  return src;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function money(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}
