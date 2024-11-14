const express = require('express')
const router = express.Router()
const API_KEY = process.env.MOVIE_API_KEY

router.get('/:search', (req, res) => {
    const search = req.params.search
    const url = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&api_key=${API_KEY}&query=${search}`

    // improvement opportunity: currently, there is no response sent back if an error is thrown
    // error can potentially be thrown by "themoviedb api" e.g. the service is down etc
    fetch(url)
    .then(res => res.json())
    .then(data => res.json(data.results))
    .catch(err => console.error(err));
})

module.exports = router
