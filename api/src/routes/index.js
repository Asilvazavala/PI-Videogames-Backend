const { Router } = require('express');

// Importar todos los routers;
const videogamesRoutes = require('./games');
const genresRoutes = require('./genres'); 
const platformsRoutes = require('./platforms');

const router = Router();

// Configurar los routers
router.use('/videogames', videogamesRoutes);
router.use('/genres', genresRoutes);
router.use('/platforms', platformsRoutes);

module.exports = router;



