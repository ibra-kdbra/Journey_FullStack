import axios from 'axios';
import { IProductRepository, Product } from '../interfaces/IProductRepository';

const API_URL = 'https://fakestoreapi.com';

/**
 * Implementation of IProductRepository using Fake Store API
 * This is the production implementation
 */
export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const { data } = await axios.get<Product[]>(`${API_URL}/products`);
    return data;
  }

  async findById(id: number): Promise<Product | null> {
    try {
      const { data } = await axios.get<Product>(`${API_URL}/products/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async findByMinRating(minRating: number): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.rating.rate >= minRating);
  }

  async findByCategory(category: string): Promise<Product[]> {
    const { data } = await axios.get<Product[]>(`${API_URL}/products/category/${category}`);
    return data;
  }
}
