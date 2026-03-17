'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features: string[];
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  async function fetchProducts() {
    try {
      const query = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
      const res = await fetch(`/api/products${query}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            🤖 Discord Bot Store
          </Link>
          <nav className="flex gap-4">
            <Link href="/products" className="text-purple-600 font-semibold">المتجر</Link>
            <Link href="/admin" className="btn-primary text-sm">لوحة التحكم</Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-purple-600 hover:underline">الرئيسية</Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-600">المتجر</span>
        </div>
      </div>

      <section className="section container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">متجر بوتات Discord</h1>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          {['all', 'moderation', 'music', 'entertainment', 'utility'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
              }`}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">جاري التحميل...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">لا توجد منتجات في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card">
                {product.image && (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                {product.features && product.features.length > 0 && (
                  <ul className="text-sm text-gray-600 mb-4">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between items-center mt-6">
                  <span className="text-2xl font-bold text-purple-600">{product.price} د.ك</span>
                  <Link
                    href={`/checkout?product=${product._id}`}
                    className="btn-primary text-sm"
                  >
                    اشتري الآن
                  </Link>
                </div>

                {product.stock === 0 && (
                  <div className="mt-4 bg-red-100 text-red-700 text-center py-2 rounded">
                    غير متاح حالياً
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Discord Bot Store - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
