import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import StaticImage from "./StaticImage";

const SLIDE_SECONDS = 5;

const linkProps = (link) =>
  link && /^https?:\/\//i.test(link)
    ? { href: link, target: "_blank", rel: "noopener noreferrer" }
    : { href: link };

function BannerSlider() {
  const [banners, setBanners] = useState(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/banners")
      .then((res) => {
        if (!cancelled) setBanners(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = banners ? banners.length : 0;

  useEffect(() => {
    clearInterval(timer.current);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (count < 2 || paused || reduceMotion) return undefined;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_SECONDS * 1000);
    return () => clearInterval(timer.current);
  }, [count, paused]);

  const frame = "relative aspect-[7/5] w-full overflow-hidden rounded-lg bg-[#f2f2f2]";

  if (banners === null) return <div className={`${frame} animate-pulse`} />;

  if (count === 0) {
    return (
      <div className={frame}>
        <StaticImage
          src="/images/home/hero.jpg"
          alt="Featured sneaker"
          label="Step Select"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const go = (next) => setIndex((next + count) % count);

  return (
    <div
      className={frame}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      {banners.map((b, i) => {
        const slide = (
          <img
            src={b.image}
            alt={b.title}
            loading={i === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        );
        return (
          <div
            key={b.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {b.link ? (
              <a {...linkProps(b.link)} tabIndex={i === index ? 0 : -1} className="block h-full w-full">
                {slide}
              </a>
            ) : (
              slide
            )}
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg shadow transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg shadow transition hover:bg-white"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="py-10 sm:py-16">
      <div className="w-full grid grid-cols-1 items-center gap-8 px-4 sm:gap-12 sm:grid-cols-2 sm:px-6 lg:px-10">
        <div>
          <h1 className="mb-4 max-w-[11ch] text-[28px] leading-[1.1] sm:mb-5 sm:text-[38px] md:text-[44px] lg:text-[52px]">
            Step into style
          </h1>
          <p className="mb-6 max-w-[42ch] text-[14px] text-muted sm:mb-7 sm:text-[15px]">
            Curated footwear for the modern minimalist. Elevate
            your everyday with our premium selection of
            contemporary sneakers.
          </p>
          <a
            href="/shop"
            className="block w-full rounded bg-ink px-6 py-[13px] text-center text-[13px] font-semibold text-white sm:inline-block sm:w-auto"
          >
            Shop now →
          </a>
        </div>

        <BannerSlider />
      </div>
    </section>
  );
}

export default Hero;
