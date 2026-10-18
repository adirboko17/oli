export type AccountRecord = {
  name: string;
  phone: string;
  email: string;
  age: string;
  city: string;
  addr: string;
  due: string;
};

export function blankAccount(phone: string, partial: Partial<AccountRecord> = {}): AccountRecord {
  return {
    name: partial.name?.trim() || "",
    phone,
    email: partial.email?.trim().toLowerCase() || "",
    age: partial.age?.trim() || "",
    city: partial.city?.trim() || "",
    addr: partial.addr?.trim() || "",
    due: partial.due?.trim() || "",
  };
}
