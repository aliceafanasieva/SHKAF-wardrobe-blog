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

// Favorites pagina POST 
app.post('/favorites', async (req, res) => {
  try {
    const favoritesPath = './data/favorites.json'
    const { id } = req.body

    const blogFile = await fsPromises.readFile('./data/data.json', 'utf-8')
    const blogData = JSON.parse(blogFile)
    const post = blogData.data.find(p => p.id === id)

    if (!post) return res.status(404).json({ error: 'Post not found' })

    let favorites = []
    if (fs.existsSync(favoritesPath)) {
      favorites = JSON.parse(await fsPromises.readFile(favoritesPath, 'utf-8'))
    }
    
    const alreadyExists = favorites.some(f => f.id === id)
    if (!alreadyExists) {
      favorites.push(post)
      await fsPromises.writeFile(favoritesPath, JSON.stringify(favorites, null, 2))
    }

    res.status(200).json({ message: 'Toegevoegd aan favorieten' })
  } catch (err) {
    console.error("Fout bij opslaan favoriet:", err)
    res.status(500).json({ error: 'Serverfout' })
  }
})

app.post('/favorites/remove', async (req, res) => {
  try {
    const { id } = req.body
    const favoritesPath = './data/favorites.json'

    if (!fs.existsSync(favoritesPath)) {
      return res.status(404).json({ error: 'Favorietenlijst bestaat niet' })
    }

    const favorites = JSON.parse(await fsPromises.readFile(favoritesPath, 'utf-8'))
    const updatedFavorites = favorites.filter(post => post.id !== id)

    await fsPromises.writeFile(favoritesPath, JSON.stringify(updatedFavorites, null, 2))

    res.status(200).json({ message: 'Verwijderd uit favorieten' })
  } catch (err) {
    console.error("Fout bij verwijderen favoriet:", err)
    res.status(500).json({ error: 'Serverfout' })
  }
})


// Blogpost GET
app.get('/:slug', async (req, res) => {
  try {
    const blogFile = await fsPromises.readFile('./data/data.json', 'utf-8')
    const blogData = JSON.parse(blogFile)
    const slug = req.params.slug
    const blog = blogData.data.find(post => post.slug === slug)

    if (blog) {
      res.render('partials/layout', {
        title: blog.title,
        includeContent: 'partials/article-content',
        blog: blog,
        bodyClass: 'blog-page'
      })
    } else {
      res.status(404).send('Blog not found')
    }
  } catch (err) {
    console.error('Fout bij laden blogpost:', err)
    res.status(500).send('Interne serverfout bij laden post')
  }
});

app.listen(PORT, function () {
  console.log(`Server running on http://localhost:${PORT}`);
});