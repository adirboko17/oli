import { headers } from "next/headers";
import { CheckoutView } from "@/components/checkout-view";
import { loadShopShipping } from "@/lib/storely-shop";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const headerList = await headers();
  const shipping = await loadShopShipping(headerList.get("host"));
  return <CheckoutView shippingMethods={shipping.methods} currency={shipping.currency} />;
}
