import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { IProductRepository } from './interfaces/IProductRepository';
import { ProductRepository } from './repositories/ProductRepository';

/**
 * Services container interface
 * Add all repository interfaces here
 */
export interface Services {
  productRepository: IProductRepository;
}

/**
 * Context for dependency injection
 */
const ServicesContext = createContext<Services | null>(null);

interface ServicesProviderProps {
  children: ReactNode;
  /**
   * Optional custom services for testing
   */
  customServices?: Partial<Services>;
}

/**
 * ServicesProvider - React Context-based Dependency Injection Container
 * 
 * This provider creates and manages all service instances.
 * For testing, you can pass customServices to override default implementations.
 * 
 * @example
 * // Production usage
 * <ServicesProvider>
 *   <App />
 * </ServicesProvider>
 * 
 * @example
 * // Testing usage
 * const mockProductRepo = new ProductRepositoryInMemory([...testProducts]);
 * <ServicesProvider customServices={{ productRepository: mockProductRepo }}>
 *   <ComponentUnderTest />
 * </ServicesProvider>
 */
export function ServicesProvider({ children, customServices }: ServicesProviderProps) {
  const services: Services = useMemo(() => ({
    productRepository: customServices?.productRepository || new ProductRepository(),
  }), [customServices]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Hook to access all services
 * @throws Error if used outside of ServicesProvider
 */
export function useServices(): Services {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

/**
 * Hook to access product repository
 * Following Interface Segregation Principle - only expose what's needed
 */
export function useProductRepository(): IProductRepository {
  const { productRepository } = useServices();
  return productRepository;
}
