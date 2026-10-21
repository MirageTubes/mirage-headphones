"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import {
  CHAMELEON_EYES,
  CHAMELEON_HEAD,
  CHAMELEON_SIZE,
} from "@/lib/chameleonEyes";
import { createHeadWarp, type HeadPose, type HeadWarp } from "@/lib/headWarp";

/* ---- Eyes ---------------------------------------------------------------- */
/** Max iris travel as a fraction of the iris radius (elliptical: wide, short). */
const EYE_MAX_X = 0.17;
const EYE_MAX_Y = 0.07;
/** Cursor distance (CSS px) from an eye at which it reaches full deflection. */
const EYE_REACH_PX = 280;
/** Smoothing rate (per second). Eyes are quick… */
const EYE_EASE = 8;

/* ---- Head ---------------------------------------------------------------- */
/** Max head travel in source-image px and max tilt in degrees. */
const HEAD_MAX_X = 14;
const HEAD_MAX_Y = 9;
const HEAD_MAX_ROT_DEG = 3.5;
/** Cursor distance (CSS px) from the head at which it reaches full turn. */
const HEAD_REACH_PX = 480;
/** …the head follows more slowly, so the eyes lead. */
const HEAD_EASE = 4.5;
/** Room (image px) around the picture for the head to move into. */
const HEAD_MARGIN = 70;

type Props = {
  src?: string;
  alt: string;
  sizes?: string;
  className?: string;
};

const DEG = Math.PI / 180;

export default function InteractiveChameleon({
  src = "/images/design-character.jpg",
  alt,
  sizes,
  className,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const irisRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    const headGroup = headRef.current;
    if (!box || !canvas || !svg || !headGroup) return;

    const { w: W, h: H } = CHAMELEON_SIZE;
    const { pivot } = CHAMELEON_HEAD;
    const pointer = { x: 0, y: 0, active: false };
    const eyes = CHAMELEON_EYES.map(() => ({ x: 0, y: 0 }));
    const head: HeadPose = { tx: 0, ty: 0, rot: 0 };
    let warp: HeadWarp | null = null;
    let raf = 0;
    let last = 0;
    let enabled = false;
    let disposed = false;
    let eyesReady = false;

    /* Contained-image geometry relative to the box (object-fit: contain). */
    const fit = () => {
      const r = box.getBoundingClientRect();
      const s = Math.min(r.width / W, r.height / H);
      return {
        s,
        left: (r.width - W * s) / 2,
        top: (r.height - H * s) / 2,
        rect: r,
      };
    };

    const layoutCanvas = () => {
      if (!warp) return;
      const { s, left, top } = fit();
      const m = HEAD_MARGIN * s;
      canvas.style.left = `${left - m}px`;
      canvas.style.top = `${top - m}px`;
      canvas.style.width = `${W * s + 2 * m}px`;
      canvas.style.height = `${H * s + 2 * m}px`;
      warp.resize(
        W * s + 2 * m,
        H * s + 2 * m,
        Math.min(window.devicePixelRatio || 1, 2),
      );
      warp.render(head);
    };

    /** Head transform applied to an image-space point. */
    const headPoint = (x: number, y: number) => {
      const c = Math.cos(head.rot);
      const sn = Math.sin(head.rot);
      const qx = x - pivot.x;
      const qy = y - pivot.y;
      return {
        x: c * qx - sn * qy + pivot.x + head.tx,
        y: sn * qx + c * qy + pivot.y + head.ty,
      };
    };

    const applyHead = () => {
      headGroup.setAttribute(
        "transform",
        `translate(${head.tx.toFixed(3)} ${head.ty.toFixed(3)}) rotate(${(
          head.rot / DEG
        ).toFixed(4)} ${pivot.x} ${pivot.y})`,
      );
      warp?.render(head);
    };

    const applyEye = (i: number) => {
      const e = eyes[i];
      irisRefs.current[i]?.setAttribute(
        "transform",
        `translate(${e.x.toFixed(3)} ${e.y.toFixed(3)})`,
      );
    };

    const tick = (t: number) => {
      raf = 0;
      const dt = Math.min(0.1, Math.max(0.001, (t - last) / 1000));
      last = t;
      const { s, left, top, rect } = fit();
      const ox = rect.left + left;
      const oy = rect.top + top;
      let moving = false;

      const ease = (cur: number, target: number, rate: number) => {
        const next = cur + (target - cur) * (1 - Math.exp(-rate * dt));
        if (Math.abs(target - next) > 0.005) {
          moving = true;
          return next;
        }
        return target;
      };

      /* Head: aims from its rest position so it never chases itself. */
      let htx = 0;
      let hty = 0;
      let hrot = 0;
      if (pointer.active && warp && s > 0) {
        const dx = pointer.x - (ox + CHAMELEON_HEAD.center.x * s);
        const dy = pointer.y - (oy + CHAMELEON_HEAD.center.y * s);
        const d = Math.hypot(dx, dy);
        if (d > 0.5) {
          const k = Math.min(1, d / HEAD_REACH_PX);
          const ux = dx / d;
          const uy = dy / d;
          htx = ux * HEAD_MAX_X * k;
          hty = uy * HEAD_MAX_Y * k;
          hrot = ux * HEAD_MAX_ROT_DEG * DEG * k;
        }
      }
      head.tx = ease(head.tx, htx, HEAD_EASE);
      head.ty = ease(head.ty, hty, HEAD_EASE);
      head.rot = ease(head.rot / DEG, hrot / DEG, HEAD_EASE) * DEG;
      applyHead();

      /* Eyes: measured from where each eye currently is on the moved head. */
      CHAMELEON_EYES.forEach((eye, i) => {
        let tx = 0;
        let ty = 0;
        if (pointer.active && s > 0) {
          const c = headPoint(eye.cx, eye.cy);
          const dx = pointer.x - (ox + c.x * s);
          const dy = pointer.y - (oy + c.y * s);
          const d = Math.hypot(dx, dy);
          if (d > 0.5) {
            const k = Math.min(1, d / EYE_REACH_PX);
            // Unit direction scaled onto an ellipse => always inside the socket.
            tx = (dx / d) * EYE_MAX_X * eye.r * k;
            ty = (dy / d) * EYE_MAX_Y * eye.r * k;
          }
        }
        eyes[i].x = ease(eyes[i].x, tx, EYE_EASE);
        eyes[i].y = ease(eyes[i].y, ty, EYE_EASE);
        applyEye(i);
      });

      if (moving && !disposed) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      kick();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return; // still inside the page
      pointer.active = false;
      kick();
    };
    const onBlur = () => {
      pointer.active = false;
      kick();
    };
    const onScroll = () => {
      if (pointer.active) kick();
    };
    const ro = new ResizeObserver(() => {
      layoutCanvas();
      if (pointer.active) kick();
    });

    const stopWarp = () => {
      warp?.dispose();
      warp = null;
      canvas.style.opacity = "0";
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      stopWarp();
      head.tx = head.ty = head.rot = 0;
      applyHead();
    };

    const startWarp = () => {
      const img = new window.Image();
      img.src = src;
      img
        .decode()
        .then(() => {
          if (disposed || !enabled || warp) return;
          warp = createHeadWarp(canvas, img, {
            width: W,
            height: H,
            pivot: CHAMELEON_HEAD.pivot,
            fadeStart: CHAMELEON_HEAD.fadeStart,
            fadeEnd: CHAMELEON_HEAD.fadeEnd,
            margin: HEAD_MARGIN,
          });
          if (!warp) return; // No WebGL: eyes still track, head stays still.
          layoutCanvas();
          canvas.style.opacity = "1";
          kick();
        })
        .catch(() => {
          /* Head motion is optional; the still image remains. */
        });
    };

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const enable = () => {
      enabled = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onLeave);
      window.addEventListener("blur", onBlur);
      window.addEventListener("scroll", onScroll, { passive: true });
      canvas.addEventListener("webglcontextlost", onContextLost);
      ro.observe(box);
      startWarp();
    };
    const disable = () => {
      enabled = false;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      pointer.active = false;
      stopWarp();
      head.tx = head.ty = head.rot = 0;
      applyHead();
      eyes.forEach((e, i) => {
        e.x = 0;
        e.y = 0;
        applyEye(i);
      });
    };
    const sync = () => {
      const want = eyesReady && fine.matches && !reduce.matches;
      if (want && !enabled) enable();
      else if (!want && enabled) disable();
    };
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);

    // Reveal the eye layers only once every asset is decoded, so a partial
    // load can never show an empty socket or a doubled pupil.
    const urls = CHAMELEON_EYES.flatMap((e) => [e.socket.src, e.iris.src]);
    Promise.all(
      urls.map((u) => {
        const img = new window.Image();
        img.src = u;
        return img.decode();
      }),
    )
      .then(() => {
        if (disposed) return;
        svg.style.opacity = "1";
        eyesReady = true;
        sync();
      })
      .catch(() => {
        /* Assets failed: leave the untouched original image showing. */
      });

    return () => {
      disposed = true;
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      disable();
    };
  }, [src]);

  const { w: W, h: H } = CHAMELEON_SIZE;

  return (
    <div ref={boxRef} className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        preload
        sizes={sizes}
        className="object-contain"
      />
      {/* Warped copy of the image for head motion (desktop pointers only). */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ opacity: 0 }}
      />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-visible"
        style={{ opacity: 0 }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${uid}-feather`}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          {CHAMELEON_EYES.map((eye) => (
            <mask
              key={eye.id}
              id={`${uid}-${eye.id}`}
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={W}
              height={H}
            >
              <path
                d={eye.opening}
                fill="#fff"
                filter={`url(#${uid}-feather)`}
              />
            </mask>
          ))}
        </defs>

        {/* Moves rigidly with the head so the eyes stay seated in it. */}
        <g ref={headRef}>
          {CHAMELEON_EYES.map((eye, i) => (
            <g key={eye.id} mask={`url(#${uid}-${eye.id})`}>
              {/* Clean socket hides the original iris & pupil. */}
              <image
                href={eye.socket.src}
                x={eye.socket.x}
                y={eye.socket.y}
                width={eye.socket.w}
                height={eye.socket.h}
                preserveAspectRatio="none"
              />
              {/* Moving iris/pupil; clipped by the opening so lids stay in front. */}
              <g
                ref={(el) => {
                  irisRefs.current[i] = el;
                }}
              >
                <image
                  href={eye.iris.src}
                  x={eye.iris.x}
                  y={eye.iris.y}
                  width={eye.iris.w}
                  height={eye.iris.h}
                  preserveAspectRatio="none"
                />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
