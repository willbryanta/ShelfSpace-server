const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
const User = require('../models/User.js')
const LibraryItem = require('../models/LibraryItem.js')
const Review = require('../models/Review.js')
const router = express.Router()

router.post('/', authenticateUser, async (req, res) => {
	try {
		const createdLibraryItem = await LibraryItem.create({
			name: req.body.name,
			description: req.body.description,
			publicationDate: req.body.publicationDate,
			author: req.user,
			reviews: [],
		})
		await createdLibraryItem.populate('author')
		res.status(201).json(createdLibraryItem)
	} catch (error) {
		res.status(500).json({error})
	}
})

router.get('/', async (req, res) => {
	try {
		const library = await LibraryItem.find().populate('reviews')
		if (!library) {
			return res.status(404).json({
				error: `Unfortunately we can't find the items you're looking for`,
			})
		}
		return res.status(200).json(library)
	} catch (error) {
		return res.status(500).json({error})
	}
})

router.get('/:itemId', async (req, res) => {
	try {
		const foundItem = await LibraryItem.findById(req.params.itemId)
			.populate('author')
			.populate('reviews')
		if (!foundItem) {
			res.status(404)
			throw new Error('Library item not found.')
		}
		await foundItem.populate('reviews.author')
		res.status(200).json(foundItem)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({error})
		} else {
			res.status(500).json({error})
		}
	}
})

router.put('/:itemId', async (req, res) => {
	try {
		const item = await LibraryItem.findByIdAndUpdate(
			req.params.itemId,
			{
				name: req.body.name,
				description: req.body.description,
				publicationDate: req.body.publicationDate,
				author: req.body.author,
			},
			{new: true}
		)
		if (!item) {
			return res
				.status(404)
				.json({error: 'Unfortunately we cannot locate that item'})
		}
		res.status(200).json({item})
	} catch (error) {
		res.status(500).json({error})
	}
})

router.delete('/:itemId', authenticateUser, async (req, res) => {
	try {
		const targetLibraryItem = await LibraryItem.findById(req.params.itemId)
		if (!targetLibraryItem) {
			res.status(404)
			throw new Error('Library item not found.')
		}
		if (!targetLibraryItem.isOwner(req.body.user)) {
			res.status(403)
			throw new Error('This library item does not belong to you.')
		}
		//prettier-ignore
		const deletedReviews = await Review.deleteMany({
			_id: {"$in": targetLibraryItem.reviews},
		})
		//prettier-ignore
		const deletedListItems = await User.updateMany(
			{'lists.items': targetLibraryItem._id},
			{ "$pull": { 'lists.$[].items': targetLibraryItem._id } }
			//The magic rune $[] instructs the query to pull from all arrays that match the query
		)
		const deletedLibraryItem = await LibraryItem.findByIdAndDelete(
			targetLibraryItem._id
		)
		res.status(200).json(deletedLibraryItem)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({error})
		} else {
			res.status(500).json({error})
		}
	}
})
module.exports = router
