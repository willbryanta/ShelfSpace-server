const express = require("express")
const router = express.Router()
const User = require("../models/user.js")
const LibraryItem = require("../models/LibraryItem.js")
const authenticateUser = require("../middleware/authenticateUser.js")

router.post("/", authenticateUser, async (req, res) => {
	try {
		const createdLibraryItem = await LibraryItem.create({
			name: req.body.name,
			description: req.body.description,
			publicationDate: req.body.publicationDate,
			author: req.body.author,
			reviews: [],
		})
		res.status(201).json(createdLibraryItem)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
