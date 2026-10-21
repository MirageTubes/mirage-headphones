"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollWalkProps = {
  /** URL prefix for a numbered frame. Index is appended, zero-padded. */
  basePath: string;
  /** Zero-padding width for the frame number. */
  pad?: number;
  /** File extension including the dot. */
  ext?: string;
  frameCount: number;
  /** Native frame dimensions in px. */
  frameWidth: number;
  frameHeight: number;
  /** How many viewport heights the sticky section occupies. */
  scrollLengthVh?: number;
  /** Max decoded frames held in memory at once (desktop). */
  cacheSize?: number;
  /** Max simultaneous image loads (desktop). */
  loadConcurrency?: number;
  /** Max decoded frames held in memory at once (narrow viewports). */
  mobileCacheSize?: number;
  /** Max simultaneous image loads (narrow viewports). */
  mobileLoadConcurrency?: number;
  /** Decoded width for frames on narrow viewports (0 disables resize). */
  mobileDecodeWidth?: number;
  /** Which frame to show in reduced-motion mode. */
  staticFrame?: number;
  /**
   * Normalized bounding box of the character inside each frame.
   * Scale/position math fits this bbox into the viewport so the subject
   * is always prominent and feet aren't cropped on any viewport.
   */
  characterBbox?: { cx: number; cy: number; w: number; h: number };
  className?: string;
  ariaLabel?: string;
};

const DEFAULT_BBOX = { cx: 0.4, cy: 0.5, w: 0.72, h: 0.96 };

export default function ScrollWalk({
  basePath,
  pad = 3,
  ext = ".png",
  frameCount,
  frameWidth,
  frameHeight,
  scrollLengthVh = 420,
  cacheSize = 36,
  loadConcurrency = 4,
  /** Narrow-viewport overrides for memory-constrained devices. */
  mobileCacheSize = 16,
  mobileLoadConcurrency = 2,
  /** Resize width for decoded frames on narrow viewports. 0 = no resize. */
  mobileDecodeWidth = 1024,
  staticFrame,
  characterBbox = DEFAULT_BBOX,
  className,
  ariaLabel = "Scroll-driven walking animation",
}: ScrollWalkProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerLayerRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fh = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setReducedMotion(rm.matches);
      setFineHover(fh.matches);
    };
    sync();
    rm.addEventListener("change", sync);
    fh.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      fh.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const srcFor = (f: number) =>
      `${basePath}${String(f).padStart(pad, "0")}${ext}`;

    // Narrow viewports get a smaller cache, lower concurrency, and smaller
    // decoded bitmaps to keep memory usable on phones.
    const narrow = window.innerWidth < 768;
    const effCacheSize = narrow
      ? Math.min(cacheSize, mobileCacheSize)
      : cacheSize;
    const effConcurrency = narrow
      ? Math.min(loadConcurrency, mobileLoadConcurrency)
      : loadConcurrency;
    const resizeW =
      narrow && mobileDecodeWidth > 0 ? mobileDecodeWidth : 0;
    const canResize =
      resizeW > 0 && typeof window.createImageBitmap === "function";

    type Decoded = HTMLImageElement | ImageBitmap;
    const isBitmap = (v: Decoded): v is ImageBitmap =>
      typeof ImageBitmap !== "undefined" && v instanceof ImageBitmap;

    // Bounded LRU cache keyed by frame index. Map insertion order IS LRU order:
    // delete + set to touch, and shift the oldest when over capacity.
    const cache = new Map<number, Decoded>();
    const inflight = new Set<number>();
    const failed = new Set<number>();
    let queue: number[] = [];
    let targetFrame = reducedMotion
      ? staticFrame ?? Math.round(frameCount / 2)
      : 1;
    let lastDrawnFrame = -1;
    let drawRaf: number | null = null;
    let disposed = false;

    const releaseDecoded = (v: Decoded) => {
      if (isBitmap(v)) {
        try {
          v.close();
        } catch {
          /* ignore */
        }
      }
    };

    const touchCache = (f: number, img: Decoded) => {
      if (cache.has(f)) cache.delete(f);
      cache.set(f, img);
      while (cache.size > effCacheSize) {
        let evicted = false;
        for (const key of cache.keys()) {
          if (key === targetFrame) continue;
          const victim = cache.get(key)!;
          cache.delete(key);
          releaseDecoded(victim);
          evicted = true;
          break;
        }
        if (!evicted) break;
      }
    };

    const buildQueue = (center: number) => {
      const q: number[] = [];
      const push = (f: number) => {
        if (
          f >= 1 &&
          f <= frameCount &&
          !cache.has(f) &&
          !inflight.has(f) &&
          !failed.has(f)
        ) {
          q.push(f);
        }
      };
      push(center);
      for (let d = 1; d < frameCount; d++) {
        push(center - d);
        push(center + d);
      }
      return q;
    };

    const loadWithBitmap = async (f: number) => {
      const resp = await fetch(srcFor(f));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const resizeH = Math.round((resizeW * frameHeight) / frameWidth);
      return await window.createImageBitmap(blob, {
        resizeWidth: resizeW,
        resizeHeight: resizeH,
        resizeQuality: "high",
      });
    };

    const loadWithImage = (f: number) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image load failed"));
        img.src = srcFor(f);
      });

    const scheduleLoads = () => {
      while (inflight.size < effConcurrency && queue.length > 0) {
        const f = queue.shift()!;
        if (cache.has(f) || inflight.has(f) || failed.has(f)) continue;
        inflight.add(f);
        const settle = (decoded: Decoded) => {
          if (disposed) {
            releaseDecoded(decoded);
            return;
          }
          inflight.delete(f);
          touchCache(f, decoded);
          setReady(true);
          if (f === targetFrame) scheduleDraw();
          scheduleLoads();
        };
        const fail = () => {
          if (disposed) return;
          inflight.delete(f);
          failed.add(f);
          setFailCount(failed.size);
          scheduleLoads();
        };
        if (canResize) {
          loadWithBitmap(f)
            .then(settle)
            .catch(() => {
              // Fall back to <img> if ImageBitmap resize fails for this blob.
              loadWithImage(f).then(settle).catch(fail);
            });
        } else {
          loadWithImage(f).then(settle).catch(fail);
        }
      }
    };

    const rebuildQueue = () => {
      queue = buildQueue(targetFrame);
      scheduleLoads();
    };

    const draw = () => {
      let img: Decoded | undefined = cache.get(targetFrame);
      let drawn = targetFrame;
      if (!img) {
        // Keep the last available frame visible: pick nearest cached frame.
        let bestD = Infinity;
        let best: Decoded | undefined;
        for (const [f, i] of cache) {
          const d = Math.abs(f - targetFrame);
          if (d < bestD) {
            bestD = d;
            best = i;
            drawn = f;
          }
        }
        if (!best) return;
        img = best;
      }
      if (drawn === lastDrawnFrame) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      const bw = Math.round(cssW * dpr);
      const bh = Math.round(cssH * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Clear so transparent PNGs don't leave trails.
      ctx.clearRect(0, 0, cssW, cssH);

      // Fit character bbox into viewport. Horizontally center the character,
      // vertically anchor so feet land just above the viewport bottom.
      const scale = Math.min(
        cssW / (characterBbox.w * frameWidth),
        cssH / (characterBbox.h * frameHeight),
      );
      const dw = frameWidth * scale;
      const dh = frameHeight * scale;
      const dx = Math.round(cssW / 2 - characterBbox.cx * dw);
      const feetY = characterBbox.cy + characterBbox.h / 2;
      const dy = Math.round(cssH * 0.96 - feetY * dh);
      ctx.drawImage(img, dx, dy, dw, dh);
      lastDrawnFrame = drawn;
    };

    const scheduleDraw = () => {
      if (drawRaf != null) return;
      drawRaf = requestAnimationFrame(() => {
        drawRaf = null;
        draw();
      });
    };

    const onScroll = () => {
      if (reducedMotion) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      // scrolled increases as the section leaves the top of the viewport;
      // clamped to [0, 1] so the first and last frames hold at endpoints.
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      const next = Math.round(1 + p * (frameCount - 1));
      if (next === targetFrame) return;
      targetFrame = next;
      rebuildQueue();
      scheduleDraw();
    };

    const onResize = () => {
      lastDrawnFrame = -1;
      onScroll();
      scheduleDraw();
    };

    rebuildQueue();
    scheduleDraw();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (drawRaf != null) cancelAnimationFrame(drawRaf);
      // Release any decoded ImageBitmaps to free GPU memory.
      for (const v of cache.values()) releaseDecoded(v);
      cache.clear();
    };
  }, [
    reducedMotion,
    frameCount,
    frameWidth,
    frameHeight,
    cacheSize,
    loadConcurrency,
    mobileCacheSize,
    mobileLoadConcurrency,
    mobileDecodeWidth,
    staticFrame,
    characterBbox.cx,
    characterBbox.cy,
    characterBbox.w,
    characterBbox.h,
    basePath,
    pad,
    ext,
  ]);

  // Pointer-follow effect, kept entirely separate from the walking animation.
  useEffect(() => {
    if (reducedMotion || !fineHover) return;
    const layer = pointerLayerRef.current;
    if (!layer) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf: number | null = null;

    const tick = () => {
      raf = null;
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      layer.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      targetX = ((e.clientX - w / 2) / (w / 2)) * 8;
      targetY = ((e.clientY - h / 2) / (h / 2)) * 8;
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf != null) cancelAnimationFrame(raf);
      layer.style.transform = "";
    };
  }, [reducedMotion, fineHover]);

  const sectionHeight = reducedMotion ? "100vh" : `${scrollLengthVh}vh`;
  const tooManyFailed = failCount > frameCount * 0.3;

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{ position: "relative", height: sectionHeight }}
      aria-label={ariaLabel}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          ref={pointerLayerRef}
          className="absolute inset-0 will-change-transform"
        >
          <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
        {!ready && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.42em] text-[var(--muted)]">
              Loading
            </span>
          </div>
        )}
        {tooManyFailed && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-6 py-2 text-center text-[10px] uppercase tracking-[0.42em] text-[var(--accent)]">
            Some frames couldn&apos;t load
          </div>
        )}
      </div>
    </section>
  );
}
