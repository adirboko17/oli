import "server-only";

const FROM = process.env.CONTACT_FROM || "Oli Safe Care <info@olisafecare.com>";

export async function sendGiftCardEmail(input: {
  to: string;
  recipientName: string;
  senderName: string;
  message: string;
  cards: { code: string; amount: number }[];
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !input.cards.length) return false;
  const first = input.recipientName.split(/\s+/)[0] || input.recipientName;
  const cards = input.cards.map((card) => `${card.code}  ·  ₪${card.amount}`).join("\n");
  const text = [
    `היי ${first},`,
    `${input.senderName} שלחה לך כרטיס מתנה דיגיטלי מ־Oli Safe Care.`,
    input.message ? input.message : "",
    "הקוד למימוש:",
    cards,
    "מזינים את הקוד בקופה באתר. הכרטיס דיגיטלי, בלי דמי משלוח.",
  ].filter(Boolean).join("\n\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        reply_to: "info@olisafecare.com",
        subject: `${input.senderName} שלחה לך כרטיס מתנה`,
        text,
      }),
    });
    if (!response.ok) {
      console.error("gift card email was not sent");
      return false;
    }
    return true;
  } catch {
    console.error("gift card email was not sent");
    return false;
  }
}
