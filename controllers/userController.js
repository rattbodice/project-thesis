const User = require('../models/User');
const bcrypt = require('bcrypt'); // ใช้สำหรับการแฮชรหัสผ่าน
const jwt = require('jsonwebtoken'); // ใช้สำหรับการสร้าง JWT (JSON Web Token)

const saltRounds = 10; // กำหนดจำนวนรอบการแฮชรหัสผ่าน

const UserTopicCourse = require('../models/UserTopicCourse');
const SubTopicCourse = require('../models/SubTopicCourse');
const TopicCourse = require('../models/TopicCourse');
const UserVideoProgress = require('../models/UserVideoProgress');
const UserTopicProgress = require('../models/UserTopicProgress');
const UserSubTopicCourse = require('../models/UserSubTopicCourse');

// ฟังก์ชันสำหรับการล็อกอิน
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ตรวจสอบอีเมล
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ตรวจสอบรหัสผ่าน (เปลี่ยนตรงนี้เป็น bcrypt เพื่อเปรียบเทียบรหัสผ่านที่ถูกแฮช)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    // ส่ง JWT Token กลับไปใน response body
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ฟังก์ชันสำหรับการล็อกเอาท์
exports.logout = (req, res) => {
  res.clearCookie('token'); // ลบ Cookie ที่เก็บ JWT Token
  res.status(200).json({ message: 'Logged out successfully' });
};

// ฟังก์ชันสำหรับการลงทะเบียน
exports.register = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    // ตรวจสอบว่ามีอีเมลซ้ำในฐานข้อมูลหรือไม่
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // แฮชรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // สร้างผู้ใช้ใหม่
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // รหัสผ่านแฮช
      firstName,  // เพิ่มฟิลด์ firstName
      lastName,   // เพิ่มฟิลด์ lastName
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ฟังก์ชันสำหรับตรวจสอบ JWT Token
exports.verifyToken = (req, res) => {
  // ตรวจสอบว่ามี Cookie ชื่อ 'token' หรือไม่
  const token = req.cookies.token;

  // ถ้าไม่มี Token ใน Cookie
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // ตรวจสอบความถูกต้องของ Token
    const verified = jwt.verify(token, 'your_jwt_secret'); // ใช้ secret key เดียวกับตอนที่สร้าง Token
    res.status(200).json({ message: 'Token is valid', user: verified });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};


// exports.checkAndUpdateUserTopicProgress = async (user_id, topic_course_id) => {
//   try {
//     console.log(`Checking progress for user: ${user_id}, topic_course_id: ${topic_course_id}`);

//     // ตรวจสอบว่ามี UserTopicProgress สำหรับผู้ใช้หรือไม่
//     let userTopicProgress = await UserTopicProgress.findOne({
//       where: {
//         user_id: user_id,
//         topic_course_id: topic_course_id,
//       },
//     });

//     // ถ้าไม่มี UserTopicProgress ให้สร้างใหม่
//     if (!userTopicProgress) {
//       console.log("UserTopicProgress not found, creating a new one");
//       userTopicProgress = await UserTopicProgress.create({
//         user_id: user_id,
//         topic_course_id: topic_course_id,
//         is_finished: false, // เริ่มต้นเป็น false
//       });
//     }

//     // ดึง subtopics ใน topic_course นี้
//     const subTopicsInTopic = await SubTopicCourse.findAll({
//       where: { topic_course_id: topic_course_id },
//     });

//     if (subTopicsInTopic.length === 0) {
//       console.log("No subtopics found, marking topic progress as finished.");
//       await userTopicProgress.update({ is_finished: true });
//       return { error: false, message: "No subtopics, marked as finished." };
//     }

//     // ตรวจสอบจำนวน SubTopics ที่ผู้ใช้เรียนจบ
//     const completedSubTopics = await UserVideoProgress.count({
//       where: {
//         user_id: user_id,
//         is_finished: true,
//         subtopic_id: {
//           [Op.in]: subTopicsInTopic.map(subTopic => subTopic.id),
//         },
//       },
//     });

//     // ถ้าผู้ใช้เรียน SubTopics ใน TopicCourse นี้ครบแล้วให้ทำเครื่องหมายว่าเสร็จสิ้น
//     if (completedSubTopics === subTopicsInTopic.length) {
//       console.log("All subtopics completed, marking topic progress as finished");
//       await userTopicProgress.update({ is_finished: true });
//     }

//     return { error: false, progress: userTopicProgress };
//   } catch (error) {
//     console.error('Error checking/updating user topic progress:', error);
//     return { error: true, message: 'Failed to check and update user topic progress' };
//   }
// };


exports.checkAndUpdateUserSubTopicProgress = async (user_id, subtopic_id) => {
  try {
    console.log(`Checking subtopic progress for user: ${user_id}, subtopic_id: ${subtopic_id}`);

    // ตรวจสอบค่า
    if (!user_id || !subtopic_id) {
      console.log("Missing user_id or subtopic_id");
      return { error: true, message: "Missing user_id or subtopic_id" };
    }

    // ตรวจสอบ progress ของผู้ใช้ใน subtopic นี้
    let userSubTopicProgress = await UserSubTopicCourse.findOne({
      where: {
        user_id: user_id,
        subtopic_id: subtopic_id,
      },
    });

    // ถ้าไม่มี ให้สร้างใหม่และตั้ง progress = 1
    if (!userSubTopicProgress) {
      console.log("Creating new user subtopic progress");
      userSubTopicProgress = await UserSubTopicCourse.create({
        user_id: user_id,
        subtopic_id: subtopic_id,
        progress: 1, // ค่าเริ่มต้น progress = 1
      });
    }

    // ดึงข้อมูลของ subtopic
    const subTopic = await SubTopicCourse.findOne({
      where: { id: subtopic_id }
    });

    if (!subTopic) {
      return { error: true, message: "SubTopic not found" };
    }

    const currentLevel = userSubTopicProgress.progress;

    console.log(`Current level for subtopic: ${currentLevel}`);

    // ตรวจสอบว่าผู้ใช้เรียน subtopics ทั้งหมดในระดับเดียวกับ progress ปัจจุบันครบแล้วหรือยัง
    const totalSubTopicsInLevel = await SubTopicCourse.count({
      where: {
        topic_course_id: subTopic.topic_course_id,
        level: currentLevel,
      },
    });

    const completedSubTopicsInLevel = await UserVideoProgress.count({
      where: {
        user_id: user_id,
        is_finished: true,
      },
      include: [
        {
          model: SubTopicCourse,
          where: {
            topic_course_id: subTopic.topic_course_id,
            level: currentLevel,
          },
        },
      ],
    });

    console.log(`Completed subtopics in level: ${completedSubTopicsInLevel} out of ${totalSubTopicsInLevel}`);

    // ถ้าผู้ใช้เรียน subtopics ในระดับปัจจุบันครบแล้วให้เพิ่ม progress
    if (completedSubTopicsInLevel === totalSubTopicsInLevel) {
      console.log("All subtopics in level completed, incrementing progress");
      await userSubTopicProgress.update({ progress: currentLevel + 1 });
    }

    return { error: false, progress: userSubTopicProgress };
  } catch (error) {
    console.error('Error checking/updating user progress:', error);
    return { error: true, message: 'Failed to check and update user progress' };
  }
};
