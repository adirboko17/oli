import EventsIndex from "@/components/events/EventsIndex";
import { pastEvents, upcomingEvents } from "@/components/events/events";

export const metadata = {
  title: "אירועים",
  description: "מפגשים אונליין ופרונטליים להריון, ללידה ולתקופה שאחרי.",
};

export default function Page() {
  return <EventsIndex upcoming={upcomingEvents()} past={pastEvents()} />;
}
