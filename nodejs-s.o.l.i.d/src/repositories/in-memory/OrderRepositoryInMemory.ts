import OrderAttributes from '../../interfaces/types/OrderAttributes';
import { IOrderRepository } from '../IOrderRepository';

/**
 * In-memory implementation of IOrderRepository for testing
 * This allows unit tests to run without a database connection
 */
export class OrderRepositoryInMemory implements IOrderRepository {
  private orders: OrderAttributes[] = [];
  private currentId = 1;

  async create(data: Omit<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderAttributes> {
    const now = new Date();
    const order: OrderAttributes = {
      ...data,
      id: this.currentId++,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.push(order);
    return order;
  }

  async findById(id: number): Promise<OrderAttributes | null> {
    return this.orders.find(order => order.id === id) || null;
  }

  async findByUserId(userId: number): Promise<OrderAttributes[]> {
    return this.orders.filter(order => order.userId === userId);
  }

  async findAll(): Promise<OrderAttributes[]> {
    return [...this.orders];
  }

  async update(id: number, data: Partial<OrderAttributes>): Promise<OrderAttributes | null> {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      return null;
    }
    this.orders[index] = { 
      ...this.orders[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.orders[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      return false;
    }
    this.orders.splice(index, 1);
    return true;
  }

  /**
   * Clear all orders - useful for test cleanup
   */
  clear(): void {
    this.orders = [];
    this.currentId = 1;
  }
}
