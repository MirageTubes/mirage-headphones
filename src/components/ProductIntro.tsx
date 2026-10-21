import Image from "next/image";
import ScrollCueText from "./ScrollCueText";

export default function ProductIntro() {
  return (
    <section
      id="product-intro"
      className="relative isolate overflow-hidden bg-[#121214] text-[var(--foreground)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,50,58,0.08),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col items-center gap-10 px-6 py-20 md:grid md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16 md:px-12 md:py-28 lg:gap-24 lg:px-16">
        <div className="relative order-2 flex w-full items-center justify-center md:order-1">
          <div className="relative aspect-square w-full max-w-[640px]">
            <Image
              src="/images/headphones-transparent.png"
              alt="Wireless over-ear headphones in a transparent product render."
              fill
              priority
              sizes="(min-width: 1024px) 640px, (min-width: 768px) 50vw, 90vw"
              className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>

        <div className="relative order-1 flex w-full flex-col items-start text-left md:order-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[var(--accent)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[var(--muted)]">
              Introducing
            </span>
          </div>

          <h2
            className="mt-6 font-light leading-[0.95] tracking-tight text-[var(--foreground)]"
            style={{ fontSize: "clamp(2.5rem, 7.5vw, 6rem)" }}
          >
            YOUR SOUND.
            <br />
            YOUR <span className="text-[var(--accent)]">MOVE</span>.
          </h2>

          <p className="mt-8 max-w-[42ch] text-sm leading-relaxed text-[var(--muted)] md:text-base">
            A reference piece built for motion. Transparent in intent,
            uncompromising in detail.
          </p>
        </div>
      </div>

      <ScrollCueText targetId="product-intro" />
    </section>
  );
}
