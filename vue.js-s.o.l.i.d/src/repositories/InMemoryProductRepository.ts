import type { Product, IProductRepository } from './IProductRepository';

/**
 * In-memory implementation of IProductRepository for testing
 * This allows unit tests to run without localStorage
 */
export class InMemoryProductRepository implements IProductRepository {
  private products: Product[] = [];
  private currentId = 1;

  constructor(initialProducts: Product[] = []) {
    this.products = initialProducts.map((p, index) => ({
      ...p,
      id: p.id ?? index + 1,
    }));
    if (this.products.length > 0) {
      // All products now have IDs after the map operation
      const productIds = this.products.map(p => p.id).filter((id): id is number => id !== undefined);
      this.currentId = productIds.length > 0 ? Math.max(...productIds) + 1 : 1;
    }
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.currentId++,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async getAll(): Promise<Product[]> {
    return [...this.products];
  }

  async search(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery)
    );
  }

  async findById(id: number): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  async deleteAll(): Promise<void> {
    this.products = [];
  }

  /**
   * Clear and reset for testing
   */
  clear(): void {
    this.products = [];
    this.currentId = 1;
  }
}
