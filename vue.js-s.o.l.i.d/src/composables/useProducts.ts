import { ref, inject, provide, type InjectionKey, type Ref } from 'vue';
import type { IProductRepository, Product } from '../repositories';
import { LocalStorageProductRepository } from '../repositories';

/**
 * Injection key for product repository
 * Following Dependency Inversion Principle (DIP)
 */
export const ProductRepositoryKey: InjectionKey<IProductRepository> = Symbol('ProductRepository');

/**
 * Default product repository instance
 */
const defaultRepository = new LocalStorageProductRepository();

/**
 * Provide product repository to child components
 * Use this in the root component or a provider component
 * 
 * @example
 * // In App.vue setup
 * provideProductRepository();
 * 
 * @example
 * // With custom implementation for testing
 * provideProductRepository(new InMemoryProductRepository(testProducts));
 */
export function provideProductRepository(repository?: IProductRepository): void {
  provide(ProductRepositoryKey, repository || defaultRepository);
}

/**
 * Composable to access product repository
 * Follows Interface Segregation Principle - exposes only what's needed
 * 
 * @example
 * const { products, loading, fetchProducts, createProduct } = useProducts();
 */
export function useProducts() {
  const repository = inject(ProductRepositoryKey, defaultRepository);
  
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchProducts(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      products.value = await repository.getAll();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    loading.value = true;
    error.value = null;
    try {
      const newProduct = await repository.create(product);
      products.value.push(newProduct);
      return newProduct;
    } catch (e) {
      error.value = e as Error;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function searchProducts(query: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      products.value = await repository.search(query);
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const success = await repository.delete(id);
      if (success) {
        products.value = products.value.filter(p => p.id !== id);
      }
      return success;
    } catch (e) {
      error.value = e as Error;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAllProducts(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await repository.deleteAll();
      products.value = [];
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    products,
    loading,
    error,
    // Actions
    fetchProducts,
    createProduct,
    searchProducts,
    deleteProduct,
    deleteAllProducts,
  };
}
