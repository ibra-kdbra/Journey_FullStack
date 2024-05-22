'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersData = [];

    // Generate 100 user records
    for (let i = 0; i < 100; i++) {
      //create 100 user with password 12345678
      usersData.push({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: "$2b$10$txTUun4VigCDTUEqFRdvBOGUfOEnAnfbyBOEX9Kj/BX9U9Q9rEBT2",
      });
    }

    await queryInterface.bulkInsert('users', usersData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
