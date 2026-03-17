import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  features: string[];
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  bankReferenceNumber?: string;
  discordWebhookSent: boolean;
  createdAt: string;
  updatedAt: string;
}

class LocalDataStore {
  private productsPath = path.join(DATA_DIR, 'products.json');
  private ordersPath = path.join(DATA_DIR, 'orders.json');

  async getProducts(): Promise<Product[]> {
    try {
      const data = await fs.readFile(this.productsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p._id === id) || null;
  }

  async createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...product,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    await fs.writeFile(this.productsPath, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p._id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(this.productsPath, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filteredProducts = products.filter(p => p._id !== id);
    if (filteredProducts.length === products.length) return false;

    await fs.writeFile(this.productsPath, JSON.stringify(filteredProducts, null, 2));
    return true;
  }

  async getOrders(): Promise<Order[]> {
    try {
      const data = await fs.readFile(this.ordersPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o._id === id) || null;
  }

  async getOrderByOrderId(orderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o._id === orderId) || null; // Assuming orderId is stored as _id
  }

  async createOrder(order: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orders = await this.getOrders();
    const newOrder: Order = {
      ...order,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o._id === id);
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
    return orders[index];
  }
}

export const dataStore = new LocalDataStore();