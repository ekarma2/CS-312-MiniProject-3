require('dotenv').config();
// Get express object
const express = require('express');
const session = require('express-session');
const pool = require('./db');
// set app object
const app = express();

app.set('view engine', 'ejs');
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false
}));

// make the signed-in user available to every view
app.use((req, res, next) =>
{
  res.locals.user = req.session.user || null;
  next();
});

// block routes that need a signed-in user
function requireLogin(req, res, next)
{
  if (!req.session.user) return res.redirect('/signin');
  next();
}

// ---------- Auth ----------
app.get('/signup', (req, res) => res.render('signup', { error: null }));

app.post('/signup', async (req, res) =>
{
  const { user_id, password, name } = req.body;
  const taken = await pool.query('SELECT 1 FROM users WHERE user_id = $1', [user_id]);
  if (taken.rowCount > 0)
  {
    return res.render('signup', { error: 'That user ID is taken. Please choose a different one.' });
  }
  await pool.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, password, name]);
  res.redirect('/signin');
});

app.get('/signin', (req, res) => res.render('signin', { error: null }));

app.post('/signin', async (req, res) =>
{
  const { user_id, password } = req.body;
  const result = await pool.query(
    'SELECT user_id, name FROM users WHERE user_id = $1 AND password = $2',
    [user_id, password]
  );
  if (result.rowCount === 0)
  {
    return res.render('signin', { error: 'Incorrect user ID or password. Please try again.' });
  }
  req.session.user = result.rows[0];
  res.redirect('/');
});

app.post('/signout', (req, res) =>
{
  req.session.destroy(() => res.redirect('/signin'));
});

// ---------- Posts ----------
// define route to display all posts, newest first
app.get('/', requireLogin, async (req, res) =>
{
  const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
  res.render('index', { posts: result.rows });
});

// show create post form
app.get('/posts/new', requireLogin, (req, res) => res.render('new'));

// handle post form submission
app.post('/posts', requireLogin, async (req, res) =>
{
  const { title, body } = req.body;
  const { user_id, name } = req.session.user;
  await pool.query(
    'INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())',
    [name, user_id, title, body]
  );
  // redirect to posts page
  res.redirect('/');
});

// add route to edit form (only the creator may load it)
app.get('/posts/:id/edit', requireLogin, async (req, res) =>
{
  const result = await pool.query(
    'SELECT * FROM blogs WHERE blog_id = $1 AND creator_user_id = $2',
    [req.params.id, req.session.user.user_id]
  );
  if (result.rowCount === 0) return res.status(403).send('You can only edit your own posts.');
  res.render('edit', { post: result.rows[0] });
});

// listen to post requests and update post content
// the creator check is part of the WHERE clause, so others can't update
app.post('/posts/:id', requireLogin, async (req, res) =>
{
  const { title, body } = req.body;
  const result = await pool.query(
    'UPDATE blogs SET title = $1, body = $2, date_updated = NOW() WHERE blog_id = $3 AND creator_user_id = $4',
    [title, body, req.params.id, req.session.user.user_id]
  );
  if (result.rowCount === 0) return res.status(403).send('You can only edit your own posts.');
  res.redirect('/');
});

// match url with text and capture ID, then delete the post
app.post('/posts/:id/delete', requireLogin, async (req, res) =>
{
  const result = await pool.query(
    'DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2',
    [req.params.id, req.session.user.user_id]
  );
  if (result.rowCount === 0) return res.status(403).send('You can only delete your own posts.');
  res.redirect('/');
});

// start server on port 3000
app.listen(3000, () => console.log('Server running on port 3000'));
