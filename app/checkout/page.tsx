import { headers } from "next/headers";
import { CheckoutView } from "@/components/checkout-view";
import { loadRecoveredCheckout, loadShopShipping } from "@/lib/storely-shop";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ recover?: string }> }) {
  const headerList = await headers();
  const { recover } = await searchParams;
  const host = headerList.get("host");
  const shipping = await loadShopShipping(host);
  const recovered = recover ? await loadRecoveredCheckout(host, recover) : null;
  return <CheckoutView shippingMethods={shipping.methods} currency={shipping.currency} recovered={recovered} />;
}
