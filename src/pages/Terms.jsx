import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    title: 'Introduction',
    body: [
      'Welcome to STEP SELECT. These terms and conditions govern your use of our website and the purchase of products from us. By accessing or using STEP SELECT, you confirm that you have read, understood and agree to be bound by all of the terms and conditions stated on this page.',
    ],
  },
  {
    title: 'Use of Website',
    body: [
      'By using our website you warrant that you are at least 18 years old, or that you have the consent of a parent or guardian, and that you have the legal capacity to enter into a binding agreement.',
      'You must provide accurate information when creating an account and keep your login details confidential. You may not use the website for any unlawful purpose, attempt to gain unauthorised access to any part of it, or interfere with its normal operation. We may suspend or block accounts that breach these terms.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'Unless otherwise stated, STEP SELECT and its licensors own all intellectual property rights in the website and its content, including text, graphics, logos and images. All rights are reserved.',
      'You may view and print pages from the website for your own personal use, subject to the restrictions in these terms. You must not republish, sell, rent or sub-license material from the website, or reproduce, duplicate or copy it for commercial purposes.',
    ],
  },
  {
    title: 'Privacy Policy',
    body: [
      'Your privacy is important to us. We collect and use your personal information, such as your name, email address, delivery addresses and order history, only to run your account, process orders and improve our service.',
      'We do not sell your personal information. We share it only with partners that help us deliver your order or take payments, and where the law requires it. By using the website you consent to this use of your information.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, STEP SELECT, its officers, directors and employees will not be liable for any indirect, incidental or consequential damages arising from your use of the website or from products purchased through it.',
      'Nothing in these terms limits any liability that cannot be excluded by law, including your statutory consumer rights.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These terms are governed by and interpreted in accordance with the laws of India. Any dispute relating to these terms or your use of the website is subject to the exclusive jurisdiction of the courts of India.',
      'We may update these terms from time to time. The version published on this page applies each time you use the website, so please check it regularly.',
    ],
  },
];

function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="w-full flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 text-xs uppercase tracking-wide">
            <Link to="/" className="text-muted transition hover:text-ink">Home</Link>
            <span className="mx-2 text-muted">/</span>
            <span className="font-semibold text-ink">Terms &amp; Conditions</span>
          </nav>

          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Terms &amp; <span className="text-[#f4511e]">Conditions</span>
          </h1>
          <p className="mt-3 text-sm text-muted">Please read these terms carefully before creating an account.</p>

          <div className="mt-8 space-y-8 border-t border-line pt-8">
            {SECTIONS.map((section, index) => (
              <section key={section.title}>
                <h2 className="text-base font-extrabold text-ink sm:text-lg">
                  {index + 1}. {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="mt-2 text-sm leading-7 text-muted sm:text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
            <Link
              to="/signup"
              className="rounded-md bg-[#f4511e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d84315]"
            >
              Back to sign up
            </Link>
            <Link to="/contact" className="text-sm font-semibold underline">
              Questions? Contact us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Terms;
