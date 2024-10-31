const mongoose = require("mongoose")

const listSchema = new mongoose.Schema({
	listName: {
		type: String,
		required: true,
	},
	items: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "LibraryItem",
	},
})

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
	},
	hashedPassword: {
		type: String,
		required: true,
	},
	ownedReviews: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Review",
	},
	lists: [listSchema],
})

userSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		delete returnedObject.hashedPassword
	},
})

module.exports = mongoose.model("User", userSchema)
