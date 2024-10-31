const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: String,
		rating: {
			type: Number,
			enum: [0, 1, 2, 3, 4, 5],
		},
		author: {
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Review", reviewSchema)
