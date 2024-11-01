const express = require("express")
const authenticateUser = require("../middleware/authenticateUser.js")
const User = require("../models/user.js")
const router = express.Router()
const bcrypt = require("bcrypt")
const User = require("../models/user")
SALT_LENGTH = 12

router.use(authenticateUser)

router.get("/:userId", async (req, res) => {
	try {
		const userProfile = await User.findById(req.params.userId).populate(
			"ownedReviews"
		)
		if (!userProfile) {
			res.status(404)
			throw new Error("User not found")
		}
		if (!userProfile.isOwner(req.body.user)) {
			return res
				.status(403)
				.json({ error: "Oops! It doesn't look like that belongs to you!" })
		}
		res.status(200).json(userProfile)
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({ error: error.message })
		} else {
			res.status(500).json({ error: error.message })
		}
	}
})

router.put("/:userId", async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({
				error: "Uh-oh! We couldn't find what you're looking for.",
			})
		}
		const nameInDatabase = await User.findOne({ username: req.body.username })
		if (!targetUser.isOwner(req.body.user)) {
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		if (nameInDatabase && nameInDatabase._id !== targetUser._id) {
			return res.status(403).json({
				error:
					"That username is already taken. How about trying a different one?",
			})
		}
		targetUser.username = req.body.username
		targetUser.hashedPassword = bcrypt.hashSync(req.body.password, SALT_LENGTH)
		await targetUser.save()
		return res.status(200).json({ targetUser })
	} catch (error) {
		res.status(500).json(error.message)
	}
})

router.post("/:userId/lists", async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)

		if (!targetUser) {
			return res.status(404).json({ error: "user not found!" })
		}

		if (!targetUser.isOwner(req.user)) {
			return res.status(403).json({
				error: " You don't have permission to create this new list!",
			})
		}

		targetUser.lists.push(req.body.newList)
		await targetUser.save()

		return res.status(201).json(targetUser.lists)
	} catch (error) {
		return res
			.status(500)
			.json({ error: " The server fell down, try again later!" })
	}
})

router.put("/:userId/lists/:listId", async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({
				error: "Uh-oh! We couldn't find what you're looking for.",
			})
		}
		if (!targetUser.isOwner(req.body.user)) {
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		targetUser.lists.pull({ _id: req.params.listId })
		targetUser.lists.push(req.params.updatedList)
		await targetUser.save()
		res.status(200).json({ targetUser })
	} catch (error) {
		res.status(500).json(error.message)
	}
})

module.exports = router
