const mongoose = require('mongoose')
const User = require('./User')
const Review = require('./Review')

const libraryItemSchema = new mongoose.Schema(
	{
		posterPath: {
			type: String,
		},
		title: {
			type: String,
			required: true,
		},
		overview: {
			type: String,
		},
		releaseDate: {
			type: Date,
			required: true,
		},
		popularity: {
			type: Number
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
