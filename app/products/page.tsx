import { Suspense } from "react";
import { CategoryView } from "@/components/category-view";

export default function Page() {
  return (
    <Suspense>
      <CategoryView />
    </Suspense>
  );
}
