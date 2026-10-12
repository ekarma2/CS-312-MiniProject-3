// Connection pool to the PostgreSQL database
const { Pool } = require('pg');

// connection settings come from .env (see .env.example)
const pool = new Pool(
{
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'BlogDB'
});

module.exports = pool;
