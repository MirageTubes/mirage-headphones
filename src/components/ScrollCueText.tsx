"use client";

import { useEffect, useState } from "react";

const PHRASES = ["PRESS PLAY.", "FIND YOUR RHYTHM.", "MOVE YOUR WAY."] as const;

type Props = {
  targetId: string;
};

export default function ScrollCueText({ targetId }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const traveled = Math.min(Math.max(vh - rect.top, 0), total);
      const progress = traveled / total;
      const next = Math.min(
        PHRASES.length - 1,
        Math.floor(progress * PHRASES.length),
      );
      setIndex(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center px-6 md:bottom-14">
      <div className="relative h-6 w-full max-w-[90vw] overflow-hidden text-center md:h-7">
        {PHRASES.map((phrase, i) => (
          <span
            key={phrase}
            aria-hidden={i !== index}
            className="absolute inset-0 flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.5em] text-[var(--foreground)]/80 transition-all duration-500 ease-out md:text-xs"
            style={{
              opacity: i === index ? 1 : 0,
              transform: `translateY(${i === index ? 0 : i < index ? -8 : 8}px)`,
            }}
          >
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}
