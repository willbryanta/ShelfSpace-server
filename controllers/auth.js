const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const SALT_LENGTH = 12

router.post('/signup', async (req, res) => {
	try {
		const userInDatabase = await User.findOne({username: req.body.username})
		if (userInDatabase) {
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
		res.status(500).json({error: error.message})
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
		res.status(500).json({error: error.message})
	}
})

router.get(`/password/:userId`, async (req, res) => {
	try {
		const targetUser = await User.findById(req.params.userId)
		if (!targetUser) {
			return res.status(404).json({error: 'User not found.'})
		}
		return res
			.status(200)
			.json(bcrypt.compareSync(req.headers.password, targetUser.hashedPassword))
	} catch (error) {
		res.status(500).json({error: error.message})
	}
})

module.exports = router
