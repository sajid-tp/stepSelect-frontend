function Footer() {
  return (
    <footer>
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
              <li><a href="/about">About us</a></li>
              <li><a href="/contact">Contact us</a></li>
              <li><a href="/terms">Terms &amp; Conditions</a></li>
              <li><a href="mailto:hello@stepselect.com">hello@stepselect.com</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;