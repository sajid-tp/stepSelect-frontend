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
        <div>
          <img
            src="https://placehold.co/560x400/f2f2f2/9a9a9a?text=Sneaker"
            alt="Featured sneaker"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;