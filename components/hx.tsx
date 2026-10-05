"use client";

import { useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  style?: CSSProperties;
  hover?: CSSProperties;
  children?: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  [key: string]: unknown;
};

export function Hx({ as, style, hover, children, type, onMouseEnter, onMouseLeave, ...rest }: Props) {
  const Tag = (as || "div") as ElementType;
  const [on, setOn] = useState(false);
  const btn = Tag === "button" ? { type: type ?? "button" } : {};
  return (
    <Tag
      {...btn}
      {...rest}
      style={{ ...style, ...(on && hover ? hover : null) }}
      onMouseEnter={(e: React.MouseEvent) => {
        setOn(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e: React.MouseEvent) => {
        setOn(false);
        onMouseLeave?.(e);
      }}
    >
      {children}
    </Tag>
  );
}
