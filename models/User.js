const mongoose = require('mongoose')

const listSchema = new mongoose.Schema(
	{
		listName: {
			type: String,
			required: true,
		},
		items: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'LibraryItem',
			},
		],
	},
	{timestamps: true}
)

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			unique: true,
			required: true,
		},
		hashedPassword: {
			type: String,
			required: true,
		},
		lists: [listSchema],
	},
	{
		timestamps: true,
		methods: {
			isOwner: function (User) {
				return this._id.equals(User._id)
			},
		},
	}
)

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		delete returnedObject.hashedPassword
	},
})

module.exports = mongoose.model('User', userSchema)
