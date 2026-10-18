import "server-only";

const ENDPOINT = "https://api.pulseem.com/api/v1/SmsApi/SendSms";

export function pulseemReady() {
  return Boolean(process.env.PULSEEM_API_KEY?.trim() && process.env.PULSEEM_FROM_NUMBER?.trim());
}

export async function sendPulseemSms(toNumber: string, text: string) {
  const sendId = `oli-${Date.now()}`;
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      APIKEY: process.env.PULSEEM_API_KEY!.trim(),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sendId,
      isAsync: false,
      smsSendData: {
        fromNumber: process.env.PULSEEM_FROM_NUMBER!.trim(),
        toNumberList: [toNumber],
        textList: [text],
        referenceList: [sendId],
      },
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    status?: string;
    error?: string;
    success?: number;
    failure?: number;
    successCount?: number;
    failCount?: number;
  } | null;
  const status = String(payload?.status || "");
  const success = payload?.success ?? payload?.successCount ?? 0;
  const failure = payload?.failure ?? payload?.failCount ?? 0;
  if (response.ok && status.toLowerCase() === "success" && failure === 0 && success > 0) return null;
  const error = String(payload?.error || status || response.status);
  console.error("Pulseem SMS was not sent:", error.slice(0, 180));
  if (/english letter/i.test(error)) return "שם השולח באנגלית עדיין לא מאושר בפולסים. צריך מספר שולח, או אישור של השם מהתמיכה.";
  return "לא הצלחנו לשלוח SMS. בדקי את שם השולח ואת יתרת ההודעות.";
}
