import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const connectToDb = async () => {
  try {
    await pool.connect();
    console.log('Welcome to Employee Tracker. Enjoy your stay!');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

export { pool, connectToDb };