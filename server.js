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

app.set('port', process.env.PORT || 2001)
app.listen(app.get('port'), () => {
  console.log(`Server started on http://localhost:${app.get('port')}`)
})
