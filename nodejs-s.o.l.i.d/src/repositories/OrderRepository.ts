import Order from '../models/Order';
import OrderAttributes from '../interfaces/types/OrderAttributes';
import { IOrderRepository } from './IOrderRepository';

/**
 * Sequelize implementation of IOrderRepository
 * This is the production implementation that uses the database
 */
export class OrderRepository implements IOrderRepository {
  async create(data: Omit<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderAttributes> {
    // Sequelize's create method handles the type conversion internally
    const order = await Order.create({
      userId: data.userId,
      product: data.product,
      quantity: data.quantity,
      price: data.price,
    });
    return order.get({ plain: true });
  }

  async findById(id: number): Promise<OrderAttributes | null> {
    const order = await Order.findByPk(id);
    return order ? order.get({ plain: true }) : null;
  }

  async findByUserId(userId: number): Promise<OrderAttributes[]> {
    const orders = await Order.findAll({ where: { userId } });
    return orders.map(order => order.get({ plain: true }));
  }

  async findAll(): Promise<OrderAttributes[]> {
    const orders = await Order.findAll();
    return orders.map(order => order.get({ plain: true }));
  }

  async update(id: number, data: Partial<OrderAttributes>): Promise<OrderAttributes | null> {
    const [affectedCount] = await Order.update(data, { where: { id } });
    
    if (affectedCount === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const affectedCount = await Order.destroy({ where: { id } });
    return affectedCount > 0;
  }
}
