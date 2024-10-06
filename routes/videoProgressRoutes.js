const express = require('express');
const router = express.Router();
const {createUserVideoProgress,getUserVideoProgress} = require('../controllers/progessController')

router.post('/user-video-progress', createUserVideoProgress);
router.get('/get-video-progress/:user_id/:subtopic_id', getUserVideoProgress);

module.exports = router;