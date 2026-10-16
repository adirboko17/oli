"use client";

import { useEffect, useState } from "react";

export type OliAddress = { id: string; label: string; city: string; addr: string };

export type OliUser = {
  name: string;
  phone: string;
  email: string;
  age: string;
  city: string;
  addr: string;
  due: string;
  isNew: boolean;
  addresses?: OliAddress[];
};

export type OliOrderLine = { id: string; name: string; sub: string; qty: number; price: number; image: string | null };
export type OliOrderStatus = "new" | "sent" | "transit" | "done";
export type OliOrder = {
  id: string;
  no: string;
  date: string;
  status: OliOrderStatus;
  lines: OliOrderLine[];
  subtotal: number;
  ship: number;
  addr: string;
};
export type OliReview = { stars: number; text: string; photo: string | null };

const KEY = "oli-user";
const BOOK = "oli-users";
const ORDERS = "oli-orders";
const REVIEWS = "oli-reviews";

export function readUser(): OliUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as OliUser : null;
  } catch {
    return null;
  }
}

export function saveUser(user: OliUser) {
  const all = readBook().filter((item) => item.phone !== user.phone);
  all.push(user);
  localStorage.setItem(BOOK, JSON.stringify(all));
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("oli-user"));
}

export function findUser(phone: string) {
  return readBook().find((item) => item.phone === phone) ?? null;
}

export function clearUser() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("oli-user"));
}

export function useOliUser() {
  const [user, setUser] = useState<OliUser | null>(null);
  useEffect(() => {
    const read = () => setUser(readUser());
    read();
    window.addEventListener("oli-user", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("oli-user", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return user;
}

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as Record<string, T> : {};
  } catch {
    return {};
  }
}

function readBook(): OliUser[] {
  try {
    const raw = localStorage.getItem(BOOK);
    return raw ? JSON.parse(raw) as OliUser[] : [];
  } catch {
    return [];
  }
}

export function readOrders(phone: string): OliOrder[] {
  return readMap<OliOrder[]>(ORDERS)[phone] ?? [];
}

export function saveOrder(phone: string, order: OliOrder) {
  const all = readMap<OliOrder[]>(ORDERS);
  all[phone] = [order, ...(all[phone] ?? [])];
  localStorage.setItem(ORDERS, JSON.stringify(all));
  window.dispatchEvent(new Event("oli-user"));
}

export function readReview(key: string): OliReview | null {
  return readMap<OliReview>(REVIEWS)[key] ?? null;
}

export function saveReview(key: string, review: OliReview) {
  const all = readMap<OliReview>(REVIEWS);
  all[key] = review;
  localStorage.setItem(REVIEWS, JSON.stringify(all));
  window.dispatchEvent(new Event("oli-user"));
}

export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return d;
  return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
}
