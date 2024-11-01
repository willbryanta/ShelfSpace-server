const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
const User = require('../models/User.js')
const Review = require('../models/Review.js')
const router = express.Router()

router.post('/', authenticateUser, async (req, res) => {
	try {
		const createdReview = Review.create({
			title: req.body.title,
			description: req.body.description,
			rating: req.body.rating,
			author: req.body.author,
		})

		if (!createdReview) {
			res
				.status(500)
				.json({error: `Unfortunately we couldn't create that review`})
		}

		const createdReviewAuthored = await createdReview
			.populate('author')
			.execPopulate()

		res.status(200).json(createdReviewAuthored)
	} catch (error) {
		return res.status(500).json(error.message)
	}
})

router.put('/:reviewId', authenticateUser, async (req, res) => {
	try {
		const updatedReview = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				title: req.body.title,
				description: req.body.description,
				rating: req.body.rating,
			},
			{new: true}
		)

		if (!updatedReview) {
			return res
				.status(404)
				.json({error: `Unfortunately we couldn't find that review`})
		}

		const item = await updatedReview.populate('author').execPopulate()

		res.status(200).json({error: item})
	} catch (error) {
		res.status(500).json(error.message)
	}
})

router.delete('/:reviewId', authenticateUser, async (req, res) => {
	try {
		const deletedReview = await Review.findById(req.params.reviewId)
		if (!deletedReview) {
			res.status(404)
			throw new Error('Review not found.')
		}

		if (!deletedReview.isOwner(req.body.user)) {
			res.status(403)
			throw new Error('This review does not belong to you.')
		}

		res.status(200).json(deletedReview)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({error: error.message})
		} else {
			res.status(500).json({error: error.message})
		}
	}
})

module.exports = router
