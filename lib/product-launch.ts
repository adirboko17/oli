import type { CatalogProduct } from "@/lib/catalog-model";

// Remove a product from this list when its launch is ready.
const upcomingProductIds = new Set([
  "454665e9-3a6e-44c7-9cb6-928b718094ba", // Pre & shower ritual
  "e2e22be6-be0b-4747-935d-73c56af23371", // After shower ritual
  "64756316-be78-425b-a792-3477aa6fae51", // Spray & Away
  "678557bf-2bf7-41b2-8508-b4fbca32c59f", // Pre & shower ritual — To Go
  "bc0b33dc-16bf-4d2f-b993-482aeec7467f", // After shower ritual — To Go
  "a8365944-f795-4e5f-898b-24afebad44a5", // Spray & Away — To Go
]);

export function productComingSoon(product: Pick<CatalogProduct, "id">) {
  return upcomingProductIds.has(product.id);
}
