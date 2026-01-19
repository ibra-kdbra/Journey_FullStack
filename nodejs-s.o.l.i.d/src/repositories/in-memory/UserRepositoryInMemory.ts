import UserAttributes from '../../interfaces/types/UserAttributes';
import { IUserRepository } from '../IUserRepository';

/**
 * In-memory implementation of IUserRepository for testing
 * This allows unit tests to run without a database connection
 */
export class UserRepositoryInMemory implements IUserRepository {
  private users: UserAttributes[] = [];
  private currentId = 1;

  async create(data: Omit<UserAttributes, 'id'>): Promise<UserAttributes> {
    const user: UserAttributes = {
      ...data,
      id: this.currentId++,
    };
    this.users.push(user);
    return user;
  }

  async findById(id: number): Promise<UserAttributes | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<UserAttributes | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findAll(): Promise<UserAttributes[]> {
    return [...this.users];
  }

  async update(id: number, data: Partial<UserAttributes>): Promise<UserAttributes | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }

  /**
   * Clear all users - useful for test cleanup
   */
  clear(): void {
    this.users = [];
    this.currentId = 1;
  }
}
