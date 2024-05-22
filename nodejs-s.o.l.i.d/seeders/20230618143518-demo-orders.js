'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('orders', [
      {
        userId: 1,
        product: 'Product 1',
        quantity: 5,
        price: 10.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        product: 'Product 2',
        quantity: 3,
        price: 7.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add more seed data as needed
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('orders', null, {});
  },
};
