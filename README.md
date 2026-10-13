# Blog App (Mini-Project 3)

A blog built with Node.js, Express, EJS, and PostgreSQL. Users sign up, sign in, and can create, edit, and delete their own posts.

## Setup

1. Install Node.js and PostgreSQL.
2. Create a database named `BlogDB` (pgAdmin, or `createdb BlogDB`).
3. Load the tables and starter data:
   ```
   psql BlogDB -f db/schema.sql
   psql BlogDB -f db/seed.sql
   ```
4. Copy `.env.example` to `.env` and set `PGUSER` and `PGPASSWORD` for your PostgreSQL install.
5. Install and run:
   ```
   npm install
   npm start
   ```
6. Open http://localhost:3000

## Starter accounts

| user_id | password  |
|---------|-----------|
| eli     | eli123    |
| maya    | maya123   |
| jordan  | jordan123 |

## Notes

- Only a post's creator can edit or delete it; this is enforced in the SQL `WHERE` clause as well as in the UI.
- Passwords are stored as plain text to match the assignment. Do not reuse this for a real app.
