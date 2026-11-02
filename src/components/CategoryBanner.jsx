import { Link } from 'react-router-dom';
import StaticImage from './StaticImage';

// Pictures are fixed files in /public/images/home (see the README in that folder)
// `gender` is the value the Shop page filter understands: /shop?gender=men opens Shop with "Men" ticked
const categories = [
  { label: 'Men', gender: 'men', sub: 'Shop the collection', img: '/images/home/men.jpg' },
  { label: 'Women', gender: 'women', sub: 'Shop the collection', img: '/images/home/women.jpg' }
];

function CategoryBanner() {
  return (
    <section className="py-6 pb-10 sm:pb-14">
      <div className="w-full grid grid-cols-1 gap-4 px-4 sm:gap-5 sm:grid-cols-2 sm:px-6 lg:px-10">
        {categories.map((cat) => (
          <Link
            to={`/shop?gender=${cat.gender}`}
            className="group relative block overflow-hidden rounded-lg"
            key={cat.label}
          >
            <StaticImage
              src={cat.img}
              alt={cat.label}
              label={cat.label}
              fallbackClassName="bg-[#4a4a4a] text-white/60"
              className="h-[220px] w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-[280px] lg:h-[340px]"
            />
            {/* soft dark fade so the white text reads on any picture */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-col text-white sm:bottom-6 sm:left-6">
              <span className="text-[18px] font-bold sm:text-[20px] lg:text-[22px]">{cat.label}</span>
              <span className="text-[11.5px] opacity-85 sm:text-[12.5px]">{cat.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryBanner;
