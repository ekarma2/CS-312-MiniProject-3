const { Pool } = require('pg');

// Connection settings from env vars
module.exports = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'BlogDB',
  user: process.env.PGUSER || process.env.USER,
  password: process.env.PGPASSWORD
});
