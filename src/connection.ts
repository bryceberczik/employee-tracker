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
    console.log('Connected to database successfully!');
    
    console.log(`
  _____                 _                       
 | ____|_ __ ___  _ __ | | ___  _   _  ___  ___ 
 |  _| | '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\
 | |___| | | | | | |_) | | (_) | |_| |  __/  __/
 |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|
 |_   _| __ __ _ |_|_| | _____ _|___/           
   | || '__/ _\` |/ __| |/ / _ \\ '__|            
   | || | | (_| | (__|   <  __/ |               
   |_||_|  \\__,_|\\___|_|\\_\\___|_|               
                                                
`);
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

export { pool, connectToDb };