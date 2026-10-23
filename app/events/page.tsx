import EventsIndex from "@/components/events/EventsIndex";
import { pastEvents, upcomingEvents } from "@/components/events/events";
import { loadPublicEvents } from "@/lib/cms-events";

export const metadata = {
  title: "אירועים",
  description: "מפגשים אונליין ופרונטליים להריון, ללידה ולתקופה שאחרי.",
};

export default async function Page() {
  const events = await loadPublicEvents();
  return <EventsIndex upcoming={upcomingEvents(events)} past={pastEvents(events)} />;
}
