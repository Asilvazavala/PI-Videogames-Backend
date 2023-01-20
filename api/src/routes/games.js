const { Router } = require('express');
const axios = require('axios');
const { Videogames, Genres } = require('../db');
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
  
router.get('/', async (req, res) => {
    const searchName = req.query.name;
    const gamesTotal = await getAllGames();
  
      if (searchName) {
        let gameName = await gamesTotal.filter(
          game => game.name.toLowerCase().includes(searchName.toLowerCase()));
        gameName.length > 0 ? 
        res.send(gameName) : 
        res.status(404).send('No existe el juego :( Intenta con otro');
      } else {
          res.send(gamesTotal);
        } 
});
  
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const gamesTotal = await getAllGames();
  
    if(id) {
      let gameId = await gamesTotal.filter(game => game.id == id);
      gameId.length > 0 ?
      res.send(gameId) :
      res.status(404).end();
    }
});
    
router.post('/', async (req, res) => {
      let {
        name,
        image,
        description,
        releaseDate,
        rating,
        platforms,
        genres,
        createdInDB
      } = req.body;
    
      let createGame = await Videogames.create ({
        name,
        image,
        description,
        releaseDate,
        rating,
        platforms,
        createdInDB
      })
    
      let createGenre = await Genres.findAll({ where: { name: genres } })
      createGame.addGenres(createGenre)
    
      res.send('Juego creado con éxito');
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const gamesTotal = await getAllGames();
  let index = await gamesTotal.findIndex(game => game.id == id);
  
  if(index >= 0) {
    gamesTotal.splice(index, 1);
    res.send('Game deleted succesfully!!');
  }
  res.status(404).end();

  if(id) {
    await Videogames.destroy({
      where : {id : id}
    })
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const gamesTotal = await getAllGames();

  let {
    name,
    image,
    description,
    releaseDate,
    rating,
    platforms,
    genres,
    createdInDB
  } = req.body;

  let updateGame = await Videogames.update ({
    name : name,
    image: image,
    description : description,
    releaseDate : releaseDate,
    rating : rating,
    platforms : platforms,
    createdInDB : createdInDB
  },
  {
    where : {id : id}
  }); 

  let genreDb = await Genres.findAll({ where: { name: genres } })
  // updateGame.addGenres(genreDb)


  if(id) {
    let indice = await gamesTotal.findIndex(game => game.id == id);
    if(indice >= 0) {
      gamesTotal[indice] = updateGame;
      res.send('Game modified succesfully!!');
    }
    res.status(404).end();
  }
});

module.exports = router;


