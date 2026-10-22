import { headers } from "next/headers";
import { StorePopups } from "@/components/store-popups";
import { loadShopPopups } from "@/lib/storely-shop";

export async function StorePopupSlot() {
  const host = (await headers()).get("host");
  const popups = await loadShopPopups(host);
  if (!popups.length) return null;
  return <StorePopups popups={popups} />;
}
