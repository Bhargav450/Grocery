const express = require('express');
const userController = require('../controllers/userController');
const {verifyToken}=require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken,userController.viewAvailableGroceries);
router.post('/order', verifyToken,userController.placeOrder);

module.exports = router;
