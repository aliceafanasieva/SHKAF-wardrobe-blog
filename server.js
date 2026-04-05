const express = require('express');
const { Liquid } = require('liquidjs');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const fsPromises = fs.promises;
const app = express();
const PORT = 3000;

const engine = new Liquid({
  root: path.resolve(__dirname, 'views'),
  extname: '.liquid'
});

app.engine('liquid', engine.express());
app.set('views', './views');
app.set('view engine', 'liquid');

app.use(express.static('public'));
app.use('/assets', express.static('assets'));
app.use('/images', express.static('assets/images'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BLOG_PATH = path.resolve(__dirname, 'data/data.json');
const USERS_PATH = path.resolve(__dirname, 'data/users.json');

async function readJson(filePath, fallbackValue) {
  try {
    if (!fs.existsSync(filePath)) {
      await fsPromises.writeFile(filePath, JSON.stringify(fallbackValue, null, 2));
      return fallbackValue;
    }

    const fileContent = await fsPromises.readFile(filePath, 'utf-8');

    if (!fileContent.trim()) {
      return fallbackValue;
    }

    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return fallbackValue;
  }
}

async function writeJson(filePath, data) {
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
}

function getUserEmail(req) {
  return req.query.user || req.body.userEmail || '';
}

function getFavoritePosts(allPosts, favoriteIds) {
  return allPosts.filter(function (post) {
    return favoriteIds.includes(post.id);
  });
}

function createLayoutData(options) {
  return {
    title: options.title,
    includeContent: options.includeContent,
    bodyClass: options.bodyClass || '',
    userEmail: options.userEmail || '',
    posts: options.posts || [],
    favoriteIds: options.favoriteIds || [],
    blog: options.blog || null,
    errorMessage: options.errorMessage || '',
    successMessage: options.successMessage || ''
  };
}

app.get('/', function (req, res) {
  res.render('partials/layout', createLayoutData({
    title: 'Landing',
    includeContent: 'partials/landing-content',
    bodyClass: 'landing-page',
    userEmail: ''
  }));
});

app.get('/register', function (req, res) {
  res.render('register', {
    title: 'Create account',
    errorMessage: ''
  });
});

app.post('/register', async function (req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).render('register', {
        title: 'Create account',
        errorMessage: 'Please fill in all fields.'
      });
    }

    const users = await readJson(USERS_PATH, []);

    const existingUser = users.find(function (user) {
      return user.email.toLowerCase() === email.toLowerCase();
    });

    if (existingUser) {
      return res.status(409).render('register', {
        title: 'Create account',
        errorMessage: 'An account with this email already exists.'
      });
    }

    const newUser = {
      name: name,
      email: email,
      password: password,
      favorites: []
    };

    users.push(newUser);
    await writeJson(USERS_PATH, users);

    res.redirect(`/blog?user=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).render('register', {
      title: 'Create account',
      errorMessage: 'Something went wrong while creating your account.'
    });
  }
});

app.get('/login', function (req, res) {
  res.render('login', {
    title: 'Login',
    errorMessage: ''
  });
});

app.post('/login', async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Login',
        errorMessage: 'Please enter both email and password.'
      });
    }

    const users = await readJson(USERS_PATH, []);

    const existingUser = users.find(function (user) {
      return user.email.toLowerCase() === email.toLowerCase();
    });

    if (!existingUser || existingUser.password !== password) {
      return res.status(401).render('login', {
        title: 'Login',
        errorMessage: 'Email or password is incorrect.'
      });
    }

    res.redirect(`/blog?user=${encodeURIComponent(existingUser.email)}`);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', {
      title: 'Login',
      errorMessage: 'Something went wrong while logging in.'
    });
  }
});

app.get('/landing', function (req, res) {
  res.redirect('/');
});

app.get('/blog', async function (req, res) {
  try {
    const userEmail = getUserEmail(req);

    if (!userEmail) {
      return res.redirect('/login');
    }

    const blogFile = await readJson(BLOG_PATH, { data: [] });
    const users = await readJson(USERS_PATH, []);

    const currentUser = users.find(function (user) {
      return user.email === userEmail;
    });

    if (!currentUser) {
      return res.redirect('/login');
    }

    const reversedPosts = [...blogFile.data].reverse();

    res.render('partials/layout', createLayoutData({
      title: 'Blog',
      includeContent: 'partials/blog-content',
      posts: reversedPosts,
      favoriteIds: currentUser.favorites,
      bodyClass: 'blog-page',
      userEmail: currentUser.email
    }));
  } catch (error) {
    console.error('Error loading blog:', error);
    res.status(500).send('Internal server error while loading the blog.');
  }
});

app.get('/favorites', async function (req, res) {
  try {
    const userEmail = getUserEmail(req);

    if (!userEmail) {
      return res.redirect('/login');
    }

    const blogFile = await readJson(BLOG_PATH, { data: [] });
    const users = await readJson(USERS_PATH, []);

    const currentUser = users.find(function (user) {
      return user.email === userEmail;
    });

    if (!currentUser) {
      return res.redirect('/login');
    }

    const favoritePosts = getFavoritePosts(blogFile.data, currentUser.favorites).reverse();

    res.render('partials/layout', createLayoutData({
      title: 'Favorites',
      includeContent: 'partials/favorites-content',
      posts: favoritePosts,
      favoriteIds: currentUser.favorites,
      bodyClass: 'blog-page',
      userEmail: currentUser.email
    }));
  } catch (error) {
    console.error('Error loading favorites:', error);
    res.status(500).send('Internal server error while loading favorites.');
  }
});

app.post('/favorites', async function (req, res) {
  try {
    const id = req.body.id;
    const userEmail = req.body.userEmail;

    if (!id || !userEmail) {
      return res.status(400).json({ error: 'Missing post id or user email.' });
    }

    const blogFile = await readJson(BLOG_PATH, { data: [] });
    const users = await readJson(USERS_PATH, []);

    const currentUser = users.find(function (user) {
      return user.email === userEmail;
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const postExists = blogFile.data.some(function (post) {
      return post.id === id;
    });

    if (!postExists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (!currentUser.favorites.includes(id)) {
      currentUser.favorites.push(id);
      await writeJson(USERS_PATH, users);
    }

    res.status(200).json({ message: 'Added to favorites.' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/favorites/remove', async function (req, res) {
  try {
    const id = req.body.id;
    const userEmail = req.body.userEmail;

    if (!id || !userEmail) {
      return res.status(400).json({ error: 'Missing post id or user email.' });
    }

    const users = await readJson(USERS_PATH, []);

    const currentUser = users.find(function (user) {
      return user.email === userEmail;
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    currentUser.favorites = currentUser.favorites.filter(function (favoriteId) {
      return favoriteId !== id;
    });

    await writeJson(USERS_PATH, users);

    res.status(200).json({ message: 'Removed from favorites.' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/:slug', async function (req, res) {
  try {
    const slug = req.params.slug;
    const userEmail = getUserEmail(req);

    const blogFile = await readJson(BLOG_PATH, { data: [] });
    const users = await readJson(USERS_PATH, []);

    const currentUser = users.find(function (user) {
      return user.email === userEmail;
    });

    const selectedPost = blogFile.data.find(function (post) {
      return post.slug === slug;
    });

    if (!selectedPost) {
      return res.status(404).send('Post not found.');
    }

    res.render('partials/layout', createLayoutData({
      title: selectedPost.title,
      includeContent: 'partials/article-content',
      blog: selectedPost,
      bodyClass: 'blog-page',
      userEmail: userEmail,
      favoriteIds: currentUser ? currentUser.favorites : []
    }));
  } catch (error) {
    console.error('Error loading article:', error);
    res.status(500).send('Internal server error while loading the article.');
  }
});

app.listen(PORT, function () {
  console.log(`Server running on http://localhost:${PORT}`);
});