const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/user', userController.post);
router.get('/user', userController.getUser);
router.put('/user', userController.logout);

module.exports = router;