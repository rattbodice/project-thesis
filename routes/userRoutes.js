const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Route สำหรับสร้างผู้ใช้ใหม่
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout',userController.logout);
router.get('/verify',userController.verifyToken)

module.exports = router;
