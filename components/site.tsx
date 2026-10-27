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
import type { OliEvent } from "@/components/events/events";
import type { CatalogCollection, CatalogProduct } from "@/lib/catalog-model";
import { trackAddToCart } from "@/lib/storely-actions";

export type CartItem = {
  id: string;
  name: string;
  sub: string;
  price: number;
  image: string | null;
  qty: number;
};

export type CartDraft = Omit<CartItem, "qty">;

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
  products: CatalogProduct[];
  collections: CatalogCollection[];
  events: OliEvent[];
  storeName: string;
  items: CartItem[];
  cartCount: number;
  add: (item: CartDraft, qty?: number, quiet?: boolean) => void;
  setQty: (id: string, d: number) => void;
  replaceCart: (next: CartItem[]) => void;
  clearCart: () => void;
};

const Ctx = createContext<Site | null>(null);
const CART_KEY = "oli-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Partial<CartItem>;
      const qty = Number(row.qty);
      const price = Number(row.price);
      if (typeof row.id !== "string" || !row.id || typeof row.name !== "string" || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price)) return [];
      return [{
        id: row.id,
        name: row.name,
        sub: typeof row.sub === "string" ? row.sub : "",
        price,
        image: typeof row.image === "string" ? row.image : null,
        qty,
      }];
    });
  } catch {
    return [];
  }
}

function allowScroll(target: EventTarget | null) {
  return target instanceof Element && !!target.closest("[data-scroll-lock-allow]");
}

export function SiteProvider({ children, products, collections, events, storeName }: { children: ReactNode; products: CatalogProduct[]; collections: CatalogCollection[]; events: OliEvent[]; storeName: string }) {
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
  const [cartReady, setCartReady] = useState(false);
  const restoredCart = useRef(false);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 768;
      setMobile(m);
      setWide(window.innerWidth >= 1024);
      if (window.innerWidth >= 1200) setMenu(false);
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
    const saved = readCart();
    setItems((current) => (restoredCart.current || current.length ? current : saved));
    setCartReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_KEY) setItems(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* the cart still works for this visit if storage is unavailable */
    }
  }, [items, cartReady]);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setAccount(false);
    setCartOpen(false);
  }, [path]);

  const overlay = search || account || cartOpen;
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

  const add = useCallback((item: CartDraft, qty = 1, quiet = false) => {
    setItems((prev) => {
      const next = prev.slice();
      const i = next.findIndex((x) => x.id === item.id);
      if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + qty };
      else next.push({ ...item, qty });
      return next;
    });
    if (!quiet) {
      setCartOpen(true);
      setMenu(false);
    }
    void trackAddToCart();
  }, []);

  const setQty = useCallback((id: string, d: number) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
    if (d > 0) void trackAddToCart();
  }, []);

  const replaceCart = useCallback((next: CartItem[]) => {
    restoredCart.current = true;
    setItems(next.map((item) => ({ ...item, qty: item.qty })));
    setCartReady(true);
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((a, x) => a + x.qty, 0);

  const value = useMemo<Site>(
    () => ({
      mobile, wide, headerH, setHeaderH, headerRef, menu, toggleMenu,
      closeMenu: () => setMenu(false),
      search, q, setQ, openSearch, account, accTab, setAccTab, openAccount,
      cartOpen, openCart, closeCart, closeAll, products, collections, events, storeName, items, cartCount, add, setQty, replaceCart, clearCart,
    }),
    [mobile, wide, headerH, menu, toggleMenu, search, q, openSearch, account, accTab, openAccount, cartOpen, openCart, closeCart, closeAll, products, collections, events, storeName, items, cartCount, add, setQty, replaceCart, clearCart],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite");
  return v;
}
