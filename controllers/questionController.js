const Question = require('../models/Question');
const Answer = require('../models/Answer')
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');


// ฟังก์ชันสำหรับสร้างคำถามใหม่
exports.createQuestion = async (req, res) => {
  try {
    const { questions } = req.body; // รับข้อมูลคำถามเป็น array
    console.log(questions);

    const subTopicId = questions.length > 0 ? questions[0].subTopic_id : req.body.subTopic_id;

    // ดึงคำถามที่มีอยู่แล้วในฐานข้อมูล
    const existingQuestions = await Question.findAll({
      where: { subTopic_id: subTopicId },
    });

    // สร้าง Map เพื่อเก็บคำถามที่มีอยู่แล้วตาม ID
    const existingQuestionMap = new Map(
      existingQuestions.map((q) => [q.id, q]) // เปลี่ยนเป็นใช้ ID แทน time_in_video
    );

    const errors = [];
    const createdQuestions = [];
    const updatedQuestions = [];

    // จัดเก็บ ID ของคำถามใหม่ทั้งหมด
    const newQuestionIds = new Set(questions.map((q) => q.id)); // ใช้ ID ของคำถามใหม่

    // ตรวจสอบและลบคำถามเก่าที่ไม่มีในคำถามใหม่
    for (const oldQuestion of existingQuestions) {
      if (!newQuestionIds.has(oldQuestion.id)) { // เปลี่ยนการตรวจสอบให้ใช้ ID
        // ลบ Answers ที่เกี่ยวข้องกับ question_id นี้
        await Answer.destroy({
          where: { question_id: oldQuestion.id }
        });

        // ลบคำถามที่ไม่ได้อยู่ในรายการใหม่
        await oldQuestion.destroy();
        console.log(`Deleted question and associated answers with ID ${oldQuestion.id}`);
      }
    }

    // ตรวจสอบและอัปเดตหรือสร้างคำถามใหม่
    for (const question of questions) {
      const { id, time_in_video, question_text, options, correct_answer } = question;

      if (!time_in_video || !question_text || !options || options.length !== 2 || !correct_answer) {
        errors.push({ question_text, error: 'Missing required fields or options.' });
        continue;
      }

      // ตรวจสอบว่าคำถามนี้มีอยู่ในฐานข้อมูลแล้วหรือไม่
      const existingQuestion = existingQuestionMap.get(id); // ใช้ ID ในการตรวจสอบ

      if (existingQuestion) {
        // อัปเดตคำถามที่มีอยู่
        existingQuestion.question_text = question_text;
        existingQuestion.options = options;
        existingQuestion.correct_answer = correct_answer;
        await existingQuestion.save();
        updatedQuestions.push(existingQuestion);
        console.log(`Updated question with ID ${id}`);
      } else {
        // สร้างคำถามใหม่
        try {
          const newQuestion = await Question.create({
            time_in_video,
            question_text,
            options,
            correct_answer,
            subTopic_id: subTopicId,
          });
          createdQuestions.push(newQuestion);
        } catch (error) {
          console.error('Error creating question:', error);
          errors.push({ question_text, error: `Error creating question: ${error.message}` });
        }
      }
    }

    return res.status(200).json({
      createdQuestions,
      updatedQuestions,
      errors,
    });
  } catch (error) {
    console.error('Error creating or updating questions:', error);
    return res.status(500).json({ error: 'An error occurred while processing the questions.' });
  }
};





exports.getQuestionsBySubtopic = async (req, res) => {
  try {
      const { subTopic_id, user_id } = req.query; // รับ subTopic_id และ user_id จาก query parameters
      console.log("subtopic : " + subTopic_id + ", user: " + user_id);

      // ดึงคำถามทั้งหมดที่ตรงกับ subTopic_id
      const questions = await Question.findAll({
          where: { subTopic_id: subTopic_id }
      });

      if (questions.length === 0) {
          return res.status(404).json({ message: 'No questions found for this subtopic.' });
      }

      // กรองคำถามที่ผู้ใช้ยังไม่ได้ตอบ
      const unansweredQuestions = await Promise.all(questions.map(async (question) => {
          // ค้นหาคำตอบของผู้ใช้ที่มี user_id และ question_id
          const userAnswer = await Answer.findOne({
              where: {
                  question_id: question.id,
                  user_id: user_id,
              }
          });

          // ถ้าไม่มีคำตอบของผู้ใช้ ให้ส่งคำถามนี้กลับไป
          if (!userAnswer) {
              return question;
          }
          return null; // ถ้าเคยตอบแล้วให้ส่งค่า null
      }));

      // ลบค่าที่เป็น null ออกจาก array
      const filteredQuestions = unansweredQuestions.filter(q => q !== null);

      // ตรวจสอบว่าพบคำถามที่ยังไม่ตอบหรือไม่
      if (filteredQuestions.length === 0) {
          return res.status(200).json(filteredQuestions);
      }

      // ส่งคำถามที่ยังไม่ถูกตอบกลับไปยัง client
      return res.status(200).json(filteredQuestions);

  } catch (error) {
      console.error('Error fetching unanswered questions:', error);
      return res.status(500).json({ error: 'An error occurred while fetching the questions.' });
  }
};

// ฟังก์ชันสำหรับลบคำถามและคำตอบทั้งหมดใน subTopic_id ที่กำหนด
exports.clearQuestions = async (req, res) => {
  try {
    const { subTopic_id } = req.body; // รับ subTopic_id จาก body ของ request

    // ตรวจสอบว่ามี subTopic_id หรือไม่
    if (!subTopic_id) {
      return res.status(400).json({ error: 'subTopic_id is required.' });
    }

    // ลบ Answers ทั้งหมดที่เชื่อมโยงกับคำถามที่อยู่ใน subTopic_id นี้
    await Answer.destroy({
      where: { question_id: { [Op.in]: Sequelize.literal(`(SELECT id FROM Questions WHERE subTopic_id = ${subTopic_id})`) } }
    });

    // ลบคำถามทั้งหมดใน subTopic_id นี้
    await Question.destroy({
      where: { subTopic_id: subTopic_id },
    });

    return res.status(200).json({ message: 'All questions and associated answers deleted successfully.' });
  } catch (error) {
    console.error('Error clearing questions:', error);
    return res.status(500).json({ error: 'An error occurred while clearing the questions.' });
  }
};

