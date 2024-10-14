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
const Answer = require('../models/Answer');
const Question = require('../models/Question');


// ฟังก์ชันสำหรับการล็อกอิน
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
    const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

    // ส่ง JWT Token และสถานะผู้ใช้กลับไปใน response body
    res.status(200).json({ message: 'Login successful', token, role: user.role });
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


// ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'firstName', 'lastName','role'], // ระบุฟิลด์ที่ต้องการแสดง
    });

    // ส่งข้อมูลผู้ใช้ทั้งหมดกลับใน response body
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
// Add new user (Admin only)
exports.addUser = async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error });
  }
};

// Edit user (Admin only)
exports.editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, firstName, lastName, role, password } = req.body; // เพิ่ม password

  try {
    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare the update data
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      role,
    };

    // Only update password if provided
    if (password) {
      updateData.password = password; // ถ้ามีการป้อนรหัสผ่านให้เพิ่มเข้าไปในข้อมูลที่จะอัปเดต
    }

    // Update user details
    await user.update(updateData);

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error });
  }
};


exports.deleteUser = async (req, res) => {
  const { id } = req.params; // รับ ID ของผู้ใช้ที่ต้องการลบจากพารามิเตอร์

  try {
    // ค้นหาผู้ใช้ตาม ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await UserVideoProgress.destroy({ where: { user_id: id } });
    // ลบผู้ใช้ (ข้อมูลที่เกี่ยวข้องจะถูกลบอัตโนมัติถ้าใช้ CASCADE)
    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete user', error });
  }
};

exports.getUserProgressWithResults = async (req, res) => {
  const { userId } = req.params; // รับ userId จาก request

  try {
    // ค้นหาผู้ใช้พร้อมกับข้อมูลความคืบหน้าในวิดีโอของแต่ละบทเรียน
    const userProgress = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: UserVideoProgress,
          include: [
            {
              model: SubTopicCourse,
              include: [
                {
                  model: Question,
                  include: [
                    {
                      model: Answer,
                      where: { user_id: userId }, // ดึงคำตอบของผู้ใช้แต่ละคน
                      required: false, // ถ้าไม่มีคำตอบจะยังแสดงข้อมูลบทเรียนอยู่
                    },
                  ],
                  required: false, // บางบทเรียนอาจไม่มีคำถาม
                },
              ],
            },
          ],
        },
      ],
    });

    if (!userProgress) {
      return res.status(404).json({ message: 'User not found or no progress data' });
    }

    // ส่งข้อมูลผู้ใช้พร้อมความคืบหน้าและผลลัพธ์การเรียนกลับไป
    res.status(200).json(userProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve user progress', error });
  }
};

