const express = require('express')
const { Liquid } = require('liquidjs')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const fsPromises = fs.promises
const app = express()

// Liquid setup
const engine = new Liquid({
  root: path.resolve(__dirname, 'views'),
  extname: '.liquid'
})
app.engine('liquid', engine.express()) 
app.set('views', './views')
app.set('view engine', 'liquid')

// Static bestanden
app.use(express.static('public'))
app.use('/assets', express.static('assets'))
app.use('/images', express.static('assets/images'))

// Body parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// JSON blog data
const blogData = JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'))

// === Routes ===

// Login pagina GET
app.get('/', (req, res) => {
  res.render('login', { title: 'Login' })
})


//Login pagina POST
app.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body
    const userData = { name, email }
    const usersPath = './data/users.json'

    let users = []
    if (fs.existsSync(usersPath)) {
      const userFile = await fsPromises.readFile(usersPath, 'utf-8')
      users = JSON.parse(userFile)
    }

    users.push(userData)
    await fsPromises.writeFile(usersPath, JSON.stringify(users, null, 2))

    res.redirect(`/landing?name=${encodeURIComponent(name)}`)
  } catch (err) {
    console.error('Fout bij opslaan gebruiker:', err)
    res.status(500).send('Interne serverfout bij inloggen')
  }
})

// Landingspagina GET
app.get('/landing', (req, res) => {
  const name = req.query.name || 'guest'
  res.render('partials/layout', {
    title: 'Landing',
    includeContent: 'partials/landing-content',
    name: name
  })
})

// Blogpagina
app.get('/blog', async (req, res) => {
  try {
    const blogFile = await fsPromises.readFile('./data/data.json', 'utf-8')
    const blogData = JSON.parse(blogFile)
    const reversedPosts = [...blogData.data].reverse()
    const favoritesPath = './data/favorites.json'
    let favorites = []
    if (fs.existsSync(favoritesPath)) {
      favorites = JSON.parse(await fsPromises.readFile(favoritesPath, 'utf-8'))
    }
    const favoriteIds = favorites.map(f => f.id)

    res.render('partials/layout', {
      title: 'Blog',
      includeContent: 'partials/blog-content',
      posts: reversedPosts,
      favoriteIds,
      bodyClass: 'blog-page'
    })
  } catch (err) {
    console.error('Fout bij laden blog data:', err)
    res.status(500).send('Interne serverfout bij laden blog')
  }
})

// Favorites pagina GET
app.get('/favorites', async (req, res) => {
  try {
    const favFile = await fsPromises.readFile('./data/favorites.json', 'utf-8')
    const favData = JSON.parse(favFile)
    const reversedFavorites = [...favData].reverse()
    const favoritesPath = './data/favorites.json'
    let favorites = []
    if (fs.existsSync(favoritesPath)) {
      favorites = JSON.parse(await fsPromises.readFile(favoritesPath, 'utf-8'))
    }
    const favoriteIds = favorites.map(f => f.id)

    res.render('partials/layout', {
      title: 'Favorites',
      includeContent: 'partials/favorites-content',
      posts: reversedFavorites,
      favoriteIds,
      bodyClass: 'blog-page'
    })
  } catch (err) {
    console.error('Fout bij laden favorites:', err)
    res.status(500).send('Interne serverfout bij laden favorites')
  }
})

app.set('port', process.env.PORT || 2001)
app.listen(app.get('port'), () => {
  console.log(`Server started on http://localhost:${app.get('port')}`)
})
