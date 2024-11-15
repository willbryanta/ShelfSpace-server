const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
	try {
		// ideally, we should also verify if the token is of type 'Bearer'
		const token = req.headers.authorization.split(' ')[1]

		if (!token) {
			// the Authorization header will accept: "Bearer <JWT>"
			// In this case, if token is falsy, it doesn't necessarily mean the user hasn't signed in. It implies the incoming request did not appropriately populate the "Authorization Header"
			// Even though this API is built for ShelfSpace-client, but when building API's, consider it as a standalone product. 
			// What would be a suitable error to feedback to the user if token is falsy?			
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
