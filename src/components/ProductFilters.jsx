const GENDERS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
];


function ProductFilters({
  categories,
  brands,

  selectedGender,
  selectedCategories,
  selectedBrands,

  minPrice,
  maxPrice,

  onGenderChange,
  onCategoryChange,
  onBrandChange,

  onMinPriceChange,
  onMaxPriceChange,

  onClearFilters,
}) {

  const hasFilters =
    selectedGender ||
  selectedCategories.length > 0 ||
  selectedBrands.length > 0 ||
    minPrice ||
    maxPrice;


  return (

    <aside
      className="
        w-full
        lg:w-[230px]
        lg:shrink-0
      "
    >

      {/* ================================================= */}
      {/* FILTER HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          pb-4
        "
      >

        <h2
          className="
            text-sm
            font-semibold
            text-gray-900
          "
        >
          Filters
        </h2>


        {hasFilters && (

          <button
            type="button"
            onClick={onClearFilters}
            className="
              text-xs
              font-medium
              text-[#f4511e]
              hover:underline
            "
          >
            Clear all
          </button>

        )}

      </div>


      {/* ================================================= */}
      {/* GENDER */}
      {/* ================================================= */}

      <div
        className="
          border-b
          border-gray-200
          py-5
        "
      >

        <h3
          className="
            mb-4
            text-sm
            font-semibold
            text-gray-900
          "
        >
          Gender
        </h3>


        <div className="space-y-3">

          {GENDERS.map((gender) => (

            <label
              key={gender.value}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                text-sm
                text-gray-600
              "
            >

              <input
                type="radio"
                name="gender"
                value={gender.value}
                checked={
                  selectedGender ===
                  gender.value
                }
                onChange={() =>
                  onGenderChange(
                    gender.value
                  )
                }
                className="
                  h-4
                  w-4
                  accent-[#f4511e]
                "
              />

              <span>
                {gender.label}
              </span>

            </label>

          ))}

        </div>

      </div>


      {/* ================================================= */}
      {/* CATEGORY */}
      {/* ================================================= */}

      <div
        className="
          border-b
          border-gray-200
          py-5
        "
      >

        <h3
          className="
            mb-4
            text-sm
            font-semibold
            text-gray-900
          "
        >
          Category
        </h3>


        <div className="space-y-3">

          {categories.map((category) => (

            <label
              key={category.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                text-sm
                text-gray-600
              "
            >

              <input
                type="checkbox"
                name="category"
                value={category.id}
                checked={selectedCategories.includes(category.id)}
                onChange={() =>
                  onCategoryChange(
                    category.id
                  )
                }
                className="
                  h-4
                  w-4
                  accent-[#f4511e]
                "
              />

              <span>
                {category.categoryName}
              </span>

            </label>

          ))}

        </div>

      </div>


      {/* ================================================= */}
      {/* PRICE */}
      {/* ================================================= */}

      <div
        className="
          border-b
          border-gray-200
          py-5
        "
      >

        <h3
          className="
            mb-4
            text-sm
            font-semibold
            text-gray-900
          "
        >
          Price
        </h3>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) =>
              onMinPriceChange(
                e.target.value
              )
            }
            className="
              w-full
              rounded-lg
              border
              border-gray-200
              px-3
              py-2
              text-sm
              outline-none
              focus:border-[#f4511e]
            "
          />


          <span className="text-gray-400">
            –
          </span>


          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) =>
              onMaxPriceChange(
                e.target.value
              )
            }
            className="
              w-full
              rounded-lg
              border
              border-gray-200
              px-3
              py-2
              text-sm
              outline-none
              focus:border-[#f4511e]
            "
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* BRANDS */}
      {/* ================================================= */}

      <div className="py-5">

        <h3
          className="
            mb-4
            text-sm
            font-semibold
            text-gray-900
          "
        >
          Brand
        </h3>


        <div className="space-y-3">

          {brands.map((brand) => (

            <label
              key={brand.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                text-sm
                text-gray-600
              "
            >

              <input
                type="checkbox"
                name="brand"
                value={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onChange={() =>
                  onBrandChange(
                    brand.id
                  )
                }
                className="
                  h-4
                  w-4
                  accent-[#f4511e]
                "
              />

              <span>
                {brand.name}
              </span>

            </label>

          ))}

        </div>

      </div>

    </aside>

  );
}


export default ProductFilters;
