const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Route สำหรับสร้างผู้ใช้ใหม่
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout',userController.logout);
router.get('/verify',userController.verifyToken)

router.get('/fetchUsers', userController.getAllUsers);
router.post('/addUser', userController.addUser); // Admin adds a user
router.put('/editUser/:id', userController.editUser); // Admin edits a user
router.delete('/deleteUser/:id', userController.deleteUser);

// router.get('/checkProgressSubtopic',userController.checkAndUpdateUserSubTopicProgress)
// router.get('/checkProgressTopic',userController.checkAndUpdateUserTopicProgress)    

module.exports = router;
