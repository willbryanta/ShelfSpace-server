const mongoose = require("mongoose")

const libraryItemSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		publicationDate: {
			type: Date,
			required: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	{ timestamps: true }
)

module.exports = mongoose.model("LibraryItem", libraryItemSchema)
