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

userSchema.pre('save', function (next) {
	// opportunity: "To Watch" can be a constant that way there is one source of truth on the value of the default list name
	const DEFAULT_LIST = "To Watch"
	// Add default list
	const hasDefaultList = this.lists.find(({ listName }) => listName === DEFAULT_LIST)
	if (!hasDefaultList) {
		this.lists.push({listName: DEFAULT_LIST, items: []})
	}
	
	// Remove duplicates
	const seen = new Set()
	this.lists = this.lists.filter(({listName}) => {
		if (seen.has(listName)) {
			return false;
		}
		seen.add(listName)
		return true
	})

	next()
})

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		delete returnedObject.hashedPassword
	},
})

module.exports = mongoose.model('User', userSchema)
