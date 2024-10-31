//----------------------- DB Setup
const mongoose = require("mongoose")
require("dotenv").config()
mongoose.connect(process.env.MONGODB_URI)

//----------------------- Module Imports
const express = require("express")
const app = express()
const authRouter = require("./controllers/auth")

/*
IMPORT CONTROLLERS GO HERE
    Auth
    Reviews
    Users
    Library
*/

//----------------------- Server Config
app.listen(process.env.PORT) // get PORT from .env
app.use(express.json())
app.use("/auth", authRouter)
/*
USE CONTROLLERS GO HERE
    Auth
    Reviews
    Users
    Library
*/

//----------------------- Routing
app.get("/", (req, res) => {
	res.status(200).send("Hello World")
})
