const categories = [
  { label: 'Men', sub: 'Shop the collection', img: 'https://placehold.co/560x420/4a4a4a/e5e5e5?text=Men' },
  { label: 'Women', sub: 'Shop the collection', img: 'https://placehold.co/560x420/8a8a8a/e5e5e5?text=Women' }
];

function CategoryBanner() {
  return (
    <section className="py-6 pb-10 sm:pb-14">
      <div className="w-full grid grid-cols-1 gap-4 px-4 sm:gap-5 sm:grid-cols-2 sm:px-6 lg:px-10">
        {categories.map((cat) => (
          <a
            href={`/shop?category=${cat.label.toLowerCase()}`}
            className="group relative block overflow-hidden rounded-lg"
            key={cat.label}
          >
            <img
              src={cat.img}
              alt={cat.label}
              className="h-[220px] w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-[280px] lg:h-[340px]"
            />
            <div className="absolute bottom-4 left-4 flex flex-col text-white sm:bottom-6 sm:left-6">
              <span className="text-[18px] font-bold sm:text-[20px] lg:text-[22px]">{cat.label}</span>
              <span className="text-[11.5px] opacity-85 sm:text-[12.5px]">{cat.sub}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default CategoryBanner;