const perks = [
  { title: '10% off', sub: 'On your first order' },
  { title: '24h delivery', sub: 'For selected areas' },
  { title: 'Free shipping', sub: 'On orders over $100' },
  { title: 'No hassle returns', sub: '30-day return window' }
];

function Footer() {
  return (
    <footer>
      <div className="bg-accent">
        <div className="w-full grid grid-cols-2 gap-4 px-4 py-6 text-center sm:gap-5 sm:px-6 sm:py-7 sm:grid-cols-4 lg:px-10">
          {perks.map((perk) => (
            <div key={perk.title}>
              <div className="text-[12.5px] font-bold sm:text-[13.5px]">{perk.title}</div>
              <div className="mt-0.5 text-[10.5px] text-[#6b5a55] sm:text-[11.5px]">{perk.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#f7f6f4]">
        <div className="w-full grid grid-cols-2 gap-6 px-4 py-8 sm:px-6 sm:py-10 sm:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-2.5 text-sm font-bold tracking-wide">STEP SELECT</div>
            <p className="text-[11.5px] text-muted">© 2026 Step Select. All rights reserved.</p>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold">Shop</div>
            <ul className="space-y-2 text-[12.5px] text-muted">
              <li><a href="/shop">All sneakers</a></li>
              <li><a href="/shop?category=men">Men</a></li>
              <li><a href="/shop?category=women">Women</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold">Help</div>
            <ul className="space-y-2 text-[12.5px] text-muted">
              <li><a href="/shipping">Shipping</a></li>
              <li><a href="/returns">Returns</a></li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold">Contact</div>
            <ul className="space-y-2 text-[12.5px] text-muted">
              <li><a href="mailto:hello@stepselect.com">hello@stepselect.com</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;