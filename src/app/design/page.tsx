import type { Metadata } from "next";
import Link from "next/link";
import InteractiveChameleon from "@/components/InteractiveChameleon";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Story",
  description:
    "Chapter 01 — Character. Different by nature: an interactive portrait from the Mirage headphone concept.",
};

const WARM_WHITE = "#f3ece0";
const WARM_MUTED = "#b9b2a4";
const ACCENT = "#e5323a";

export default function DesignPage() {
  return (
    <main
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} relative min-h-screen w-full overflow-x-hidden bg-black`}
      style={{ color: WARM_WHITE }}
    >
      <header className="relative z-30 flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.42em]"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace",
            color: WARM_MUTED,
          }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-6 transition-all group-hover:w-10"
            style={{ background: ACCENT }}
          />
          Back to experience
        </Link>

        <span
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{
            fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace",
            color: WARM_MUTED,
          }}
        >
          Chapter · 01
        </span>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[1600px] grid-cols-1 items-center gap-14 px-6 pb-20 pt-6 md:grid-cols-[1fr_minmax(0,520px)_1fr] md:gap-16 md:px-10 md:pb-16 md:pt-4 lg:gap-24 lg:px-16">
        <article className="order-2 flex max-w-md flex-col md:order-1 md:ml-auto md:text-right">
          <span
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{
              fontFamily:
                "var(--font-ibm-plex-mono), ui-monospace, monospace",
              color: ACCENT,
            }}
          >
            01 · Character
          </span>

          <h2
            className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-tight"
            style={{
              fontFamily:
                "var(--font-space-grotesk), ui-sans-serif, system-ui",
              color: WARM_WHITE,
            }}
          >
            DIFFERENT BY <span style={{ color: ACCENT }}>NATURE.</span>
          </h2>

          <p
            className="mt-6 max-w-[38ch] text-[0.95rem] leading-relaxed md:ml-auto"
            style={{
              fontFamily:
                "var(--font-space-grotesk), ui-sans-serif, system-ui",
              color: WARM_MUTED,
            }}
          >
            Colour. Character. A point of view. Personal style begins with the
            details you choose to make your own.
          </p>
        </article>

        <figure className="order-1 relative mx-auto flex w-full items-center justify-center md:order-2">
          <InteractiveChameleon
            className="relative aspect-[853/1280] w-full max-w-[460px] md:max-w-none"
            alt="Portrait of a character wearing the headphones — a statement of personal style."
            sizes="(min-width: 1024px) 520px, (min-width: 768px) 40vw, 85vw"
          />
        </figure>

        <article className="order-3 flex max-w-md flex-col md:text-left">
          <span
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{
              fontFamily:
                "var(--font-ibm-plex-mono), ui-monospace, monospace",
              color: ACCENT,
            }}
          >
            02 · Frequency
          </span>

          <h2
            className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-tight"
            style={{
              fontFamily:
                "var(--font-space-grotesk), ui-sans-serif, system-ui",
              color: WARM_WHITE,
            }}
          >
            YOUR WORLD.
            <br />
            YOUR <span style={{ color: ACCENT }}>FREQUENCY.</span>
          </h2>

          <p
            className="mt-6 max-w-[38ch] text-[0.95rem] leading-relaxed"
            style={{
              fontFamily:
                "var(--font-space-grotesk), ui-sans-serif, system-ui",
              color: WARM_MUTED,
            }}
          >
            A favourite track can turn an ordinary moment into something
            personal. Give the day a rhythm of your own.
          </p>
        </article>
      </section>

      <footer
        className="flex flex-col items-center gap-6 px-6 pb-12 text-center md:px-10"
        style={{
          fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace",
        }}
      >
        <span
          aria-hidden
          className="inline-block h-px w-10"
          style={{ background: ACCENT }}
        />
        <Link
          href="/#walk"
          className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.42em] transition-colors"
          style={{ color: WARM_WHITE }}
        >
          <span style={{ color: ACCENT }}>Next</span>
          A walk, in step
          <span
            aria-hidden
            className="inline-block transition-transform group-hover:translate-x-1"
            style={{ color: ACCENT }}
          >
            →
          </span>
        </Link>
        <span
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{ color: WARM_MUTED }}
        >
          A design story
        </span>
      </footer>
    </main>
  );
}
