const UserVideoProgress = require('../models/UserVideoProgress');
const Course = require("../models/Course");
const TopicCourse = require('../models/TopicCourse');
const SubTopicCourse = require('../models/SubTopicCourse');

const User = require('../models/User');

exports.createUserVideoProgress = async (req, res) => {
  try {
    const { user_id, subtopic_id, last_watched_time, is_finished } = req.body;

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!user_id || !subtopic_id || last_watched_time === undefined || is_finished === undefined) {
      res.status(400).json({ error: 'Missing required fields.' });
      return;
    }

    if (last_watched_time < 0) {
      res.status(400).json({ error: 'Last watched time must be a positive number.' });
      return;
    }

    // ตอบกลับก่อนเพื่อให้ beacon สำเร็จ
    res.status(204).end(); // No Content (ไม่มีข้อมูลตอบกลับ)

    // เช็ค user (async หลังจากตอบแล้ว)
    const userExists = await User.findOne({ where: { id: user_id } });
    if (!userExists) return;

    // อัปเดตหรือสร้าง progress
    const [progress, created] = await UserVideoProgress.findOrCreate({
      where: { user_id, subtopic_id },
      defaults: {
        last_watched_time,
        is_finished,
      },
    });

    if (!created) {
      // ถ้ามีอยู่แล้ว อัปเดต
      progress.last_watched_time = last_watched_time;
      progress.is_finished = is_finished;
      await progress.save();
    }

    console.log('✅ Progress saved (via beacon):', {
      user_id,
      subtopic_id,
      last_watched_time,
      is_finished,
    });
  } catch (error) {
    console.error('❌ Error in createUserVideoProgress (beacon):', error.message);
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



  
