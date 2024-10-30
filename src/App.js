import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import mockData from "./mockData";
import Filters from "./components/Filters";
import useDebounce from "./hooks/useDebounce";
import "./App.css";

function App() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filters, setFilters] = useState(() => {
        const savedFilters = JSON.parse(localStorage.getItem("filters"));
        return (
            savedFilters || {
                category: "",
                brand: "",
                priceRange: 1000,
                rating: 0,
            }
        );
    });
    const [sortOption, setSortOption] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    const categories = [
        ...new Set(mockData.map((product) => product.category)),
    ];
    const brands = [...new Set(mockData.map((product) => product.brand))];

    const debouncedPriceRange = useDebounce(filters.priceRange, 300);
    const debouncedRating = useDebounce(filters.rating, 300);

    useEffect(() => {
        const savedFilters = JSON.parse(localStorage.getItem("filters"));
        const savedSortOption = localStorage.getItem("sortOption");
        if (savedFilters) {
            setFilters(savedFilters);
        }
        if (savedSortOption) {
            setSortOption(savedSortOption);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("filters", JSON.stringify(filters));
        localStorage.setItem("sortOption", sortOption);
    }, [filters, sortOption]);

    useEffect(() => {
        mockData && setProducts(() => mockData);
        mockData && setFilteredProducts(() => mockData);
    }, []);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            let filtered = products.filter((product) => {
                const matchesCategory = filters.category
                    ? product.category === filters.category
                    : true;
                const matchesBrand = filters.brand
                    ? product.brand === filters.brand
                    : true;
                const matchesPrice = product.price <= debouncedPriceRange;
                const matchesRating = product.rating >= debouncedRating;
                return (
                    matchesCategory &&
                    matchesBrand &&
                    matchesPrice &&
                    matchesRating
                );
            });

            let sorted = [...filtered];
            if (sortOption === "priceAsc") {
                sorted.sort((a, b) => a.price - b.price);
            } else if (sortOption === "priceDesc") {
                sorted.sort((a, b) => b.price - a.price);
            } else if (sortOption === "rating") {
                sorted.sort((a, b) => b.rating - a.rating);
            } else if (sortOption === "name") {
                sorted.sort((a, b) => a.name.localeCompare(b.name));
            }

            setFilteredProducts(() => sorted);
            setLoading(false);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters, sortOption, debouncedPriceRange, debouncedRating, products]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    return (
        <div className="product-catalog">
            <h1>Product Catalog</h1>
            <div className="container">
                <div className="row">
                    {categories && brands && filters && (
                        <Filters
                            categories={categories}
                            brands={brands}
                            filters={filters}
                            setFilters={setFilters}
                        />
                    )}
                    <div className="products-container">
                        <div className="sort-options">
                            <label htmlFor="sort">Sort By:</label>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="priceAsc">
                                    Price: Low to High
                                </option>
                                <option value="priceDesc">
                                    Price: High to Low
                                </option>
                                <option value="rating">Rating</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                        <div
                            className="product-list"
                            data-testid="product-list"
                        >
                            {loading ? (
                                <div className="loader">
                                    <ClipLoader size={50} color="#007bff" />
                                </div>
                            ) : currentProducts.length === 0 ? (
                                <p>No products found.</p>
                            ) : (
                                currentProducts &&
                                currentProducts.length > 0 &&
                                currentProducts.map((product) => {
                                    return (
                                        <div
                                            key={product.id}
                                            data-testid="product-price"
                                            className="product-item"
                                        >
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                width="100%"
                                            />
                                            <h2>{product.name}</h2>
                                            <p>Category: {product.category}</p>
                                            <p>Brand: {product.brand}</p>
                                            <p>Price: ${product.price}</p>
                                            <p>Rating: {product.rating} ⭐</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {!loading &&
                            filteredProducts &&
                            filteredProducts.length > productsPerPage && (
                                <div className="pagination">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>Page {currentPage}</span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    Math.ceil(
                                                        filteredProducts.length /
                                                            productsPerPage
                                                    )
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage >=
                                            Math.ceil(
                                                filteredProducts.length /
                                                    productsPerPage
                                            )
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
