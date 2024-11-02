const express = require("express")
const authenticateUser = require("../middleware/authenticateUser.js")
const User = require("../models/User.js")
const LibraryItem = require("../models/LibraryItem.js")
const router = express.Router()

router.get("/", (req, res) => {
	try {
		const library = LibraryItem.find()

		if (!library) {
			return res.status(404).json({
				error: `Unfortunately we can't find the items you're looking for`,
			})
		}
		return res.status(200).json(library)
	} catch (error) {
		return res.status(500).json(error.message)
	}
})

router.put("/:itemId", async (req, res) => {
	try {
		const item = await LibraryItem.findByIdAndUpdate(
			req.params.itemId,
			{
				name: req.body.name,
				description: req.body.description,
				publicationDate: req.body.publicationDate,
				author: req.body.author,
			},
			{ new: true }
		)

		if (!item) {
			return res
				.status(404)
				.json({ error: "Unfortunately we cannot locate that item" })
		}

		// Can't chain .populate() on .findByIdAndUpdate(), so can just call .populate() method on instance of item
		item = await item.populate("ownedReviews").execPopulate()

		res.status(200).json({ item })
	} catch (error) {
		res.status(500).json(error.message)
	}
})

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

router.get('/:itemId', async (req, res) => {
	try {
		const foundItem = await LibraryItem.findById(req.params.itemId);
		if (!foundItem) {
			res.status(404)
			throw new Error('Library item not found.')
		}
		res.status(200).json(foundItem)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({ error: error.message });
		} else {
			res.status(500).json({ error: error.message });
		}
	}
})

module.exports = router
