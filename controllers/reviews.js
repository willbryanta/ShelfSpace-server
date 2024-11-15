const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
// nit pick: unused Import of User
const User = require('../models/User.js')
const Review = require('../models/Review.js')
const LibraryItem = require('../models/LibraryItem.js')
const router = express.Router()

router.post('/', authenticateUser, async (req, res) => {
	try {
		const createdReview = await Review.create({
			title: req.body.title,
			description: req.body.description,
			rating: req.body.rating,
			author: req.user,
			libraryItem: req.body.libraryItem,
		})
		// Curious what led you to write the below if statement? Did you run into a specific error?
		// await Review.create(...) will guarantee a successful creation of a new MongoDB document once the request is processed successfully and promise is resolved.
		// When the promise is resolved, a MongoDB Document will be returned. Thus, it `createdReview` will never be falsy leading to the if statement below redundant.
		// Should any error occur during creation process, it will throw an error and be caught in the `catch` block.
		if (!createdReview) {
			return res.status(500).json({
				error: `Unfortunately we couldn't create that review`,
			})
		}
		const parentItem = await LibraryItem.findById(createdReview.libraryItem)
		parentItem.reviews.push(createdReview)
		await parentItem.save()
		const createdReviewAuthored = await createdReview
			.populate('author')
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
				// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}

		// Instead of re-querying the database for a review that has already been fetched in L40, you can directly update `targetReview` with updated properties, then perform `await targetReview.save()`
		// doing it this way will make this request slightly more optimal, reducing 1 network call to the database.
		const updatedReview = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				title: req.body.title,
				description: req.body.description,
				rating: req.body.rating,
			},
			{new: true}
		).populate('author')

		// In addition, it will also reduce this check given you have already fetched and found this review already
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
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({ error: 'This review does not belong to you.' })
		}
		const deletedReview = await Review.findByIdAndDelete(targetReview._id)
		const updatedLibraryItem = await LibraryItem.findById(
			deletedReview.libraryItem
		)

		// Thought exercise: given `Review model` already has a ref to `LibraryItem model` - how may your implementation/query/delete pattern/performance change if `LibraryItem model` did not consist of `reviews` property?
		updatedLibraryItem.reviews.pull({_id: deletedReview._id})
		await updatedLibraryItem.save()
		
		res.status(200).json(deletedReview)
	} catch (error) {
		if (res.statusCode === 404) {
			// Your implementation will never reach here as you have responded to the request directly in L82
			// To reach here, you should instead
			// 1. in L82, `res.status(404)` 
			// 2. then `throw new Error('Review not found.')`
			// refer to https://github.com/willbryanta/ShelfSpace-server/blob/3de09b04bc1b1205ba0b553d687f3ed5387f087b/controllers/users.js#L11-L35
			res.json({error})
		} else {
			res.status(500).json({error})
		}
	}
})

module.exports = router
