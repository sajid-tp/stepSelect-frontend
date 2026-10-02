const types = [
  { label: 'Sneakers', color: '#dce8f0' },
  { label: 'Running', color: '#f6dde0' },
  { label: 'Casual', color: '#f7ecd2' },
  { label: 'Formal', color: '#e6d9cd' },
  { label: 'Boots', color: '#dfe8dd' }
];

function ShopByType() {
  return (
    <section className="py-8 pb-12 text-center sm:py-10 sm:pb-14">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <h2 className="mb-6 text-lg sm:mb-8 sm:text-xl">Shop by type</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:grid-cols-5">
          {types.map((type) => (
            <a
              href={`/shop?type=${type.label.toLowerCase()}`}
              className="flex flex-col items-center gap-2 sm:gap-3"
              key={type.label}
            >
              <div
                className="aspect-square w-full rounded-md"
                style={{ background: type.color }}
              />
              <span className="text-[10.5px] font-semibold tracking-wide text-muted sm:text-[11.5px]">
                {type.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopByType;