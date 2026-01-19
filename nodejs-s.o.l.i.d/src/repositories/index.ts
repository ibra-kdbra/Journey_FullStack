import { IUserRepository } from './IUserRepository';
import { IOrderRepository } from './IOrderRepository';
import { UserRepository } from './UserRepository';
import { OrderRepository } from './OrderRepository';
import { UserRepositoryInMemory } from './in-memory/UserRepositoryInMemory';
import { OrderRepositoryInMemory } from './in-memory/OrderRepositoryInMemory';

export {
  // Interfaces
  IUserRepository,
  IOrderRepository,
  // Implementations
  UserRepository,
  OrderRepository,
  // In-memory implementations (for testing)
  UserRepositoryInMemory,
  OrderRepositoryInMemory,
};
