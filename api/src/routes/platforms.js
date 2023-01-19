const { Router } = require('express');

const router = Router();

router.get('/', async (req, res) => {
  /*   const apiUrl = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`);
    const filter = await apiUrl.data.results.map(game => game.platforms);
    const platforms = await filter.filter(e => filter.indexOf(e.name) === filter.lastIndexOf(e.name));
   */
  
    const platforms = ['Android', 'iOS', 'Linux', 'macOS', 'Nintendo Switch', 'PC', 'PlayStation 5', 
    'PlayStation 4', 'PlayStation 3', 'PS Vita', 'Xbox Series S/X', 'Xbox One', 'Xbox 360', 'Xbox', 'Web'];
  
    platforms.length > 0 ?
    res.send(platforms) :
    res.status(404).end();
});

module.exports = router;