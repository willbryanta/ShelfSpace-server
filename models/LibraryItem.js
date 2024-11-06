const mongoose = require('mongoose')
const User = require('./User')
const Review = require('./Review')

const libraryItemSchema = new mongoose.Schema(
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
			ref: 'User',
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
	},
	{
		timestamps: true,
		methods: {
			isOwner: function (User) {
				return this.author.equals(User._id)
			},
		},
	}
)

module.exports = mongoose.model('LibraryItem', libraryItemSchema)
