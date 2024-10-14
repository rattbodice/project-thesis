const express = require('express');
const router = express.Router();
const {createUserVideoProgress,getUserVideoProgress,getTopicsWithUserProgress} = require('../controllers/progessController')

router.post('/user-video-progress', createUserVideoProgress);
router.get('/get-video-progress/:user_id/:subtopic_id', getUserVideoProgress);

router.get('/get-progress-bycourseId/:courseId',getTopicsWithUserProgress)

module.exports = router;