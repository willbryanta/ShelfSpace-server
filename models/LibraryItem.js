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

// libraryItemSchema.pre('remove', async function (next) {
// 	try {
// // Remove the movie from all users' lists
// 		await User.updateMany(
// 			{ "lists.items": this._id },
// 			{ $pull: { "lists.$.items": this._id } }
// 		)

// 		await Review.deleteMany({ libraryItem: this._id })
// 		next()
// 	} catch (error) {
// 		next(error)
// 	}
// })

module.exports = mongoose.model('LibraryItem', libraryItemSchema)
