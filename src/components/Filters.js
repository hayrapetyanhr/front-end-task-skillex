import React from "react";

const Filters = ({ categories, brands, filters, setFilters }) => {
    const handleChange = (event) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [event.target.name]:
                event.target.name === "priceRange" ||
                event.target.name === "rating"
                    ? +event.target.value
                    : event.target.value,
        }));
    };

    return (
        <div className="filters">
            <h3>Filters</h3>
            <div>
                <label htmlFor="category">Category:</label>
                <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="">All</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="brand">Brand:</label>
                <select
                    id="brand"
                    name="brand"
                    value={filters.brand}
                    onChange={handleChange}
                >
                    <option value="">All</option>
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="price">Max Price: ${filters.priceRange}</label>
                <input
                    id="price"
                    type="range"
                    min="0"
                    max="1000"
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="rating">Min Rating: {filters.rating} ⭐</label>
                <input
                    id="rating"
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    name="rating"
                    value={filters.rating}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default Filters;
