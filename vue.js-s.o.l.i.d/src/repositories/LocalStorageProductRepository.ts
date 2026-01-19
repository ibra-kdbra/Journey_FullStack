import type { Product, IProductRepository } from './IProductRepository';

const STORAGE_KEY = 'products';

/**
 * LocalStorage implementation of IProductRepository
 * This is an implementation detail - the interface is what matters
 */
export class LocalStorageProductRepository implements IProductRepository {
  private currentId = 1;

  constructor() {
    // Initialize ID counter based on existing products
    const products = this.getProductsFromStorage();
    if (products.length > 0) {
      // Filter out products without IDs before calculating max
      const productIds = products.map(p => p.id).filter((id): id is number => id !== undefined);
      this.currentId = productIds.length > 0 ? Math.max(...productIds) + 1 : 1;
    }
  }

  private getProductsFromStorage(): Product[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveProductsToStorage(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const products = this.getProductsFromStorage();
    const newProduct: Product = {
      ...product,
      id: this.currentId++,
    };
    products.push(newProduct);
    this.saveProductsToStorage(products);
    return newProduct;
  }

  async getAll(): Promise<Product[]> {
    return this.getProductsFromStorage();
  }

  async search(query: string): Promise<Product[]> {
    const products = this.getProductsFromStorage();
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery)
    );
  }

  async findById(id: number): Promise<Product | null> {
    const products = this.getProductsFromStorage();
    return products.find(p => p.id === id) || null;
  }

  async delete(id: number): Promise<boolean> {
    const products = this.getProductsFromStorage();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    this.saveProductsToStorage(products);
    return true;
  }

  async deleteAll(): Promise<void> {
    this.saveProductsToStorage([]);
  }
}
