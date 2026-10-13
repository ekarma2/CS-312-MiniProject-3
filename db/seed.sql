-- Run after schema.sql to give the app starting users and posts

-- Starting users 
INSERT INTO users (user_id, password, name) VALUES
  ('Eli',   'Eli123',   'Eli Vogelhuber'),
  ('maya',  'maya123',  'Maya Chen'),
  ('Lebron','Lebron123','Lebron James');

-- Starting blog posts
INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES
  ('Eli Vogelhuber', 'Eli', 'Hello World',
   'This is my first post. Welcome to the blog!',
   '2026-09-01 09:15:00'),
  ('Maya Chen', 'maya', 'My Favorite Food',
   'I love pasta. It is easy to make and tastes great.',
   '2026-09-05 14:30:00'),
  ('Lebron James', 'Lebron', 'Game Day',
   'Big game tonight. Time to lock in! ',
   '2026-09-12 18:45:00'),
  ('Eli Vogelhuber', 'Eli', 'Weekend Plans',
   'This weekend I am going for a hike. I wonder what Lebrons doing.',
   '2026-09-20 11:00:00'),
  ('Maya Chen', 'maya', 'Study Tips',
   'Eat lots of pasta. It makes studying easier.',
   '2026-09-28 20:10:00');
