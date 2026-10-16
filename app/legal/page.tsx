"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useSite } from "@/components/site";
import { LEGAL, type LegalTab } from "@/lib/legal";
import { FF } from "@/lib/format";

function LegalBody() {
  const sp = useSearchParams();
  const { mobile } = useSite();
  const tab = (LEGAL.find((item) => item.id === sp.get("tab")) ?? LEGAL[0]) as LegalTab;
  return (
    <main style={{ width: "100%" }}>
      <section style={{ background: "#FBF5F1", borderBottom: "1px solid #F1E5DD" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(28px,5vw,56px) clamp(16px,4.5vw,32px) 0", display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,28px)" }}>
          <div style={{ fontSize: 13, color: "#8A6C64", display: "flex", gap: 8 }}>
            <Link href="/" style={{ color: "#8A6C64" }}>דף הבית</Link><span>/</span><span style={{ color: "#3A2826" }}>מידע משפטי</span>
          </div>
          <h1 style={{ fontFamily: FF, fontWeight: 400, letterSpacing: "-.02em", fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.05 }}>{tab.label}</h1>
          <nav style={{ display: "flex", gap: "clamp(18px,4vw,36px)", overflowX: "auto" }}>
            {LEGAL.map((item) => (
              <Link key={item.id} href={"/legal?tab=" + item.id} style={{ padding: "14px 0", borderBottom: "2px solid " + (tab.id === item.id ? "#3A2826" : "transparent"), fontWeight: tab.id === item.id ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</Link>
            ))}
          </nav>
        </div>
      </section>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(20px,4vw,40px) clamp(16px,4.5vw,32px) clamp(56px,9vw,96px)", display: "grid", gridTemplateColumns: mobile ? "1fr" : "220px minmax(0,1fr)", gap: "clamp(24px,5vw,64px)", alignItems: "start" }}>
        {!mobile && (
          <aside style={{ position: "sticky", top: 120, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "#A85A3A", marginBottom: 8 }}>בעמוד זה</span>
            {tab.sections.map((section) => (
              <a key={section.id} href={"#" + section.id} style={{ fontSize: 14, color: "#6E5650", padding: "6px 0" }}>{section.title}</a>
            ))}
          </aside>
        )}
        <article style={{ minWidth: 0, maxWidth: 720, display: "flex", flexDirection: "column" }}>
          <div style={{ paddingBottom: 12 }}><span style={{ fontSize: 13, color: "#8A6C64" }}>עודכן לאחרונה: <Mark>[ תאריך ]</Mark></span></div>
          {tab.sections.map((section) => (
            <section key={section.id} id={section.id} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "28px 0", borderTop: "1px solid #F1E5DD", scrollMarginTop: 120 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "#A85A3A", minWidth: 22 }}>{section.n}</span>
                <h2 style={{ fontFamily: FF, fontWeight: 400, fontSize: "clamp(22px,3vw,28px)", lineHeight: 1.2, letterSpacing: "-.01em" }}>{section.title}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingRight: 36 }}>
                {section.blocks.map((block, index) => block.kind === "ul" ? (
                  <ul key={index} style={{ margin: 0, padding: "0 18px 0 0", display: "flex", flexDirection: "column", gap: 8, fontSize: 16, lineHeight: 1.8, color: "#4E3B37" }}>
                    {(block.text as string[]).map((item) => <li key={item}><Rich text={item} /></li>)}
                  </ul>
                ) : <p key={index} style={{ fontSize: 16, lineHeight: 1.8, color: "#4E3B37" }}><Rich text={block.text as string} /></p>)}
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}

function Rich({ text }: { text: string }) {
  const bits = text.split(/(\[[^\]]+\]|contact@olisafecare\.com|\+972559739670)/g);
  return bits.map((bit, index) => {
    if (bit.startsWith("[")) return <Mark key={index}>{bit}</Mark>;
    if (bit.startsWith("contact@")) return <a key={index} href={"mailto:" + bit} style={{ color: "#A85A3A" }}>{bit}</a>;
    if (bit.startsWith("+972")) return <a key={index} href="https://wa.me/972559739670" style={{ color: "#A85A3A", direction: "ltr", display: "inline-block" }}>{bit}</a>;
    return <span key={index}>{bit}</span>;
  });
}

function Mark({ children }: { children: ReactNode }) {
  return <span style={{ background: "#FBF0E9", color: "#A85A3A", padding: "1px 6px", borderRadius: 6 }}>{children}</span>;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LegalBody />
    </Suspense>
  );
}
