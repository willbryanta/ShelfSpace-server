const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
	try {
		const token = req.headers.authorization.split(' ')[1]

		if (!token) {
			return res
				.status(401)
				.json({error: ' You need to sign in to access that information!'})
		}
		//* If the user is not signed in then no token will be generated so this can act like a sign in check

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded

		next()
	} catch (error) {
		res.status(401).json({error: 'Invalid authorization token!'})
	}
}

module.exports = verifyToken
