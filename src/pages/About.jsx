import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Static "About us" page (no API calls). Edit the text / numbers below freely.
const STATS = [
  { value: '50K+', label: 'Happy customers' },
  { value: '99%', label: 'Authenticity guaranteed' },
];

const VALUES = [
  {
    title: 'Speed',
    icon: 'fa-solid fa-bolt',
    text: 'Fast checkout, quick dispatch and delivery you can count on, so new drops reach you while they still matter.',
  },
  {
    title: 'Quality',
    icon: 'fa-solid fa-medal',
    text: 'Every pair is sourced from trusted partners and checked before it ships. No fakes, no shortcuts.',
  },
  {
    title: 'Trust',
    icon: 'fa-solid fa-shield-halved',
    text: 'Clear pricing, easy returns and honest support. We build long-term relationships with every customer.',
  },
];

function About() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="w-full flex-1">
        {/* HERO */}
        <section className="px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-14 lg:px-10">
          <nav className="mb-6 text-xs uppercase tracking-wide">
            <Link to="/" className="text-muted transition hover:text-ink">Home</Link>
            <span className="mx-2 text-muted">/</span>
            <span className="font-semibold text-ink">About us</span>
          </nav>

          <span className="inline-block rounded border border-[#f4511e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4511e]">
            Our story
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Stepping Into the Future of{' '}
            <span className="text-[#f4511e]">Sneaker Culture</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            From a small online store to a trusted destination for sneaker lovers, STEP SELECT is redefining how you
            experience footwear, with authentic pairs, honest prices and a community that lives for the next drop.
          </p>
        </section>

        {/* WHO WE ARE */}
        <section className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-14">
            {/* Image placeholder: drop a real photo at /public/images/about/store.jpg to replace it */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#2b2b2b]">
              <img
                src="/images/about/store.jpg"
                alt="Inside a STEP SELECT sneaker store"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute bottom-4 left-4 rounded bg-[#f4511e] px-3 py-2 text-[10px] font-bold uppercase leading-4 tracking-wider text-white">
                Premium sneaker
                <br />
                culture since 2024
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Who We Are</h2>
              <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
                We aren't just another sneaker store. We are curators of culture, dedicated to bringing you authentic,
                premium footwear that speaks to your personal style. Our rigorous authentication process and strong
                industry connections ensure that every pair you purchase is 100% genuine.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-3xl font-extrabold text-[#f4511e] sm:text-4xl">{stat.value}</dd>
                    <dt className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Our Values</h2>

          <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-3 sm:gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl border border-line bg-white p-6 transition hover:shadow-md">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#fdece7] text-[#f4511e]">
                  <i className={value.icon} aria-hidden="true" />
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{value.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-block rounded-md bg-[#f4511e] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#d84315]"
            >
              Shop the latest drops
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
