const express = require("express")
const authenticateUser = require("../middleware/authenticateUser.js")
const User = require("../models/User.js")
const Review = require("../models/Review.js")
const router = express.Router()

router.put("/:reviewId", authenticateUser, async (req, res) => {
	try {
		const review = await Review.findByIdAndUpdate(
			req.params.reviewId,
			{
				title: req.body.title,
				description: req.body.description,
				rating: req.body.rating,
			},
			{ new: true }
		)

		if (!review) {
			return res
				.status(404)
				.json({ error: `Unfortunately we couldn't find that review` })
		}

		item = await review.populate("author").execPopulate()

		res.status(200).json({ error: item })
	} catch (error) {
		res.status(500).json(error.message)
	}
})

module.exports = router