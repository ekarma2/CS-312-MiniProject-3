# CS 312 Mini-Project 3: Blog with PostgreSQL

A blog built with Node.js, Express, EJS and PostgreSQL. Users sign up and sign in. Anyone signed in can read every post, and users can edit or delete only the posts they wrote. Posts and users are stored in PostgreSQL, so they are still there after the server restarts.

## Setup

1. Install [PostgreSQL](https://www.postgresql.org/download/). The installer includes pgAdmin.
2. In pgAdmin, right-click **Databases**, choose **Create > Database**, and name it `BlogDB`.
3. Open **BlogDB > Query Tool**, then run [db/schema.sql](db/schema.sql) followed by [db/seed.sql](db/seed.sql).
4. Copy `.env.example` to `.env` and set `PGPASSWORD` to your postgres password.
5. Install dependencies and start the server:
   ```
   npm install
   npm run dev
   ```
6. Open http://localhost:3000

### Starting accounts

| user_id | password  | name           |
|---------|-----------|----------------|
| eli     | eli123    | Eli Vogelhuber |
| maya    | maya123   | Maya Chen      |
| jordan  | jordan123 | Jordan Brooks  |

## Database design

**users**: `user_id` VARCHAR(255) primary key, `password` VARCHAR(255), `name` VARCHAR(255), `date_joined` TIMESTAMP

**blogs**: `blog_id` SERIAL primary key, `creator_name` VARCHAR(255), `creator_user_id` VARCHAR(255) foreign key to `users.user_id`, `title` VARCHAR(255), `body` TEXT, `date_created` TIMESTAMP, `date_updated` TIMESTAMP

| User action     | Route                     | SQL |
|-----------------|---------------------------|-----|
| Sign up         | `POST /signup`            | `SELECT` to check whether the user_id is taken, then `INSERT INTO users` |
| Sign in         | `POST /signin`            | `SELECT ... WHERE user_id = $1 AND password = $2` |
| View feed       | `GET /`                   | `SELECT * FROM blogs ORDER BY date_created DESC` |
| Create post     | `POST /posts`             | `INSERT INTO blogs` |
| Edit post       | `POST /posts/:id`         | Owner check, then `UPDATE blogs ... WHERE blog_id AND creator_user_id` |
| Delete post     | `POST /posts/:id/delete`  | Owner check, then `DELETE FROM blogs ... WHERE blog_id AND creator_user_id` |

The server checks ownership by comparing the signed-in user's `user_id` with the post's `creator_user_id`. The feed also hides the Edit and Delete buttons on other users' posts.
