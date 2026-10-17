import { notFound } from "next/navigation";
import PodcastPage from "@/components/final/PodcastPage";

const SHOWS = ["safe", "free"] as const;

export function generateStaticParams() {
  return SHOWS.map((show) => ({ show }));
}

export default async function Page({ params }: { params: Promise<{ show: string }> }) {
  const { show } = await params;
  if (show !== "safe" && show !== "free") notFound();
  return <PodcastPage show={show} />;
}
