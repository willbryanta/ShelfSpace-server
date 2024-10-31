const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const User = require("../models/user")
SALT_LENGTH = 12

router.put("/:userId", async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
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

module.exports = router
