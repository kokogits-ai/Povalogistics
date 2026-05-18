import pg from 'pg';
const { Pool } = pg;

// The DATABASE_URL will be provided by Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool
};
