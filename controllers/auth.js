const express = require('express')
const authenticateUser = require('../middleware/authenticateUser.js')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const SALT_LENGTH = 12

router.post('/signup', async (req, res) => {
	try {
		const userInDatabase = await User.findOne({username: req.body.username})
		if (userInDatabase) {
			// I love the specificity of http code 422
			return res.status(422).json({
				error:
					'That username is already taken. How about trying a different one?',
			})
		}
		const user = await User.create({
			username: req.body.username,
			hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH),
			lists: [],
		})
		const token = jwt.sign(
			{username: user.username, _id: user._id},
			process.env.JWT_SECRET
		)
		res.status(201).json({user, token})
	} catch (error) {
		res.status(500).json({error})
	}
})

router.post('/signin', async (req, res) => {
	try {
		const user = await User.findOne({username: req.body.username})
		if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
			const token = jwt.sign(
				{username: user.username, _id: user._id},
				process.env.JWT_SECRET
			)
			res.status(200).json({token})
		} else {
			res.status(401).json({error: 'Invalid username or password.'})
		}
	} catch (error) {
		res.status(500).json({error})
	}
})

router.put(`/:userId`, authenticateUser, async (req, res) => {
	try {
		const user = await User.findById(req.params.userId)
		if (!user) {
			return res.status(404).json({error: 'User not found.'})
		}
		if (!user.isOwner(req.user)) {
			return res.status(403).json({
				error: "Oops! It doesn't look like that belongs to you!",
			})
		}
		if (!bcrypt.compareSync(req.body.currentPassword, user.hashedPassword)) {
			return res
			.status(403)
			.json({error: 'Oh dear! That password is incorrect'})
		}
		
		const nameInDatabase = await User.findOne({username: req.body.username})
		if (nameInDatabase && !nameInDatabase._id.equals(user._id)) {
			return res.status(422).json({
				error:
					'That username is already taken. How about trying a different one?',
			})
		}
		user.username = req.body.username
		if (req.body.password) {
			user.hashedPassword = bcrypt.hashSync(req.body.password, SALT_LENGTH)
		}
		await user.save()
		const token = jwt.sign(
			{username: user.username, _id: user._id},
			process.env.JWT_SECRET
		)
		return res.status(200).json({user, token})
	} catch (error) {
		res.status(500).json({error})
	}
})

module.exports = router
