# SOLID principles in Vue.js components

The goal of this project is to showcase how you can apply the SOLID principles to Vue.js components, by following a series of refactorings:

🎯 SRP - The Single Responsibility Principle

- [Extract LocalStorageProductsService](./src/services/local-storage-products-service.js)

🧵 ISP - The Interface Segregation Principle

- [Extract Products view and SearchBox component](./src/components/search-box.vue)

🚪 OCP - The Open-Closed Principle

- [Extract get-product-list-item-component function](./src/utils/get-product-list-item-component.js)

🧩 LSP - The Liskov Substitution Principle

- [Create product-card that knows how to render a product card](./src/components/product-card.vue)

🔌 DIP - The Dependency Inversion Principle

- [Invert dependency between products view and productsService](./src/components/products-list.vue)

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
