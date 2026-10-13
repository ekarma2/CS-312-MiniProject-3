const { Pool } = require('pg');

// Connection settings come from env vars, defaulting to the local BlogDB
module.exports = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'BlogDB',
  user: process.env.PGUSER || process.env.USER,
  password: process.env.PGPASSWORD
});
