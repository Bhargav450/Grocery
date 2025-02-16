require('dotenv').config();
console.log("Loaded DB_NAME in db.js:", process.env.DB_NAME); // Debugging to confirm .env is loaded

const { Sequelize, QueryTypes } = require('sequelize');
const argon2 = require('argon2');
const secretKey = process.env.JWT_SECRET;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: console.log,
    }
);

// Check database connection status
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = { sequelize, argon2, QueryTypes, secretKey };
