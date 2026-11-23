import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import LocalStorageProductsService from './services/local-storage-products-service';
import seedProducts from './data/seed-products';

const app = createApp(App);

// We could easily change this to a RemoteProductsService
const productsService = new LocalStorageProductsService();

// Seed before mounting so views see the data on their first render.
if (productsService.getAll().length === 0) {
  seedProducts.forEach(product => productsService.create(product));
}

app.provide('productsService', productsService);

app.mount('#app')
