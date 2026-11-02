import { Link } from 'react-router-dom';
import StaticImage from './StaticImage';

// Pictures are fixed files in /public/images/home/types (see the README in that folder)
const types = [
  { label: 'Sneakers', color: '#dce8f0', img: '/images/home/types/sneakers.jpg' },
  { label: 'Running', color: '#f6dde0', img: '/images/home/types/running.jpg' },
  { label: 'Casual', color: '#f7ecd2', img: '/images/home/types/casual.jpg' },
  { label: 'Formal', color: '#e6d9cd', img: '/images/home/types/formal.jpg' },
  { label: 'Boots', color: '#dfe8dd', img: '/images/home/types/boots.jpg' }
];

function ShopByType() {
  return (
    <section className="py-8 pb-12 text-center sm:py-10 sm:pb-14">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <h2 className="mb-6 text-lg sm:mb-8 sm:text-xl">Shop by type</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:grid-cols-5">
          {types.map((type) => (
            // /shop?category=sneakers opens Shop with the "Sneakers" category ticked
            <Link
              to={`/shop?category=${encodeURIComponent(type.label.toLowerCase())}`}
              className="group flex flex-col items-center gap-2 sm:gap-3"
              key={type.label}
            >
              <div
                className="aspect-square w-full overflow-hidden rounded-md"
                style={{ background: type.color }}
              >
                <StaticImage
                  src={type.img}
                  alt={type.label}
                  label=""
                  fallbackClassName="bg-transparent"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-[10.5px] font-semibold tracking-wide text-muted sm:text-[11.5px]">
                {type.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopByType;
