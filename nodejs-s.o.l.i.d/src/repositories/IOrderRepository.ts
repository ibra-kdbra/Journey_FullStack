import OrderAttributes from '../interfaces/types/OrderAttributes';

/**
 * Interface for Order Repository following Dependency Inversion Principle (DIP)
 * High-level modules should not depend on low-level modules.
 * Both should depend on abstractions.
 */
export interface IOrderRepository {
  /**
   * Create a new order
   * @param data Order data to create
   * @returns Created order
   */
  create(data: Omit<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderAttributes>;

  /**
   * Find order by ID
   * @param id Order ID
   * @returns Order if found, null otherwise
   */
  findById(id: number): Promise<OrderAttributes | null>;

  /**
   * Find orders by user ID
   * @param userId User ID
   * @returns Array of orders for the user
   */
  findByUserId(userId: number): Promise<OrderAttributes[]>;

  /**
   * Get all orders
   * @returns Array of orders
   */
  findAll(): Promise<OrderAttributes[]>;

  /**
   * Update order by ID
   * @param id Order ID
   * @param data Data to update
   * @returns Updated order if found
   */
  update(id: number, data: Partial<OrderAttributes>): Promise<OrderAttributes | null>;

  /**
   * Delete order by ID
   * @param id Order ID
   * @returns True if deleted, false otherwise
   */
  delete(id: number): Promise<boolean>;
}
