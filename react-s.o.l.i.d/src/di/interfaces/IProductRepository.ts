/**
 * Product entity interface
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  rating: {
    rate: number;
    count: number;
  };
  image: string;
  category: string;
  description: string;
}

/**
 * Product Repository Interface
 * Follows Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 */
export interface IProductRepository {
  /**
   * Fetch all products
   */
  findAll(): Promise<Product[]>;

  /**
   * Find product by ID
   */
  findById(id: number): Promise<Product | null>;

  /**
   * Filter products by minimum rating
   */
  findByMinRating(minRating: number): Promise<Product[]>;

  /**
   * Find products by category
   */
  findByCategory(category: string): Promise<Product[]>;
}
