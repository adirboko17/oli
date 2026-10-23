"use server";

import { fmt, type RegistrationData } from "@/components/events/events";
import { registerForEvent as saveRegistration } from "@/lib/event-signups";

export async function registerForEvent(data: RegistrationData) {
  const saved = await saveRegistration(data);
  if (!saved.ok) return saved;
  if (!saved.created || !saved.fullName) return;

  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const when = fmt(saved.event);
  const first = saved.fullName.split(/\s+/)[0];
  const text = [
    `היי ${first},`,
    `נרשמת למפגש "${saved.event.title}".`,
    `${when.dateLabel}, ${when.timeLabel}.`,
    when.where,
    saved.event.online ? "קישור הזום יישלח אליך במייל לפני המפגש, והוא לא מופיע באתר." : "הוראות ההגעה יישלחו אליך במייל לפני המפגש.",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "Oli Safe Care <info@olisafecare.com>",
      to: [saved.email],
      reply_to: "info@olisafecare.com",
      subject: `נרשמת · ${saved.event.title}`,
      text,
    }),
  }).catch(() => null);
}
