import Link from "next/link";
import ProductIntro from "@/components/ProductIntro";
import ScrollWalk from "@/components/ScrollWalk";

export default function Home() {
  return (
    <main className="relative bg-[var(--background)] text-[var(--foreground)]">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-12 lg:px-16">
        <span className="pointer-events-none text-[10px] font-semibold uppercase tracking-[0.5em] text-[var(--foreground)]/70">
          Mirage
        </span>
        <Link
          href="/design"
          className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.42em] text-[var(--foreground)]/70 transition-colors hover:text-[var(--foreground)]"
        >
          Design story
          <span
            aria-hidden
            className="inline-block h-px w-6 bg-[var(--accent)] transition-all group-hover:w-10"
          />
        </Link>
      </header>

      <section className="relative flex min-h-[100svh] flex-col px-6 pb-16 pt-24 md:px-12 md:pb-20 md:pt-28 lg:px-16">
        <div
          className="hero-rise flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-[var(--muted)]"
          style={{ animationDelay: "0ms" }}
        >
          <span>Field notes · N° 01</span>
          <span className="hidden sm:inline">An independent concept</span>
        </div>

        <div className="mt-14 grid w-full gap-10 md:mt-20 md:grid-cols-12 md:items-end md:gap-12">
          <p
            className="font-light leading-[0.98] tracking-[-0.025em] md:col-span-8"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)" }}
          >
            {[
              { text: <>The city hums</>, delay: 120 },
              { text: <>in one key.</>, delay: 240 },
              {
                text: (
                  <>
                    You walk in{" "}
                    <span className="text-[var(--accent)]">yours</span>.
                  </>
                ),
                delay: 380,
              },
            ].map((line, i) => (
              <span
                key={i}
                className="-mb-[0.12em] block overflow-hidden pb-[0.12em]"
              >
                <span
                  className="hero-line block"
                  style={{ animationDelay: `${line.delay}ms` }}
                >
                  {line.text}
                </span>
              </span>
            ))}
          </p>

          <div className="md:col-span-4 md:pb-4">
            <p
              className="hero-rise max-w-[38ch] text-sm leading-relaxed text-[var(--muted)] md:text-[0.95rem]"
              style={{ animationDelay: "650ms" }}
            >
              Made for the space between places — the crosswalk, the long way
              home, the friend who never misses a step. Open when you want the
              world in. Quiet when you don&rsquo;t.
            </p>
            <ol
              className="hero-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.36em] text-[var(--foreground)]/60"
              style={{ animationDelay: "800ms" }}
            >
              <li>
                <span className="mr-2 text-[var(--accent)]">01</span>Listen
              </li>
              <li>
                <span className="mr-2 text-[var(--accent)]">02</span>Move
              </li>
              <li>
                <span className="mr-2 text-[var(--accent)]">03</span>Belong
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center pt-20 text-center">
          <div
            className="hero-rise h-px w-10 bg-[var(--accent)]"
            style={{ animationDelay: "950ms" }}
          />
          <h1
            className="hero-rise mt-8 max-w-[22ch] text-balance font-light leading-[1.05] tracking-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              animationDelay: "1050ms",
            }}
          >
            A walk, in step.
          </h1>
          <p
            className="hero-rise mt-8 text-[10px] uppercase tracking-[0.42em] text-[var(--muted)]"
            style={{ animationDelay: "1200ms" }}
          >
            Scroll to walk
          </p>
        </div>
      </section>

      <ProductIntro />

      <div id="walk">
        <ScrollWalk
          basePath="/images/walk-sequence/ezgif-frame-"
          pad={3}
          ext=".webp"
          frameCount={300}
          frameWidth={1920}
          frameHeight={1080}
          scrollLengthVh={450}
          staticFrame={150}
        />
      </div>

      <footer className="relative px-6 pb-12 pt-10 text-center text-[10px] uppercase tracking-[0.42em] text-[var(--muted)]/70">
        Companions in sound
      </footer>
    </main>
  );
}
