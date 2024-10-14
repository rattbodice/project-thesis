const express = require('express');
const router = express.Router();
const { createQuestion,getQuestionsBySubtopic,clearQuestions,getQuestionsWithAnswersByUser } = require('../controllers/questionController');

// สร้าง route สำหรับ POST request เพื่อสร้างคำถามใหม่
router.post('/create-questions', createQuestion);
router.get('/getQuestionsBySubTopic', getQuestionsBySubtopic);
router.delete('/clear-questions', clearQuestions);

router.get('/getQuestionsWithAnswerByUser/:subTopicId/user/:userId', getQuestionsWithAnswersByUser);
module.exports = router;