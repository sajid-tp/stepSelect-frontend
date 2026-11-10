import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const COUNT = 6;

const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function CuratedReleases() {
  const [products, setProducts] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get('/products', { params: { sort: 'newest', limit: COUNT } })
      .then((res) => {
        if (!cancelled) setProducts((res.data?.data?.products || []).slice(0, COUNT));
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setProducts([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (products && products.length === 0) return null;

  return (
    <section className="py-6 pb-12 sm:pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-baseline justify-between sm:mb-6">
          <h2 className="text-lg sm:text-xl">Curated releases</h2>
          <Link to="/shop" className="text-[12.5px] font-semibold underline sm:text-[13px]">View all</Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {products === null &&
            Array.from({ length: COUNT }).map((_, i) => (
              <div key={i}>
                <div className="mb-3 aspect-square w-full animate-pulse rounded-md bg-neutral-100" />
                <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
              </div>
            ))}

          {products &&
            products.map((product) => {
              const price = Number(product.price) || 0;
              const discount = Number(product.discountPercent) || 0;
              const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;
              const image = product.images?.[0];

              return (
                <Link to={`/products/${product.id}`} className="group block" key={product.id}>
                  <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md bg-neutral-100 sm:mb-3">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#f4511e] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="line-clamp-2 text-[12.5px] font-semibold leading-snug sm:text-[13px]">{product.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold sm:text-[13px]">
                    <span>{rupees(finalPrice)}</span>
                    {discount > 0 && (
                      <span className="text-[11px] font-normal text-gray-400 line-through">{rupees(price)}</span>
                    )}
                  </div>
                </Link>
              );
            })}
        </div>

        {failed && <p className="sr-only">Could not load the latest releases.</p>}
      </div>
    </section>
  );
}

export default CuratedReleases;
