// Interfaces
export type { IProductRepository, Product } from './interfaces';

// Services Context (DI Container)
export { ServicesProvider, useServices, useProductRepository } from './ServicesContext';

// Repository Implementations
export { ProductRepository } from './repositories/ProductRepository';
export { ProductRepositoryInMemory } from './repositories/ProductRepositoryInMemory';
