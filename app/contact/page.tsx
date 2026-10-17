"use client";

import ContactPage, { type ContactPayload } from "@/components/contact/ContactPage";

async function submitContact(data: ContactPayload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("contact");
}

export default function Page() {
  return <ContactPage onSubmit={submitContact} />;
}
