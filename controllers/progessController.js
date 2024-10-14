const UserVideoProgress = require('../models/UserVideoProgress');
const Course = require("../models/Course");
const TopicCourse = require('../models/TopicCourse');
const SubTopicCourse = require('../models/SubTopicCourse');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

exports.createUserVideoProgress = async (req, res) => {
  try {
    const { user_id, subtopic_id, last_watched_time, is_finished } = req.body;

    // ตรวจสอบว่ามีข้อมูลสำคัญครบถ้วนหรือไม่
    if (!user_id || !subtopic_id || last_watched_time === undefined || is_finished === undefined) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // ตรวจสอบว่าผู้ใช้นี้มีอยู่ในระบบหรือไม่
    const userExists = await User.findOne({ where: { id: user_id } });
    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    // ตรวจสอบว่า last_watched_time เป็นจำนวนบวก
    if (last_watched_time < 0) {
      return res.status(400).json({ error: 'Last watched time must be a positive number.' });
    }

    // ค้นหา UserVideoProgress ที่มีอยู่แล้วในระบบ
    const existingProgress = await UserVideoProgress.findOne({
      where: {
        user_id,
        subtopic_id,
      },
    });

    if (existingProgress) {
      // ถ้าพบข้อมูลแล้ว ทำการอัปเดตข้อมูล
      existingProgress.last_watched_time = last_watched_time;
      existingProgress.is_finished = is_finished;

      await existingProgress.save(); // บันทึกการเปลี่ยนแปลง

      return res.status(200).json({ success: true, data: existingProgress });
    } else {
      // ถ้าไม่พบข้อมูล ให้สร้างใหม่
      const userVideoProgress = await UserVideoProgress.create({
        user_id,
        subtopic_id,
        last_watched_time,
        is_finished,
      });

      return res.status(201).json({ success: true, data: userVideoProgress });
    }
  } catch (error) {
    console.error('Error in createUserVideoProgress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getUserVideoProgress = async (req, res) => {
    try {
      const { user_id, subtopic_id } = req.params; // รับ user_id และ subtopic_id จาก URL parameters
  
      // ค้นหาความก้าวหน้าของวิดีโอสำหรับผู้ใช้
      const progress = await UserVideoProgress.findOne({
        where: {
          user_id,
          subtopic_id,
        },
      });
  
      if (progress) {
        return res.status(200).json({ success: true, data: progress });
      } else {
        return res.status(404).json({ success: false, message: 'Progress not found' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  exports.getTopicsWithUserProgress = async (req, res) => {
    const { courseId } = req.params; // รับ courseId จากพารามิเตอร์

    try {
        // ดึงข้อมูลคอร์สพร้อมชื่อคอร์ส
        const course = await Course.findByPk(courseId, {
            attributes: ['title'], // ดึงเฉพาะชื่อคอร์ส
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // ดึงหัวข้อทั้งหมดที่ตรงกับ courseId พร้อมกับข้อมูล SubTopic, UserVideoProgress, Question และ Answer
        const topics = await TopicCourse.findAll({
            where: {
                course_id: courseId,
            },
            include: [
                {
                    model: SubTopicCourse,
                    as: 'subTopics',
                    include: [
                        {
                            model: UserVideoProgress, 
                            as: 'userVideoProgress', // เปลี่ยนให้ตรงกับ alias ที่กำหนดในโมเดล
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
                                },
                            ],
                            required: false,
                        }
                    ],
                },
            ],
        });

        if (!topics || topics.length === 0) {
            return res.status(404).json({ message: 'No topics found for this course' });
        }

        res.status(200).json({ success: true, data: { courseName: course, topics }});
    } catch (error) {
        console.log('Error retrieving topics:', error);
        res.status(500).json({ message: 'Failed to retrieve topics', error: error.message });
    }
};



  
