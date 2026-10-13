-- Run this inside the BlogDB database (pgAdmin > BlogDB > Query Tool)
-- Create the database first in pgAdmin: right click Databases > Create > Database > "BlogDB"

DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS users;

-- users table: one row per account
CREATE TABLE users
(
  user_id    VARCHAR(255) PRIMARY KEY,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  date_joined TIMESTAMP NOT NULL DEFAULT NOW()
);

-- blogs table: one row per post, linked to the user who wrote it
CREATE TABLE blogs
(
  blog_id         SERIAL PRIMARY KEY,
  creator_name    VARCHAR(255) NOT NULL,
  creator_user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  date_created    TIMESTAMP NOT NULL DEFAULT NOW(),
  date_updated    TIMESTAMP
);
