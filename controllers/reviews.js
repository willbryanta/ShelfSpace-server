const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
const User = require('../models/User.js')
const Review = require('../models/Review.js')
const LibraryItem = require('../models/LibraryItem.js')
const router = express.Router()

router.post('/', authenticateUser, async (req, res) => {
	try {
		const createdReview = Review.create({
			title: req.body.title,
			description: req.body.description,
			rating: req.body.rating,
			author: req.body.author,
			libraryItem: req.body.libraryItemId,
		})
		if (!createdReview) {
			return res.status(500).json({
				error: `Unfortunately we couldn't create that review`,
			})
		}
		const parentItem = await LibraryItem.findById(req.body.libraryItemId)
		parentItem.reviews.push(createdReview)
		await parentItem.save()
		const createdReviewAuthored = await createdReview
			.populate('author')
			.execPopulate()
		res.status(200).json(createdReviewAuthored)
	} catch (error) {
		return res.status(500).json({error})
	}
})

router.put('/:reviewId', authenticateUser, async (req, res) => {
	try {
		const targetReview = await Review.findById(req.params.reviewId)
		if (!targetReview) {
			return res.status(404).json({
				error: "Uh-oh! We couldn't find that review.",
			})
		}
		if (!targetReview.isOwner(req.user)) {
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}

		const updatedReview = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				title: req.body.title,
				description: req.body.description,
				rating: req.body.rating,
			},
			{new: true}
		).populate('author')

		if (!updatedReview) {
			return res
				.status(404)
				.json({error: `Unfortunately we couldn't update that review`})
		}

		res.status(200).json(updatedReview)
	} catch (error) {
		res.status(500).json({error})
	}
})

router.delete('/:reviewId', authenticateUser, async (req, res) => {
	try {
		const targetReview = await Review.findById(req.params.reviewId)
		if (!targetReview) {
			return res.status(404).json({ error: 'Review not found.' })
		}
		if (!targetReview.isOwner(req.user)) {
			return res.status(403).json({ error: 'This review does not belong to you.' })
		}
		const deletedReview = await Review.findByIdAndDelete(targetReview._id)
		const updatedLibraryItem = await LibraryItem.findById(
			deletedReview.LibraryItem
		)
		updatedLibraryItem.reviews.pull({_id: deletedReview._id})
		await updatedLibraryItem.save()
		res.status(200).json(targetReview)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({error})
		} else {
			res.status(500).json({error})
		}
	}
})

module.exports = router
