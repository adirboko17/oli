"use client";

import { useLayoutEffect, useRef, useState, type SyntheticEvent } from "react";

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

function rememberSize(image: HTMLImageElement) {
  if (!image.complete || !image.naturalWidth) return null;
  return { w: image.naturalWidth, h: image.naturalHeight };
}

export function FramedPhoto({ src, alt, x = 50, y = 50, scale = 1, logo = false }: { src: string; alt: string; x?: number; y?: number; scale?: number; logo?: boolean }) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const measure = () => {
      const next = { w: node.clientWidth, h: node.clientHeight };
      setFrame((current) => (current.w === next.w && current.h === next.h ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    setNatural(imageRef.current ? rememberSize(imageRef.current) ?? { w: 0, h: 0 } : { w: 0, h: 0 });
    return () => observer.disconnect();
  }, [src]);

  function onLoad(event: SyntheticEvent<HTMLImageElement>) {
    const ready = rememberSize(event.currentTarget);
    if (ready) setNatural(ready);
  }

  if (logo) return <img src={src} alt={alt} className="is-logo" />;

  const placed = placeImage(frame.w, frame.h, natural.w, natural.h, x, y, scale);
  return (
    <span ref={frameRef} style={{ position: "absolute", inset: 0, display: "block", overflow: "hidden" }}>
      <img
        ref={imageRef}
        className="oa-frame__img"
        src={src}
        alt={alt}
        onLoad={onLoad}
        style={placed
          ? { position: "absolute", width: placed.width, height: placed.height, left: placed.left, top: placed.top, maxWidth: "none" }
          : { position: "absolute", width: 0, height: 0, opacity: 0 }}
      />
    </span>
  );
}
