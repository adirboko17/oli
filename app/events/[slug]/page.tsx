import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventView from "@/components/events/EventView";
import { getEvent, publicEvents } from "@/components/events/events";
import { registerForEvent } from "../actions";

export function generateStaticParams() {
  return publicEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return { title: "אירוע" };
  return { title: event.title, description: event.short };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();
  return <EventView event={event} onRegister={registerForEvent} />;
}
