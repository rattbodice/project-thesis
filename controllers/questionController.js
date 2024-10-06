const Question = require('../models/Question');

// ฟังก์ชันสำหรับสร้างคำถามใหม่
exports.createQuestion = async (req, res) => {
    try {
      const {questions} = req.body; // รับข้อมูลคำถามเป็น array
      console.log(questions);
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'No questions provided.' });
      }

      const subTopicId = questions[0].subTopic_id; // ดึง subTopic_id จากคำถามแรก

      // ลบคำถามเก่าที่ตรงกับ subTopic_id
      await Question.destroy({
        where: { subTopic_id: subTopicId },
      });

      const errors = [];
      const createdQuestions = [];

      for (const question of questions) {
        const { time_in_video, question_text, options, correct_answer } = question;
        if (!time_in_video || !question_text || !options || options.length !== 2 || !correct_answer) {
          errors.push({ question_text, error: 'Missing required fields or options.' });
          continue;
        }

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

      return res.status(200).json({ createdQuestions, errors });
    } catch (error) {
      console.error('Error creating questions:', error);
      return res.status(500).json({ error: 'An error occurred while creating the questions.' });
    }
};

exports.getQuestionsBySubtopic = async (req, res) => {
    try {
        const subTopicId = req.query.subTopic_id; // รับ subTopic_id จากพารามิเตอร์
        console.log("subtopic : "+subTopicId)
        // ดึงคำถามทั้งหมดที่ตรงกับ subTopic_id
        const questions = await Question.findAll({
            where: { subTopic_id: subTopicId }
        });

        // ตรวจสอบว่าพบคำถามหรือไม่
        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this subtopic.' });
        }

        // ส่งคำถามกลับไปยัง client
        return res.status(200).json(questions);

    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the questions.' });
    }
};
  
