// Load settings from .env
require('dotenv').config({ quiet: true });
// Get express object
const express = require('express');
const session = require('express-session');
// PostgreSQL connection pool
const db = require('./db');
// set app object
const app = express();

app.set('view engine', 'ejs');
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// session keeps track of who is signed in
app.use(session(
{
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));

// make the signed in user and any one-time message available in every view
app.use((req, res, next) =>
{
  res.locals.user = req.session.user || null;
  res.locals.message = req.session.message || null;
  delete req.session.message;
  next();
});

// block pages that need an account
function requireLogin(req, res, next)
{
  if (!req.session.user)
  {
    return res.redirect('/signin');
  }
  next();
}

// ---------- Sign up / Sign in ----------

// show signup form
app.get('/signup', (req, res) =>
{
  res.render('signup', { error: null, form: {} });
});

// handle signup form submission
app.post('/signup', async (req, res) =>
{
  const user_id = (req.body.user_id || '').trim();
  const name = (req.body.name || '').trim();
  const password = req.body.password || '';

  try
  {
    // check if the user_id is already taken
    const existing = await db.query('SELECT user_id FROM users WHERE user_id = $1', [user_id]);
    if (existing.rows.length > 0)
    {
      return res.render('signup',
      {
        error: `The user ID "${user_id}" is already taken. Please choose a different one.`,
        form: { user_id, name }
      });
    }

    // add the new user
    await db.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, password, name]);
    req.session.message = 'Account created! Please sign in.';
    res.redirect('/signin');
  }
  catch (err)
  {
    console.error(err.message);
    res.render('signup', { error: 'Something went wrong. Please try again.', form: { user_id, name } });
  }
});

// show signin form
app.get('/signin', (req, res) =>
{
  res.render('signin', { error: null, form: {} });
});

// handle signin form submission
app.post('/signin', async (req, res) =>
{
  const user_id = (req.body.user_id || '').trim();
  const password = req.body.password || '';

  try
  {
    // look for a user with this user_id and password
    const result = await db.query(
      'SELECT user_id, name FROM users WHERE user_id = $1 AND password = $2',
      [user_id, password]
    );
    if (result.rows.length === 0)
    {
      return res.render('signin',
      {
        error: 'Incorrect user ID or password. Please try again.',
        form: { user_id }
      });
    }

    // remember the user and go to the blog feed
    req.session.user = result.rows[0];
    res.redirect('/');
  }
  catch (err)
  {
    console.error(err.message);
    res.render('signin', { error: 'Something went wrong. Please try again.', form: { user_id } });
  }
});

// sign out
app.post('/signout', (req, res) =>
{
  req.session.destroy(() => res.redirect('/signin'));
});

// ---------- Blog posts ----------

// blog feed: show all posts, newest first
app.get('/', requireLogin, async (req, res) =>
{
  try
  {
    const result = await db.query('SELECT * FROM blogs ORDER BY date_created DESC');
    res.render('index', { posts: result.rows });
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).send('Could not load posts.');
  }
});

// show create post form
app.get('/posts/new', requireLogin, (req, res) =>
{
  res.render('new');
});

// handle post form submission
app.post('/posts', requireLogin, async (req, res) =>
{
  try
  {
    // creator comes from the signed in user, not the form
    await db.query(
      'INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())',
      [req.session.user.name, req.session.user.user_id, req.body.title, req.body.body]
    );
    res.redirect('/');
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).send('Could not create post.');
  }
});

// find a post and make sure the signed in user created it
async function getOwnPost(req, res)
{
  // ids are whole numbers; anything else can't match a post
  const id = /^\d+$/.test(req.params.id) ? parseInt(req.params.id) : null;
  const result = id ? await db.query('SELECT * FROM blogs WHERE blog_id = $1', [id]) : { rows: [] };
  const post = result.rows[0];
  if (!post)
  {
    req.session.message = 'That post does not exist.';
    res.redirect('/');
    return null;
  }
  // compare the current user with the post's creator
  if (post.creator_user_id !== req.session.user.user_id)
  {
    req.session.message = 'You can only edit or delete posts you created.';
    res.redirect('/');
    return null;
  }
  return post;
}

// add route to edit form
app.get('/posts/:id/edit', requireLogin, async (req, res) =>
{
  try
  {
    const post = await getOwnPost(req, res);
    if (post)
    {
      res.render('edit', { post });
    }
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).send('Could not load post.');
  }
});

// handle edit form submission
app.post('/posts/:id', requireLogin, async (req, res) =>
{
  try
  {
    const post = await getOwnPost(req, res);
    if (post)
    {
      await db.query(
        'UPDATE blogs SET title = $1, body = $2, date_updated = NOW() WHERE blog_id = $3 AND creator_user_id = $4',
        [req.body.title, req.body.body, post.blog_id, req.session.user.user_id]
      );
      res.redirect('/');
    }
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).send('Could not update post.');
  }
});

// handle delete button
app.post('/posts/:id/delete', requireLogin, async (req, res) =>
{
  try
  {
    const post = await getOwnPost(req, res);
    if (post)
    {
      await db.query(
        'DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2',
        [post.blog_id, req.session.user.user_id]
      );
      res.redirect('/');
    }
  }
  catch (err)
  {
    console.error(err.message);
    res.status(500).send('Could not delete post.');
  }
});

// start server on port 3000 (skipped when a test script loads this file)
if (require.main === module)
{
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

module.exports = app;
