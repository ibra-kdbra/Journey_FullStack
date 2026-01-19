import { User } from '../models/User';
import UserAttributes from '../interfaces/types/UserAttributes';
import { IUserRepository } from './IUserRepository';

/**
 * Sequelize implementation of IUserRepository
 * This is the production implementation that uses the database
 */
export class UserRepository implements IUserRepository {
  async create(data: Omit<UserAttributes, 'id'>): Promise<UserAttributes> {
    const user = await User.create(data);
    return user.get({ plain: true });
  }

  async findById(id: number): Promise<UserAttributes | null> {
    const user = await User.findByPk(id);
    return user ? user.get({ plain: true }) : null;
  }

  async findByEmail(email: string): Promise<UserAttributes | null> {
    const user = await User.findOne({ where: { email } });
    return user ? user.get({ plain: true }) : null;
  }

  async findAll(): Promise<UserAttributes[]> {
    const users = await User.findAll();
    return users.map(user => user.get({ plain: true }));
  }

  async update(id: number, data: Partial<UserAttributes>): Promise<UserAttributes | null> {
    const [affectedCount] = await User.update(data, {
      where: { id },
      individualHooks: true,
    });
    
    if (affectedCount === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const affectedCount = await User.destroy({ where: { id } });
    return affectedCount > 0;
  }
}
