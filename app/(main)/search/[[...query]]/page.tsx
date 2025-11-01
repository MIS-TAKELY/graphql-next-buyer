// app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  price: number;
  image: string;
}

// Sample product data (focused on Electronics, with some from other categories)
const products: Product[] = [
  { id: 1, name: 'iPhone 15', category: 'Mobile & Accessories', subCategory: 'Smartphones', brand: 'Apple', price: 999, image: 'https://via.placeholder.com/250x200?text=iPhone+15' },
  { id: 2, name: 'Samsung Galaxy S24', category: 'Mobile & Accessories', subCategory: 'Smartphones', brand: 'Samsung', price: 899, image: 'https://via.placeholder.com/250x200?text=Galaxy+S24' },
  { id: 3, name: 'MacBook Pro', category: 'Computers & Laptops', subCategory: 'Laptops', brand: 'Apple', price: 1999, image: 'https://via.placeholder.com/250x200?text=MacBook+Pro' },
  { id: 4, name: 'Dell XPS 13', category: 'Computers & Laptops', subCategory: 'Laptops', brand: 'Dell', price: 1299, image: 'https://via.placeholder.com/250x200?text=Dell+XPS' },
  { id: 5, name: 'Sony Bravia TV', category: 'TVs & Home Entertainment', subCategory: 'Smart TVs', brand: 'Sony', price: 799, image: 'https://via.placeholder.com/250x200?text=Sony+Bravia' },
  { id: 6, name: 'Power Bank 10000mAh', category: 'Mobile & Accessories', subCategory: 'Power Banks', brand: 'Anker', price: 29, image: 'https://via.placeholder.com/250x200?text=Power+Bank' },
  { id: 7, name: 'Nike Air Max Shoes', category: 'Fashion & Apparel', subCategory: 'Footwear', brand: 'Nike', price: 120, image: 'https://via.placeholder.com/250x200?text=Nike+Air+Max' },
  { id: 8, name: 'Yoga Mat', category: 'Health & Wellness', subCategory: 'Fitness Equipment', brand: 'Manduka', price: 45, image: 'https://via.placeholder.com/250x200?text=Yoga+Mat' },
  // Add more sample products as needed
];

export default function SearchPage() {
  const [currentProducts, setCurrentProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showElectronicsSubs, setShowElectronicsSubs] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategories, selectedBrands, maxPrice]);

  const applyFilters = () => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category) ||
        (selectedCategories.includes('Electronics') && product.category.startsWith('Electronics')) ||
        selectedCategories.some((cat) => product.category.includes(cat));
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    setCurrentProducts(filtered);
  };

  const toggleCategory = (category: string, isElectronicsParent?: boolean) => {
    if (isElectronicsParent) {
      setShowElectronicsSubs(!showElectronicsSubs);
      if (!showElectronicsSubs) {
        // If expanding, don't auto-select subs; user can choose
        setSelectedCategories((prev) => [...prev, 'Electronics']);
      } else {
        setSelectedCategories((prev) => prev.filter((c) => c !== 'Electronics'));
      }
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
      );
    }
    applyFilters();
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(10000);
    setShowElectronicsSubs(false);
  };

  const renderProducts = () => {
    if (currentProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-10 text-gray-500">
          No products found matching your criteria.
        </div>
      );
    }

    return currentProducts.map((product) => (
      <div key={product.id} className="bg-gray-700 p-4 rounded-lg shadow-md text-center">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
        <h4 className="font-semibold mb-2">{product.name}</h4>
        <p className="text-gray-600 text-sm mb-2">{product.category} &gt; {product.subCategory}</p>
        <p className="text-blue-600 font-bold">${product.price}</p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Search Bar */}
      <div className="bg-gray-900 p-5 text-center shadow-sm">
        <div className="flex justify-center items-center max-w-md mx-auto">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
            onClick={() => applyFilters()}
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto p-5">
        {/* Sidebar */}
        <aside className="w-1/4 pr-5">
          <button
            className="w-full mb-5 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

          {/* Categories */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm mb-5">
            <h3 className="font-semibold mb-3">Categories (Electronics Focus)</h3>
            <ul className="space-y-2">
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showElectronicsSubs || selectedCategories.includes('Electronics')}
                    onChange={() => toggleCategory('Electronics', true)}
                    className="mr-2"
                  />
                  Electronics
                </label>
                {showElectronicsSubs && (
                  <ul className="ml-4 space-y-1 mt-2">
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Mobile & Accessories')}
                          onChange={() => toggleCategory('Mobile & Accessories')}
                          className="mr-2"
                        />
                        Mobile & Accessories
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Computers & Laptops')}
                          onChange={() => toggleCategory('Computers & Laptops')}
                          className="mr-2"
                        />
                        Computers & Laptops
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('TVs & Home Entertainment')}
                          onChange={() => toggleCategory('TVs & Home Entertainment')}
                          className="mr-2"
                        />
                        TVs & Home Entertainment
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Cameras & Photography')}
                          onChange={() => toggleCategory('Cameras & Photography')}
                          className="mr-2"
                        />
                        Cameras & Photography
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Audio & Headphones')}
                          onChange={() => toggleCategory('Audio & Headphones')}
                          className="mr-2"
                        />
                        Audio & Headphones
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('Gaming')}
                          onChange={() => toggleCategory('Gaming')}
                          className="mr-2"
                        />
                        Gaming
                      </label>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Fashion & Apparel')}
                    onChange={() => toggleCategory('Fashion & Apparel')}
                    className="mr-2"
                  />
                  Fashion & Apparel
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Home & Kitchen')}
                    onChange={() => toggleCategory('Home & Kitchen')}
                    className="mr-2"
                  />
                  Home & Kitchen
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Grocery & Gourmet')}
                    onChange={() => toggleCategory('Grocery & Gourmet')}
                    className="mr-2"
                  />
                  Grocery & Gourmet
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Beauty & Personal Care')}
                    onChange={() => toggleCategory('Beauty & Personal Care')}
                    className="mr-2"
                  />
                  Beauty & Personal Care
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Health & Wellness')}
                    onChange={() => toggleCategory('Health & Wellness')}
                    className="mr-2"
                  />
                  Health & Wellness
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Books & Stationery')}
                    onChange={() => toggleCategory('Books & Stationery')}
                    className="mr-2"
                  />
                  Books & Stationery
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Toys & Games')}
                    onChange={() => toggleCategory('Toys & Games')}
                    className="mr-2"
                  />
                  Toys & Games
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Automotive & Tools')}
                    onChange={() => toggleCategory('Automotive & Tools')}
                    className="mr-2"
                  />
                  Automotive & Tools
                </label>
              </li>
              <li>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Sports & Outdoors')}
                    onChange={() => toggleCategory('Sports & Outdoors')}
                    className="mr-2"
                  />
                  Sports & Outdoors
                </label>
              </li>
            </ul>
          </div>

          {/* Price Range */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm mb-5">
            <h3 className="font-semibold mb-3">Price Range</h3>
            <input
              type="range"
              min={0}
              max={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer slider"
            />
            <p className="text-sm text-gray-600">Max Price: ${maxPrice}</p>
          </div>

          {/* Brands */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3">Brands</h3>
            <ul className="space-y-2">
              {['Apple', 'Samsung', 'Sony', 'Dell', 'Nike'].map((brand) => (
                <li key={brand}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="mr-2"
                    />
                    {brand}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {renderProducts()}
          </div>
        </main>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}