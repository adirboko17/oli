"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { findProduct, type BgKey } from "@/lib/data";

export type CartItem = {
  id: string;
  name: string;
  sub: string;
  price: number;
  bg: BgKey;
  qty: number;
};

type Site = {
  mobile: boolean;
  wide: boolean;
  headerH: number;
  setHeaderH: (n: number) => void;
  headerRef: RefObject<HTMLElement | null>;
  menu: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  search: boolean;
  q: string;
  setQ: (q: string) => void;
  openSearch: () => void;
  account: boolean;
  accTab: "login" | "signup";
  setAccTab: (t: "login" | "signup") => void;
  openAccount: () => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  closeAll: () => void;
  items: CartItem[];
  cartCount: number;
  add: (n: number, name: string) => void;
  setQty: (id: string, d: number) => void;
};

const Ctx = createContext<Site | null>(null);

function allowScroll(target: EventTarget | null) {
  return target instanceof Element && !!target.closest("[data-scroll-lock-allow]");
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  const [wide, setWide] = useState(true);
  const [headerH, setHeaderH] = useState(64);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [account, setAccount] = useState(false);
  const [accTab, setAccTab] = useState<"login" | "signup">("login");
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 760;
      setMobile(m);
      setWide(window.innerWidth >= 1024);
      if (!m) setMenu(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch(false);
        setAccount(false);
        setCartOpen(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setAccount(false);
    setCartOpen(false);
  }, [path]);

  const overlay = menu || search || account || cartOpen;
  useEffect(() => {
    if (!overlay) return;
    const onTouch = (e: TouchEvent) => {
      if (allowScroll(e.target)) return;
      e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      if (allowScroll(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", onTouch, { passive: false });
    document.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      document.removeEventListener("touchmove", onTouch);
      document.removeEventListener("wheel", onWheel);
    };
  }, [overlay]);

  const closeAll = useCallback(() => {
    setSearch(false);
    setAccount(false);
  }, []);

  const openSearch = useCallback(() => {
    setSearch(true);
    setAccount(false);
    setCartOpen(false);
    setMenu(false);
  }, []);

  const openAccount = useCallback(() => {
    setAccount(true);
    setSearch(false);
    setCartOpen(false);
    setMenu(false);
  }, []);

  const openCart = useCallback(() => {
    setCartOpen(true);
    setMenu(false);
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenu((m) => !m);
  }, []);

  const add = useCallback((n: number, name: string) => {
    const p = findProduct(name);
    const item = p
      ? { id: p.id, name: p.name, sub: p.sub, price: p.price, bg: p.bg, qty: n }
      : { id: name, name, sub: "", price: 0, bg: "peach" as const, qty: n };
    setItems((prev) => {
      const next = prev.slice();
      const i = next.findIndex((x) => x.id === item.id);
      if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + n };
      else next.push(item);
      return next;
    });
    setCartOpen(true);
    setMenu(false);
  }, []);

  const setQty = useCallback((id: string, d: number) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  }, []);

  const cartCount = items.reduce((a, x) => a + x.qty, 0);

  const value = useMemo<Site>(
    () => ({
      mobile, wide, headerH, setHeaderH, headerRef, menu, toggleMenu,
      closeMenu: () => setMenu(false),
      search, q, setQ, openSearch, account, accTab, setAccTab, openAccount,
      cartOpen, openCart, closeCart, closeAll, items, cartCount, add, setQty,
    }),
    [mobile, wide, headerH, menu, toggleMenu, search, q, openSearch, account, accTab, openAccount, cartOpen, openCart, closeCart, closeAll, items, cartCount, add, setQty],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite");
  return v;
}
