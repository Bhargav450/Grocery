const express = require('express');
const adminController = require('../controllers/adminController');
//const authMiddleware = require('../middleware/auth.middleware');
const {verifyToken,isAdmin, hasRole}=require('../middleware/auth');
const router = express.Router();

router.post('/add', verifyToken,isAdmin,adminController.addGrocery);
router.get('/', verifyToken,isAdmin,adminController.viewGroceries);
router.patch('/update/:id', verifyToken,isAdmin,adminController.updateGrocery);
router.delete('/delete/:id',verifyToken,isAdmin, adminController.deleteGrocery);

module.exports = router;
