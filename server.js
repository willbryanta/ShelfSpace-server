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

//----------------------- Server Config
app.listen(process.env.PORT) // get PORT from .env
app.use(express.json())
app.use(cors())
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/library', libraryItemsRouter)
app.use('/reviews', reviewRouter)
mongoose.connection.on('connected', () => {
	console.log(`Connected to ${mongoose.connection.name}.`)
})

//----------------------- Routing
app.get('/', (req, res) => {
	res.status(200).send('Hello World')
})
