const { Router } = require('express');
const axios = require('axios');
const { Genres } = require('../db');
const { API_KEY } = process.env;

const router = Router();

const getApiInfo = async () => {
    const fisrtPage = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`);
       const games = [];
       games.push(...fisrtPage.data.results);
  
    for(let i = 2; i < 6; i++) {
      let apiUrl = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=${i}`)
      games.push(...apiUrl.data.results);
    }
      const apiInfo = await games.map(async (el) => {
        const data = await axios.get(`https://api.rawg.io/api/games/${el.id}?key=${API_KEY}`,
      );
      return {
        id: data.data.id,
        name: data.data.name,
        image: data.data.background_image,
        description: data.data.ratings.map(el => el.title),
        releaseDate: data.data.released,
        rating: data.data.rating,
        platforms: data.data.platforms.map(el => el.platform.name),
        genres: data.data.genres.map(el => el.name),
      };
    });
      const finalData = await Promise.all(apiInfo).then((data) => data);
      return finalData
      /* const apiUrl = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`);
      const apiInfo = await apiUrl.data.results.map(el => {
        return {
          id: el.id,
          name: el.name,
          image: el.background_image,
          description: el.ratings.map(el => el.title),
          releaseDate: el.released,
          rating: el.rating,
          platforms: el.platforms.map(el => el.platform.name),
          genres: el.genres.map(el => el.name),
        }
      })
      return apiInfo; */
};
  
const getDbInfo = async () => {
    return await Videogames.findAll({
      include: {
        model: Genres,
        attributes: ['name'],
      through: {
        attributes: [],
        },
      }
    })
};
  
const getAllGames = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const infoTotal = apiInfo.concat(dbInfo);
    return infoTotal;
};

router.get('/', async (req,res) => {
  const genreVideo = await axios.get(`https://api.rawg.io/api/genres?key=${API_KEY}`)
  const apiGenre = await genreVideo.data.results.map(el => el.name);
  apiGenre.map(el => Genres.findOrCreate({
     where: {name: el}
  }))

     const allGenres = await Genres.findAll();
     res.send(allGenres);
});

router.get('/:genres', async (req, res) => {
  const genres = req.params.genres;
  const gamesTotal = await getAllGames();  

  if(genres) {
    const gamesByGenre = await gamesTotal.filter(game => {
      if(game.genres) {
        const infoGenre = game.genres;
         return infoGenre.includes(genres); 
      }
    })
    gamesByGenre.length > 0 ?
      res.send(gamesByGenre) : 
      res.status(404).end();
  }
});


module.exports = router;