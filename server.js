//----------------------- DB Setup
const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGODB_URI)

//----------------------- Module Imports
const express = require('express')
const app = express()
const cors = require('cors')
const authRouter = require('./controllers/auth')
const usersRouter = require('./controllers/users')
const libraryItemsRouter = require('./controllers/library')
const reviewRouter = require('./controllers/reviews')
const searchRouter = require('./controllers/searchMovies')

//----------------------- Server Config
app.listen(process.env.PORT) // get PORT from .env
app.use(express.json())
app.use(cors())
app.use('/auth', authRouter)
app.use('/users', usersRouter)

// nit pick: consider /libraryItems instead
// given that libraryItems is more representative of the 'entity'/noun, /libraryItems might be more appropriate
// in the future, you may reserve `library` for different communities, which your user can potentially be part of
// within each library, there may be a different collection of `libraryItem` :) 
app.use('/library', libraryItemsRouter)
app.use('/reviews', reviewRouter)

// nit pick: consider /movies to follow the RESTful convention
app.use('/search-movies', searchRouter)
mongoose.connection.on('connected', () => {
	console.log(`Connected to ${mongoose.connection.name}.`)
})

//----------------------- Routing
app.get('/', (req, res) => {
	res.status(200).send('Hello World')
})
