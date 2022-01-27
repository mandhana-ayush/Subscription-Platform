const express = require('express');

const homeController = require('../controllers/home');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');

const subscribed = require('../middlewares/subscribed');

router.get('/', homeController.getHomePage);

router.get('/trainings', homeController.getTrainings);

router.post('/checkout', isAuth, homeController.checkout);

router.get('/success', homeController.success);

router.get('/mysubspage', homeController.subspage);

router.get('/failure', homeController.failure);
module.exports = router;