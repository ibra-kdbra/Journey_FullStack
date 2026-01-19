/**
 * Product entity interface
 */
export interface Product {
  id?: number;
  name: string;
  price: number;
  category?: string;
  description?: string;
}

/**
 * Product Repository Interface
 * Follows Dependency Inversion Principle (DIP)
 * High-level modules depend on this abstraction, not concrete implementations
 */
export interface IProductRepository {
  /**
   * Create a new product
   */
  create(product: Omit<Product, 'id'>): Promise<Product>;

  /**
   * Get all products
   */
  getAll(): Promise<Product[]>;

  /**
   * Find products by search query
   */
  search(query: string): Promise<Product[]>;

  /**
   * Find product by ID
   */
  findById(id: number): Promise<Product | null>;

  /**
   * Delete a product
   */
  delete(id: number): Promise<boolean>;

  /**
   * Delete all products
   */
  deleteAll(): Promise<void>;
}
