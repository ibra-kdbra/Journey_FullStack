import { IProductRepository, Product } from '../interfaces/IProductRepository';

/**
 * In-memory implementation of IProductRepository for testing
 * This allows unit tests to run without network calls
 */
export class ProductRepositoryInMemory implements IProductRepository {
  private products: Product[] = [];

  constructor(initialProducts: Product[] = []) {
    this.products = initialProducts;
  }

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findById(id: number): Promise<Product | null> {
    return this.products.find(product => product.id === id) || null;
  }

  async findByMinRating(minRating: number): Promise<Product[]> {
    return this.products.filter(product => product.rating.rate >= minRating);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.products.filter(product => product.category === category);
  }

  /**
   * Add products for testing
   */
  addProducts(products: Product[]): void {
    this.products.push(...products);
  }

  /**
   * Clear all products - useful for test cleanup
   */
  clear(): void {
    this.products = [];
  }
}
