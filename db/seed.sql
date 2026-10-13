-- Run after schema.sql to give the app starting users and posts

-- 3 starting users (sign in with any user_id / password pair below)
INSERT INTO users (user_id, password, name) VALUES
  ('eli',   'eli123',   'Eli Vogelhuber'),
  ('maya',  'maya123',  'Maya Chen'),
  ('jordan','jordan123','Jordan Brooks');

-- 5 starting blog posts
INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES
  ('Eli Vogelhuber', 'eli', 'Welcome to the Blog',
   'This is the first post on the blog. Sign up for an account, write a post, and come back later - everything is saved in PostgreSQL now, so nothing disappears when the server restarts.',
   '2026-09-01 09:15:00'),
  ('Maya Chen', 'maya', 'Five Things I Learned Building My First Express App',
   'Routes are just functions, middleware runs in order, EJS makes templates painless, nodemon saves a lot of restarts, and always redirect after a POST so a refresh does not resubmit the form.',
   '2026-09-05 14:30:00'),
  ('Jordan Brooks', 'jordan', 'Why Use a Database Instead of an Array?',
   'An array in memory is wiped every time the server stops. A database keeps the data on disk, lets many users share it, and gives us SQL to search, update, and delete exactly the rows we want.',
   '2026-09-12 18:45:00'),
  ('Eli Vogelhuber', 'eli', 'Weekend Hike Recap',
   'Took the trail up to the lookout on Saturday. Three hours up, an hour and a half down, and the view was worth every switchback. Bring more water than you think you need.',
   '2026-09-20 11:00:00'),
  ('Maya Chen', 'maya', 'Quick Tip: Parameterized Queries',
   'Never build SQL by gluing user input into a string. Use placeholders like $1 and $2 and pass the values separately. The pg library handles escaping and you avoid SQL injection.',
   '2026-09-28 20:10:00');
