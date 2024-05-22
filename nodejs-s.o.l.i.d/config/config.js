require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        host: process.env.localhost,
        dialect: 'mysql',
    },
    test: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        host: process.env.localhost,
        dialect: 'mysql',
    },
    production: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        host: process.env.localhost,
        dialect: 'mysql',
    },
};
