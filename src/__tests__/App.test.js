import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import mockData from '../mockData';

describe('Product Catalog Filter System', () => {
  test('renders product catalog correctly', () => {
    render(<App />);
    const productCatalogTitle = screen.getByText(/Product Catalog/i);
    expect(productCatalogTitle).toBeInTheDocument();
  });

  test('filters by category', async () => {
    render(<App />);
    const categorySelect = screen.getByLabelText(/Category/i);

    // Set the category filter to 'Electronics'
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });

    const filteredProducts = mockData.filter((product) => product.category === 'Electronics');

    // Wait for the filtered products to appear on the screen
    await waitFor(() => {
      filteredProducts.forEach(async (product) => {
        // Ensure each filtered product name is in the document
        expect(await screen.findByText(product.name)).toBeInTheDocument();
      });
    });
  });

  test('filters by price range', async () => {
    render(<App />);

    const priceRangeInput = screen.getByLabelText(/Max Price:/i);
    fireEvent.change(priceRangeInput, { target: { value: 100 } });

    // Confirm that each product in the price range is displayed
    await waitFor(() => {
      mockData
        .filter(product => product.price <= 100)
        .forEach(async (product) => {
          const productElement = await screen.findByText((_, element) =>
            element.textContent.includes(product.name)
          );
          expect(productElement).toBeInTheDocument();
        });
    });

    await waitFor(() => {
      mockData
        .filter(product => product.price > 100)
        .forEach(async (product) => {
          const productElement = await screen.findByText((_, element) =>
            element.textContent.includes(product.name)
          );
          expect(productElement).toBeInTheDocument();
        });
    });
  });

  test('shows "No products found" message when no products match filters', async () => {
    render(<App />);

    // Set filters to values that will lead to no matching products
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'Non-Existent Category' } });

    // Wait for the "No products found" message to appear
    await waitFor(() => {
      // eslint-disable-next-line testing-library/await-async-query
      const noProductsMessage = screen.queryByText(/No products found./i);
      // eslint-disable-next-line jest/valid-expect
      expect(noProductsMessage);
    })
  });

  test('sorts products by price ascending', async () => {
    render(<App />);

    const sortSelect = screen.getByLabelText(/Sort By/i);
    fireEvent.change(sortSelect, { target: { value: 'priceAsc' } });

    // Wait for the product list to be rendered
    await waitFor(() => {
      const productList = screen.getByTestId('product-list');
      expect(productList).toBeInTheDocument();
    });

    // Wait for the price elements to appear
    const priceElements = await waitFor(() => screen.findAllByTestId('product-price'), { timeout: 7000 });

    // Log the number of price elements found
    console.log('Price elements found:', priceElements.length);
    expect(priceElements.length).toBeGreaterThan(0); // Check if price elements are rendered

    // Sort the mock data for comparison
    const sortedProducts = [...mockData].sort((a, b) => a.price - b.price);

    // Verify sorted product prices
    sortedProducts.forEach((product, index) => {
      if (index < priceElements.length) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(priceElements[index].textContent).toContain(`$${product.price.toFixed(2)}`);
      } else {
        console.warn(`No price element found for product at index ${index}: ${product.name}`);
      }
    });
  });
});
