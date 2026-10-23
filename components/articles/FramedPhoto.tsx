"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";

function placeImage(frameW: number, frameH: number, natW: number, natH: number, x: number, y: number, scale: number) {
  if (!frameW || !frameH || !natW || !natH) return null;
  const cover = Math.max(frameW / natW, frameH / natH);
  const contain = Math.min(frameW / natW, frameH / natH);
  const zoom = Math.min(3, Math.max(contain / cover, scale || 1));
  const width = natW * cover * zoom;
  const height = natH * cover * zoom;
  const left = clampOffset(frameW / 2 - (x / 100) * width, frameW, width);
  const top = clampOffset(frameH / 2 - (y / 100) * height, frameH, height);
  return { width, height, left, top };
}

function clampOffset(offset: number, frame: number, size: number) {
  if (size >= frame) return Math.min(0, Math.max(frame - size, offset));
  return Math.min(Math.max(0, frame - size), Math.max(0, offset));
}

export function FramedPhoto({ src, alt, x = 50, y = 50, scale = 1, logo = false }: { src: string; alt: string; x?: number; y?: number; scale?: number; logo?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setFrame({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (logo) return <img src={src} alt={alt} className="is-logo" />;

  const placed = placeImage(frame.w, frame.h, natural.w, natural.h, x, y, scale);
  return (
    <span ref={ref} style={{ position: "absolute", inset: 0, display: "block", overflow: "hidden" }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={(event: SyntheticEvent<HTMLImageElement>) => setNatural({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })}
        style={placed
          ? { position: "absolute", width: placed.width, height: placed.height, left: placed.left, top: placed.top, maxWidth: "none" }
          : { width: "100%", height: "100%", objectFit: "cover" }}
      />
    </span>
  );
}
