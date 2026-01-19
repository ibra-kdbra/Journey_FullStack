import UserAttributes from '../interfaces/types/UserAttributes';

/**
 * Interface for User Repository following Dependency Inversion Principle (DIP)
 * High-level modules should not depend on low-level modules.
 * Both should depend on abstractions.
 */
export interface IUserRepository {
  /**
   * Create a new user
   * @param data User data to create
   * @returns Created user
   */
  create(data: Omit<UserAttributes, 'id'>): Promise<UserAttributes>;

  /**
   * Find user by ID
   * @param id User ID
   * @returns User if found, null otherwise
   */
  findById(id: number): Promise<UserAttributes | null>;

  /**
   * Find user by email
   * @param email User email
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<UserAttributes | null>;

  /**
   * Get all users
   * @returns Array of users
   */
  findAll(): Promise<UserAttributes[]>;

  /**
   * Update user by ID
   * @param id User ID
   * @param data Data to update
   * @returns Updated user if found
   */
  update(id: number, data: Partial<UserAttributes>): Promise<UserAttributes | null>;

  /**
   * Delete user by ID
   * @param id User ID
   * @returns True if deleted, false otherwise
   */
  delete(id: number): Promise<boolean>;
}
