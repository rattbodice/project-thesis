const express = require('express');
const router = express.Router();
const { createQuestion,getQuestionsBySubtopic } = require('../controllers/questionController');

// สร้าง route สำหรับ POST request เพื่อสร้างคำถามใหม่
router.post('/create-questions', createQuestion);
router.get('/getQuestionsBySubTopic', getQuestionsBySubtopic);

module.exports = router;