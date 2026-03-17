'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'moderation',
    image: '',
    features: '',
  });

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!authChecked) {
      return;
    }
    loadData();
  }, [activeTab, authChecked]);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.replace('/login');
        return;
      }

      const data = await res.json();
      if (!data?.authenticated) {
        router.replace('/login');
        return;
      }

      if (data.user?.role !== 'admin') {
        router.replace('/?error=forbidden');
        return;
      }

      setAuthChecked(true);
    } catch {
      router.replace('/login');
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      if (activeTab === 'products') {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.products || []);
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.split(',').map(f => f.trim()),
          ...(editingProduct ? { id: editingProduct } : {})
        }),
      });

      if (res.ok) {
        loadData();
        setShowForm(false);
        setFormData({ name: '', description: '', price: '', category: 'moderation', image: '', features: '' });
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }

  async function handleConfirmOrder(id: string) {
    try {
      const res = await fetch(`/api/orders/${id}/confirm`, { method: 'POST' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  }

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <Link href="/" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
            العودة للمتجر
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 flex gap-8">
          {['products', 'orders', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              {tab === 'products' && '📦 المنتجات'}
              {tab === 'orders' && '📋 الطلبات'}
              {tab === 'settings' && '⚙️ الإعدادات'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="section container mx-auto px-4">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">إدارة المنتجات</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingProduct(null);
                  setFormData({ name: '', description: '', price: '', category: 'moderation', image: '', features: '' });
                }}
                className="btn-primary"
              >
                ➕ منتج جديد
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {showForm && (
              <div className="card mb-8 max-w-2xl">
                <h3 className="text-2xl font-bold mb-6">
                  {editingProduct ? 'تعديل المنتج' : 'منتج جديد'}
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">اسم المنتج</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">الوصف</label>
                    <textarea
                      className="input h-24"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">السعر (د.ك)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">الفئة</label>
                      <select
                        className="input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="moderation">Moderation</option>
                        <option value="music">Music</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="utility">Utility</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">رابط الصورة</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">المميزات (مفصولة بفواصل)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="سهل الاستخدام, سريع, موثوق"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="btn-primary">
                      {editingProduct ? 'تحديث' : 'إضافة'} المنتج
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-outline"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            {loading ? (
              <p className="text-center text-gray-600">جاري التحميل...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right font-semibold">المنتج</th>
                      <th className="px-6 py-3 text-right font-semibold">السعر</th>
                      <th className="px-6 py-3 text-right font-semibold">الفئة</th>
                      <th className="px-6 py-3 text-right font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{product.name}</td>
                        <td className="px-6 py-3">{product.price} د.ك</td>
                        <td className="px-6 py-3">{product.category}</td>
                        <td className="px-6 py-3 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product._id);
                              setFormData({
                                name: product.name,
                                description: product.description,
                                price: product.price.toString(),
                                category: product.category,
                                image: product.image || '',
                                features: product.features?.join(', ') || '',
                              });
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">الطلبات</h2>
            {loading ? (
              <p className="text-center text-gray-600">جاري التحميل...</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order._id} className="card">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">رقم الطلب</p>
                        <p className="font-bold">{order._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المنتج</p>
                        <p className="font-bold">{order.productName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">العميل</p>
                        <p className="font-bold">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المبلغ</p>
                        <p className="font-bold">{order.amount} د.ك</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">حالة الدفع</p>
                        <p className={`font-bold ${
                          order.paymentStatus === 'completed' ? 'text-green-600' : 
                          order.paymentStatus === 'failed' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {order.paymentStatus === 'completed' ? '✅ مكتمل' : 
                           order.paymentStatus === 'awaiting_confirmation' ? '🏦 بانتظار تأكيد التحويل' :
                           order.paymentStatus === 'pending' ? '⏳ قيد المعالجة' : 
                           '❌ فشل'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">طريقة الدفع</p>
                        <p className="font-bold">{order.paymentMethod}</p>
                      </div>

                      {order.bankReferenceNumber && (
                        <div>
                          <p className="text-sm text-gray-600">رقم الحوالة</p>
                          <p className="font-bold">{order.bankReferenceNumber}</p>
                        </div>
                      )}
                    </div>

                    {order.paymentStatus === 'awaiting_confirmation' && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleConfirmOrder(order._id)}
                          className="btn-primary"
                        >
                          ✅ تأكيد التحويل البنكي
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">الإعدادات</h2>
            <div className="card max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Discord Webhook URL</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://discord.com/api/webhooks/..."
                    defaultValue={process.env.NEXT_PUBLIC_DISCORD_WEBHOOK}
                  />
                  <p className="text-sm text-gray-600 mt-2">يتم استخدام هذا للإشعارات في Discord</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">MongoDB URI</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="mongodb+srv://..."
                    defaultValue="••••••••"
                  />
                  <p className="text-sm text-gray-600 mt-2">الاتصال بقاعدة البيانات</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Stripe Secret Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="sk_..."
                    defaultValue="••••••••"
                  />
                </div>

                <button className="btn-primary">
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Discord Bot Store - لوحة التحكم</p>
        </div>
      </footer>
    </div>
  );
}
