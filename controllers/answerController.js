const Answer = require('../models/Answer');
const Question = require('../models/Question'); // นำเข้าโมเดล Question
const User = require('../models/User'); // นำเข้าโมเดล User

// ฟังก์ชันสำหรับสร้างคำตอบใหม่
exports.createAnswer = async (req, res) => {
    try {
        const { selected_option, question_id, user_id } = req.body; // รับข้อมูลจาก client
        console.log(`select ${selected_option} , question ${question_id} , user ${user_id}`)
        // ตรวจสอบว่าฟิลด์ที่จำเป็นมีอยู่หรือไม่
        if (!selected_option || !question_id || !user_id) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // ตรวจสอบคำถามที่เกี่ยวข้อง
        const question = await Question.findByPk(question_id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        // ตรวจสอบผู้ใช้ที่เกี่ยวข้อง
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // ตรวจสอบคำตอบที่ถูกต้อง
        const is_correct = selected_option === question.correct_answer;

        // สร้างคำตอบใหม่
        const newAnswer = await Answer.create({
            selected_option,
            is_correct,
            question_id,
            user_id,
        });

        return res.status(201).json(newAnswer);
    } catch (error) {
        console.error('Error creating answer:', error);
        return res.status(500).json({ error: 'An error occurred while creating the answer.' });
    }
};

// ฟังก์ชันสำหรับดึงคำตอบตาม user_id และ question_id
exports.getAnswerByUserAndQuestion = async (req, res) => {
    try {
        const { user_id, question_id } = req.query; // รับข้อมูลจากพารามิเตอร์

        // ดึงคำตอบที่ตรงกับ user_id และ question_id
        const answer = await Answer.findOne({
            where: {
                user_id,
                question_id,
            },
        });

        // ตรวจสอบว่าพบคำตอบหรือไม่
        if (!answer) {
            return res.status(404).json({ message: 'No answer found for this user and question.' });
        }

        // ส่งคำตอบกลับไปยัง client
        return res.status(200).json(answer);
    } catch (error) {
        console.error('Error fetching answer:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the answer.' });
    }
};
