const express = require('express');
const router = express.Router();
const {createAnswer,getAnswerByUserAndQuestion } = require('../controllers/answerController');

router.post('/create-answers', createAnswer);
router.get('/getAnswerByQuestion', getAnswerByUserAndQuestion);

module.exports = router;
