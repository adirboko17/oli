import { redirect } from "next/navigation";
import { articlePublicPath } from "@/lib/article-paths";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(articlePublicPath(slug) || "/articles");
}
