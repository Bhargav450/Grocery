const express = require('express');
const router = express.Router();
const {registration, login} = require('../controllers/authController');

// Login route
router.post('/login',login);
///register
router.post('/register',registration);
//manage users


module.exports = router;
