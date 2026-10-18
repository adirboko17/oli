export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length >= 12) return "0" + digits.slice(3, 12);
  if (digits.length === 9 && digits.startsWith("5")) return "0" + digits;
  return digits;
}

export function isMobilePhone(phone: string) {
  return /^05\d{8}$/.test(phoneKey(phone));
}
