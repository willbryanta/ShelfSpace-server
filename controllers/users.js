const express = require("express")
const authenticateUser = require("../middleware/authenticateUser.js")
const User = require("../models/user.js")
const router = express.Router()

router.use(authenticateUser)
router.post("/:userId/lists", async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)

		if (!targetUser) {
			return res.status(404).json({ error: "user not found!" })
		}

		if (!isOwner(req.user, targetUser)) {
			return res.status(403).json({
				error: " You don't have permission to create this new list!",
			})
        }
        
        const newList = 
    } catch (error) {
        return res.status(500).json({error: " The server fell down, try again later!"})
    }
})
