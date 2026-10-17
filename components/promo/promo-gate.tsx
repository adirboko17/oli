"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "oli-promo-done";

type Gate = {
  quizOpen: boolean;
  finished: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
  markFinished: () => void;
};

const Ctx = createContext<Gate | null>(null);

export function PromoGate({ children }: { children: ReactNode }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [finished, setFinished] = useState(true);

  useEffect(() => {
    setFinished(window.localStorage.getItem(KEY) === "1");
  }, []);

  const openQuiz = useCallback(() => setQuizOpen(true), []);
  const closeQuiz = useCallback(() => setQuizOpen(false), []);
  const markFinished = useCallback(() => {
    window.localStorage.setItem(KEY, "1");
    setFinished(true);
  }, []);

  return <Ctx.Provider value={{ quizOpen, finished, openQuiz, closeQuiz, markFinished }}>{children}</Ctx.Provider>;
}

export function usePromoGate() {
  const gate = useContext(Ctx);
  if (!gate) throw new Error("PromoGate missing");
  return gate;
}
