import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventView from "@/components/events/EventView";
import { getEvent, upcomingEvents } from "@/components/events/events";
import { loadPublicEvents } from "@/lib/cms-events";
import { registerForEvent } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(await loadPublicEvents(), slug);
  if (!event) return { title: "אירוע" };
  return { title: event.title, description: event.short };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const events = await loadPublicEvents();
  const event = getEvent(events, slug);
  if (!event) notFound();
  const related = upcomingEvents(events).filter((item) => item.slug !== event.slug && item.status !== "cancelled").slice(0, 6);
  return <EventView event={event} related={related} onRegister={registerForEvent} />;
}
