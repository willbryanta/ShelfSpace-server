const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
const User = require('../models/User')
const Review = require('../models/Review')
const router = express.Router()
const bcrypt = require('bcrypt')
SALT_LENGTH = 12

router.use(authenticateUser)

router.get('/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).populate('lists.items')
		if (!user) {
			res.status(404)
			throw new Error('User not found')
		}
		if (!user.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		const reviews = await Review.find({author: user._id})
			.populate('author')
			.populate('libraryItem')
		res.status(200).json({user, reviews})
	} catch (error) {
		if (res.statusCode === 404) {
			res.json({error})
		} else {
			res.status(500).json({error})
		}
	}
})

// personal opinion: reading the routes below, it actually feels more 'natural' to me for list to actually be it's own entity which has a relationship with 'user'
router.post('/:userId/lists', async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({error: 'user not found!'})
		}
		if (!targetUser.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: " You don't have permission to create this new list!",
			})
		}
		targetUser.lists.push(req.body.newList)
		await targetUser.save()
		await targetUser.populate('lists.items')
		res.status(201).json(targetUser.lists[targetUser.lists.length - 1])
	} catch (error) {
		return res
			.status(500)
			.json({error: ' The server fell down, try again later!'})
	}
})

router.post('/:userId/lists/default', async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({error: 'user not found!'})
		}
		if (!targetUser.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: "You don't have permission to create this new list!",
			})
		}
		const targetListIndex = targetUser.lists.findIndex((list) => {
			// opportunity: "To Watch" can be a constant that way there is one source of truth on the value of the default list name
			return list.listName === 'To Watch'
		})
		targetUser.lists[targetListIndex].items.push(req.body.addedFilm._id)
		await targetUser.save()
		res.status(201).json(targetUser)
	} catch (error) {
		return res
			.status(500)
			.json({error: ' The server fell down, try again later!'})
	}
})

router.get('/:userId/lists/:listId', async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId).populate(
			'lists.items'
		)
		if (!targetUser) {
			return res.status(404).json({error: 'user not found!'})
		}
		if (!targetUser.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		const targetList = targetUser.lists.id(req.params.listId)
		if (!targetList) {
			return res.status(404).json({error: 'List not found!'})
		}
		return res.status(200).json(targetList)
	} catch (error) {
		return res.status(500).json({error})
	}
})

router.put('/:userId/lists/:listId', async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({
				error: "Uh-oh! We couldn't find what you're looking for.",
			})
		}
		if (!targetUser.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		const updatedList = targetUser.lists.id(req.params.listId)
		updatedList.listName = req.body.updatedList.listName
		updatedList.items = req.body.updatedList.items
		await targetUser.save()
		await targetUser.populate('lists.items')
		res.status(200).json(updatedList)
	} catch (error) {
		res.status(500).json({error})
	}
})

router.delete('/:userId/lists/:listId', async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({
				error: "Uh-oh! We couldn't find what you're looking for.",
			})
		}
		if (!targetUser.isOwner(req.user)) {
			// http 401 is a more appropriate response, as it is an unauthorised request: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		targetUser.lists.pull({_id: req.params.listId})
		await targetUser.save()
		res.status(200).json(targetUser)
	} catch (error) {
		res.status(500).json({error})
	}
})

module.exports = router
