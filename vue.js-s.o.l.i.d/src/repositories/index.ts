// Interface
export type { IProductRepository, Product } from './IProductRepository';

// Implementations
export { LocalStorageProductRepository } from './LocalStorageProductRepository';
export { InMemoryProductRepository } from './InMemoryProductRepository';
