import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CONTACT_INFO = [
  {
    icon: 'fa-solid fa-location-dot',
    label: 'Visit our store',
    value: '123 Sneaker Street, Kochi, Kerala 682030, India',
  },
  {
    icon: 'fa-solid fa-phone',
    label: 'Direct line',
    value: '+91 98765 43210',
    sub: 'Mon to Fri, 9am to 6pm IST',
  },
  {
    icon: 'fa-solid fa-envelope',
    label: 'Email support',
    value: 'hello@stepselect.com',
    href: 'mailto:hello@stepselect.com',
  },
];

const EMPTY = { name: '', email: '', subject: '', message: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name';
  if (!values.email.trim()) errors.email = 'Please enter your email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address';
  if (!values.subject.trim()) errors.subject = 'Please enter a subject';
  if (!values.message.trim()) errors.message = 'Please write a message';
  return errors;
}

const inputClass = (hasError) =>
  `w-full rounded-md border bg-white px-4 py-3 text-sm outline-none transition focus:border-ink ${
    hasError ? 'border-red-400' : 'border-line'
  }`;

function Field({ label, name, error, children }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSent(true);
    setValues(EMPTY);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="w-full flex-1">
        <section className="px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-14 lg:px-10">
          <nav className="mb-6 text-xs uppercase tracking-wide">
            <Link to="/" className="text-muted transition hover:text-ink">Home</Link>
            <span className="mx-2 text-muted">/</span>
            <span className="font-semibold text-ink">Contact</span>
          </nav>

          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4511e]">Get in touch</span>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            We're Here to <span className="text-[#f4511e]">Help You.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted sm:text-base">
            Have a question about a product or an order? Our team is ready to help. Send us a message and we'll reply
            as soon as we can.
          </p>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-10">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-xl border border-line bg-white md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="border-b border-line bg-[#fafafa] p-6 sm:p-8 md:border-b-0 md:border-r">
              <h2 className="text-lg font-extrabold text-ink">Contact Information</h2>
              <p className="mt-1 text-sm text-muted">Reach us any way you like. We usually reply within 24 hours.</p>

              <ul className="mt-6 space-y-5">
                {CONTACT_INFO.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fdece7] text-sm text-[#f4511e]">
                      <i className={item.icon} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="break-words text-sm font-semibold text-ink hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="break-words text-sm font-semibold text-ink">{item.value}</p>
                      )}
                      {item.sub && <p className="text-xs text-muted">{item.sub}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-line pt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted">Follow us</p>
                <div className="flex gap-2">
                  {[
                    ['fa-brands fa-instagram', 'Instagram'],
                    ['fa-brands fa-x-twitter', 'X'],
                    ['fa-brands fa-facebook-f', 'Facebook'],
                    ['fa-brands fa-youtube', 'YouTube'],
                  ].map(([icon, label]) => (
                    <span
                      key={label}
                      title={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-sm text-ink"
                    >
                      <i className={icon} aria-hidden="true" />
                      <span className="sr-only">{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-extrabold text-ink">Send a Message</h2>

              {sent ? (
                <div
                  role="status"
                  className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"
                >
                  <p className="font-bold">Thanks for reaching out!</p>
                  <p className="mt-1">Your message has been received. Our team will get back to you shortly.</p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-3 text-xs font-semibold underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" name="name" error={errors.name}>
                      <input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputClass(errors.name)}
                      />
                    </Field>

                    <Field label="Email address" name="email" error={errors.email}>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass(errors.email)}
                      />
                    </Field>
                  </div>

                  <Field label="Subject" name="subject" error={errors.subject}>
                    <input
                      id="subject"
                      name="subject"
                      value={values.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className={inputClass(errors.subject)}
                    />
                  </Field>

                  <Field label="Message" name="message" error={errors.message}>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={values.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className={`${inputClass(errors.message)} resize-y`}
                    />
                  </Field>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white transition hover:bg-[#d84315]"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
