const products = [
  { name: 'Meta Runner V2', sub: 'Every 1 model', price: '$179.00', img: 'https://placehold.co/300x260/f0f0f0/9a9a9a?text=Sneaker' },
  { name: 'Street Court Low', sub: 'Triple Black', price: '$149.00', img: 'https://placehold.co/300x260/e9e9e9/9a9a9a?text=Sneaker' },
  { name: 'Approach Lo', sub: 'Oatmeal / Chalk', price: '$159.00', img: 'https://placehold.co/300x260/f2f2f2/9a9a9a?text=Sneaker' },
  { name: 'Field High', sub: 'Pure White', price: '$189.00', img: 'https://placehold.co/300x260/eeeeee/9a9a9a?text=Sneaker' }
];

function CuratedReleases() {
  return (
    <section className="py-6 pb-12 sm:pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-baseline justify-between sm:mb-6">
          <h2 className="text-lg sm:text-xl">Curated releases</h2>
          <a href="/shop" className="text-[12.5px] font-semibold underline sm:text-[13px]">View all</a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {products.map((product) => (
            <a href="/shop" className="block" key={product.name}>
              <img
                src={product.img}
                alt={product.name}
                className="mb-2 w-full rounded-md bg-neutral-100 sm:mb-3"
              />
              <div className="text-[12.5px] font-semibold sm:text-[13.5px]">{product.name}</div>
              <div className="mb-1 text-[11px] text-muted sm:mb-1.5 sm:text-xs">{product.sub}</div>
              <div className="text-[12px] font-semibold sm:text-[13px]">{product.price}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CuratedReleases;