const Course = require("../models/Course");
const User = require("../models/User");
const Video = require('../models/Video');
const ImageContent = require("../models/ImageContent");
const TopicCourse = require("../models/TopicCourse");
const SubTopicCourse = require("../models/SubTopicCourse");
const Answer = require("../models/Answer"); // นำเข้าคำตอบ
const Question = require("../models/Question"); // นำเข้าคำถาม
const UserVideoProgress = require("../models/UserVideoProgress");
const UserTopicCourse = require('../models/UserTopicProgress');
const UserTopicProgress = require('../models/UserTopicProgress');
const UserSubTopicCourse = require('../models/UserSubTopicCourse');

const { checkAndUpdateUserTopicProgress, checkAndUpdateUserSubTopicProgress } = require('./userController');

const path = require("path");
const fs = require("fs");
const fsv = require("fs").promises
const multer = require('multer');
const { VideoUploader,FileUploader } = require('../config/multer'); // นำเข้า VideoUploader
const videoUploader = new VideoUploader().getUploader(FileUploader.videoFilter); // เรียกใช้ VideoUploader
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');


// ตรวจสอบว่ามีโฟลเดอร์ 'uploads/images' หรือไม่ ถ้าไม่มีก็สร้างโฟลเดอร์นี้
const ensureUploadFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, level, created_by } = req.body;
    const file = req.file; // รูปภาพที่ถูกอัปโหลดจาก form
    console.log(`Created by user ID: ${created_by}`);

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงในระบบหรือไม่
    const user = await User.findByPk(created_by);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "ผู้ใช้ไม่พบ" });
    }

    // ขั้นตอนการอัปโหลดรูปภาพก่อนสร้างบทเรียน
    let image = null;
    if (file) {
      // เส้นทางของโฟลเดอร์ที่ต้องการเก็บรูปภาพ
      const uploadFolder = path.join(__dirname, "..", "uploads", "images");

      // ตรวจสอบและสร้างโฟลเดอร์ถ้าไม่มีก่อนบันทึกไฟล์
      ensureUploadFolderExists(uploadFolder);

      // เส้นทางของไฟล์ที่บันทึกโดย multer
      const imagePath = path.join(uploadFolder, file.filename);

      // ไม่ต้องเขียน buffer เพราะ multer already saved the file

      // สร้างข้อมูล ImageContent ในฐานข้อมูล
      image = await ImageContent.create({
        image_name: file.filename,
        image_url: `/uploads/images/${file.filename}`, // เก็บ URL เพื่อให้ใช้ในฟรอนต์เอนด์ง่ายขึ้น
      });
    } else {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์รูปภาพ" });
    }

    console.log("Creating new course...");

    // สร้างบทเรียนใหม่ในฐานข้อมูล
    const newCourse = await Course.create({
      title,
      description,
      image_id: image ? image.id : null, // ถ้ามีรูปภาพให้ใส่ image_id ถ้าไม่มีก็ null
      level: level,
      created_by: user.id,
    });

    // ส่งข้อมูลบทเรียนที่ถูกสร้างกลับไปให้ client
    return res.status(201).json(newCourse);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างบทเรียน:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างบทเรียน" });
  }
};
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, level } = req.body;
    const file = req.file; // รูปภาพใหม่ที่อัปโหลดจาก form

    // ตรวจสอบว่าบทเรียนที่ต้องการแก้ไขมีอยู่จริงหรือไม่
    const course = await Course.findByPk(courseId);
    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ message: "ไม่พบบทเรียน" });
    }


    // อัปเดตรูปภาพหากมีการอัปโหลดใหม่
    let image = null;
    if (file) {
      // เส้นทางของโฟลเดอร์ที่ต้องการเก็บรูปภาพ
      const uploadFolder = path.join(__dirname, "..", "uploads", "images");

      // ตรวจสอบและสร้างโฟลเดอร์ถ้าไม่มีก่อนบันทึกไฟล์
      ensureUploadFolderExists(uploadFolder);

      // เส้นทางของไฟล์ที่บันทึกโดย multer
      const imagePath = path.join(uploadFolder, file.filename);

      // สร้างข้อมูล ImageContent ใหม่ในฐานข้อมูล
      image = await ImageContent.create({
        image_name: file.filename,
        image_url: `/uploads/images/${file.filename}`, // เก็บ URL เพื่อใช้ในฟรอนต์เอนด์
      });

      // อัปเดตรูปภาพของบทเรียน
      course.image_id = image.id;
    }

    // อัปเดตข้อมูลบทเรียนในฐานข้อมูล
    course.title = title || course.title;
    course.description = description || course.description;
    course.level = level || course.level;

    // บันทึกการเปลี่ยนแปลง
    await course.save();

    console.log("Course updated successfully");

    // ส่งข้อมูลบทเรียนที่ถูกแก้ไขกลับไปให้ client
    return res.status(200).json(course);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขบทเรียน:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขบทเรียน" });
  }
};

exports.deleteCourse = async (req, res) => {
  const sequelize = require('../config/database');
  const courseId = req.query.courseId;
  console.log(courseId);
  
  const t = await sequelize.transaction();

  try {
    const course = await Course.findByPk(courseId, { transaction: t });
    if (!course) {
      throw new Error('ไม่พบบทเรียนที่ต้องการลบ');
    }

    const topics = await TopicCourse.findAll({ where: { course_id: courseId }, transaction: t });

    for (const topic of topics) {
      const subtopics = await SubTopicCourse.findAll({ where: { topic_course_id: topic.id }, transaction: t });

      for (const subtopic of subtopics) {
        // ลบคำถามทั้งหมดใน SubTopic นี้ก่อน
    const questions = await Question.findAll({ where: { subTopic_id: subtopic.id }, transaction: t });

    for (const question of questions) {
      // ลบคำตอบทั้งหมดที่เชื่อมโยงกับคำถามนี้ก่อน
      await Answer.destroy({
        where: { question_id: question.id },
        transaction: t
      });

      // ลบคำถาม
      await question.destroy({ transaction: t });
    }
    
        // ลบข้อมูลที่เกี่ยวข้องในตาราง UserVideoProgress ก่อน
        await UserVideoProgress.destroy({
          where: { subtopic_id: subtopic.id },
          transaction: t
        });
    
        // ลบแถวใน subtopiccourses ก่อนที่จะลบวิดีโอ
        await subtopic.destroy({ transaction: t });
    
        const video = await Video.findByPk(subtopic.video_id, { transaction: t });
    
        if (video) {
          const videoPath = path.join(__dirname, "../", video.file_path);
          await fsv.unlink(videoPath); // ลบไฟล์วิดีโอ
          console.log('ลบไฟล์วิดีโอสำเร็จ');
          await video.destroy({ transaction: t });
        }
    }

      await topic.destroy({ transaction: t });
    }

    await course.destroy({ transaction: t });
    await t.commit();

    console.log('ลบบทเรียนสำเร็จ');
    res.status(200).json({ message: 'ลบบทเรียนสำเร็จ' });
  } catch (error) {
    await t.rollback();
    console.error('เกิดข้อผิดพลาดในการลบบทเรียน:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบบทเรียน', error: error.message });
  }

};



exports.getCourseById = async (req,res) => {
  try {
    const courseId = req.query.courseId;
    const course = await Course.findByPk(courseId)

    if (!course) {
      return res.status(404).json({ message: "ไม่พบบทเรียนดังกล่าว" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.log(error);
    
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลบทเรียน" });
  }
}

exports.getAllCourses = async (req, res) => {
  try {
    // ค้นหาบทเรียนทั้งหมดในฐานข้อมูล
    const courses = await Course.findAll({
      include: [
        {
          model: ImageContent, // รวมข้อมูลรูปภาพที่เกี่ยวข้อง
          as: "image", // ควรระบุ alias ที่ถูกต้องตามการกำหนดในโมเดล
        },
      ],
    });

    // ส่งข้อมูลบทเรียนทั้งหมดกลับไปยัง client
    return res.status(200).json(courses);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลบทเรียนทั้งหมด:", error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลบทเรียนทั้งหมด" });
  }
};

exports.createTopicCourse = async (req, res) => {
  console.log(req.body);
  const { title, description, course_id, level, no } = req.body;
  try {
    // Fetch the course to check if it exists
    const course = await Course.findByPk(course_id);

    if (!course) {
      return res.status(404).json({ message: "ไม่พบบทเรียนดังกล่าว" });
    }

    // Create a new topic for the course
    const newTopicCourse = await TopicCourse.create({
      title,
      description,
      course_id, // Use course_id here instead of the course object itself
      level,
      no,
    });

    return res.status(201).json(newTopicCourse);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการสร้างหัวข้อในบทเรียน" });
  }
};

exports.editTopicCourse = async (req, res) => {
  const { id } = req.params; // ID ของหัวข้อที่ต้องการแก้ไขจะถูกส่งผ่าน params
  const { title, description, level } = req.body;

  try {
    // ตรวจสอบว่าหัวข้อที่ต้องการแก้ไขมีอยู่ในระบบหรือไม่
    const topicCourse = await TopicCourse.findByPk(id);

    if (!topicCourse) {
      return res.status(404).json({ message: "ไม่พบหัวข้อที่ต้องการแก้ไข" });
    }

    // ทำการอัปเดตข้อมูลหัวข้อ
    topicCourse.title = title || topicCourse.title;
    topicCourse.description = description || topicCourse.description;
    topicCourse.level = level || topicCourse.level;

    // บันทึกการเปลี่ยนแปลงลงฐานข้อมูล
    await topicCourse.save();

    return res.status(200).json({ message: "แก้ไขหัวข้อสำเร็จ", topicCourse });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการแก้ไขหัวข้อ" });
  }
};

exports.deleteTopicCourse = async (req, res) => {
  const { topicCourseId } = req.params; // ดึง topicCourseId จาก request parameters

  try {
    // ตรวจสอบว่ามีหัวข้อที่ต้องการลบอยู่ในระบบหรือไม่
    const topicCourse = await TopicCourse.findByPk(topicCourseId);

    if (!topicCourse) {
      return res.status(404).json({ message: "ไม่พบหัวข้อบทเรียนดังกล่าว" });
    }

    // ลบหัวข้อบทเรียน
    await topicCourse.destroy();

    return res.status(200).json({ message: "ลบหัวข้อบทเรียนสำเร็จ" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบหัวข้อบทเรียน" });
  }
};


exports.getAllTopicCourse = async (req, res) => {
  try {
    const userId = req.query.userId; // Get the userId from query parameters
    const courseId = req.query.courseId; // Get the courseId from query parameters

    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing userId or courseId" });
    }

    // ตรวจสอบและอัพเดท progress ของ user ใน topic และ subtopic
    // นำ userId และ topic_course_id จาก TopicCourse เพื่ออัพเดท progress 
    const topicCourses = await TopicCourse.findAll({ where: { course_id: courseId } });
    
    for (const topic of topicCourses) {
      // const topicProgressResponse = await checkAndUpdateUserTopicProgress(userId,topic.id);
    
    
      const subTopics = await SubTopicCourse.findAll({ where: { topic_course_id: topic.id } });
      for (const subTopic of subTopics) {
        const subTopicProgressResponse = await checkAndUpdateUserSubTopicProgress(userId,subTopic.id);
    
      }
    }

    // ดึงข้อมูล TopicCourse ทั้งหมด
    const topicCourse = await TopicCourse.findAll({
      where: { course_id: courseId },
      order: [['no', 'ASC']],
      include: [
        {
          model: SubTopicCourse,
          as: 'subTopics',
          order: [['no', 'ASC']],
          include: [
            {
              model: Video,
              as: 'video',
            },
          ],
        },
      ],
    });

    // ดึงข้อมูล progress ของผู้ใช้ใน TopicCourse
    const userTopicProgress = await UserTopicCourse.findAll({
      where: { user_id: userId }
    });

    // ดึงข้อมูล progress ของผู้ใช้ใน SubTopicCourse
    const userSubTopicProgress = await UserSubTopicCourse.findAll({
      where: { user_id: userId }
    });

    // แปลงข้อมูล progress ให้เป็นรูปแบบที่ค้นหาง่าย
    const userTopicProgressMap = {};
    const userSubTopicProgressMap = {};

    userTopicProgress.forEach(progress => {
      userTopicProgressMap[progress.topic_course_id] = progress.progress;
    });

    userSubTopicProgress.forEach(progress => {
      userSubTopicProgressMap[progress.subtopic_id] = progress.progress;
    });

    // จัดเรียงและแทรก canuse: true/false ลงใน topicCourse และ subTopics
    const updatedTopicCourses = topicCourse.map(topic => {
      const topicProgress = userTopicProgressMap[topic.id] || 0;
      const canUseTopic = topicProgress >= topic.level;
    
      const updatedSubTopics = topic.subTopics.map(subTopic => {
        const subTopicProgress = userSubTopicProgressMap[subTopic.id] || 0;
        const canUseSubTopic = subTopicProgress >= subTopic.level;
    
        return {
          ...subTopic.get({ plain: true }),
          canuse: canUseSubTopic,
        };
      }).sort((a, b) => a.no - b.no); // เรียงตาม no ใน subTopics
    
      return {
        ...topic.get({ plain: true }),
        canuse: canUseTopic,
        subTopics: updatedSubTopics,
      };
    }).sort((a, b) => a.no - b.no); // เรียงตาม no ใน topicCourses
    
    return res.status(200).json(updatedTopicCourses);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหัวข้อ" });
  }
};



exports.orderTopic = async (req, res) => {
  const order = req.body; // รับข้อมูลการจัดเรียงหัวข้อจาก body

  try {
    await Promise.all(order.map(async ({ id, no, level }) => { // id คือ ID ของหัวข้อ, no คือลำดับที่ต้องการ
      const topic = await TopicCourse.findByPk(id);
      if (topic) {
        topic.no = no; // อัปเดตหมายเลขลำดับ
        topic.level = level; // อัปเดต level ด้วย
        await topic.save(); // บันทึกการเปลี่ยนแปลง
      }
    }));

    res.json({ message: 'อัปเดตลำดับหัวข้อสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตลำดับหัวข้อ' });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params; // รับค่า topicId จาก body ของ request

    // ตรวจสอบว่ามี topicId หรือไม่
    if (!topicId) {
      return res.status(400).json({ error: 'กรุณาระบุ topicId' });
    }

    // ตรวจสอบว่า topicCourse มีอยู่หรือไม่
    const topicCourse = await TopicCourse.findByPk(topicId);
    if (!topicCourse) {
      return res.status(404).json({ message: 'ไม่พบหัวข้อที่ต้องการลบ' });
    }

    // ดึงข้อมูล SubTopics ที่เชื่อมโยงกับ topicCourse นี้
    const subTopics = await SubTopicCourse.findAll({ where: { topic_course_id: topicId } });

    // ลบข้อมูลที่เกี่ยวข้องกับ subTopics
    for (const subTopic of subTopics) {
      // ลบความก้าวหน้าของวิดีโอที่เชื่อมโยงกับ subTopic นี้
      await UserVideoProgress.destroy({
        where: { subtopic_id: subTopic.id }
      });

      // ลบคำตอบที่เชื่อมโยงกับคำถามใน subTopic นี้
      await Answer.destroy({
        where: {
          question_id: {
            [Op.in]: Sequelize.literal(`(SELECT id FROM Questions WHERE subTopic_id = ${subTopic.id})`)
          }
        }
      });

      // ลบคำถามที่เชื่อมโยงกับ subTopic นี้
      await Question.destroy({
        where: { subTopic_id: subTopic.id }
      });

      // ลบวิดีโอที่เชื่อมโยงกับ subTopic นี้และลบไฟล์วิดีโอออกจากระบบ
      const video = await Video.findByPk(subTopic.video_id);
      if (video) {
        const videoPath = path.join(__dirname, "../", video.file_path);
        fs.unlink(videoPath, (err) => {
          if (err) console.error('เกิดข้อผิดพลาดในการลบไฟล์วิดีโอ:', err);
        });
        await video.destroy();
      }

      // ลบ SubTopic
      await subTopic.destroy();
    }

    // ลบ TopicCourse
    await topicCourse.destroy();

    return res.status(200).json({ message: 'ลบหัวข้อและข้อมูลที่เกี่ยวข้องสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบหัวข้อ:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบหัวข้อ' });
  }
};




// ฟังก์ชันสร้าง SubTopic
exports.createSubTopic = async (req, res) => {
  try {
    const { title, description, topic_course_id } = req.body;

    // ตรวจสอบว่ามีวิดีโออัปโหลดมาหรือไม่
    if (!req.file) {
      console.log("ไม่มีไฟล์");
      return res.status(400).json({ error: 'กรุณาอัปโหลดไฟล์วิดีโอ' });
    }

    // สร้างรายการวิดีโอใหม่ในฐานข้อมูล
    const newVideo = await Video.create({
      title: req.file.filename,
      file_path: req.file.path, // พาธของไฟล์วิดีโอ
      duration: 0, // คุณสามารถตั้งค่า duration ถ้ารู้ หรือคำนวณจากไฟล์ได้
    });

    // คำนวณจำนวน subtopics ใน topic_course_id ปัจจุบัน
    const existingSubTopics = await SubTopicCourse.count({
      where: { topic_course_id: topic_course_id }
    });

    // กำหนดค่า no เป็นจำนวน subtopics ปัจจุบัน + 1
    const no = existingSubTopics + 1;

    // สร้าง SubTopicCourse พร้อมกับเชื่อมโยงกับวิดีโอที่เพิ่งอัปโหลด
    const subTopicCourse = await SubTopicCourse.create({
      title,
      description,
      video_id: newVideo.id, // เชื่อมกับวิดีโอที่อัปโหลด
      topic_course_id,
      no,
    });

    res.status(201).json({ message: 'สร้าง SubTopic เรียบร้อยแล้ว', subTopicCourse });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);

    // ลบไฟล์วิดีโอที่อัปโหลดถ้าการสร้าง subtopic ล้มเหลว
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('เกิดข้อผิดพลาดในการลบไฟล์:', unlinkErr);
        } else {
          console.log('ลบไฟล์วิดีโอสำเร็จ');
        }
      });
    }

    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้าง SubTopic' });
  }
};

exports.orderSubtopic = async (req,res) => {
  const order = req.body;

  try {
    await Promise.all(order.map(async ({ id, no, level }) => { // เพิ่ม level เข้ามาใน destructuring
      const subTopic = await SubTopicCourse.findByPk(id);
      if (subTopic) {
        subTopic.no = no;
        subTopic.level = level; // อัปเดต level ด้วย
        await subTopic.save();
      }
    }));

    res.json({ message: 'อัปเดตลำดับและระดับสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตลำดับ' });
  }
}




exports.getSubTopicsByTopicCourseId = async (req, res) => {
  try {
    const { topic_course_id } = req.params; // ดึงค่า topic_course_id จาก URL

    // ดึงข้อมูล subtopics ที่ตรงกับ topic_course_id
    const subTopics = await SubTopicCourse.findAll({
      where: { topic_course_id: topic_course_id },
      include: [{
        model: Video, // เชื่อมโยงข้อมูลวิดีโอ
        attributes: ['title', 'file_path', 'duration'], // ดึงเฉพาะข้อมูลที่ต้องการจากวิดีโอ
      }],
      order: [['no', 'ASC']], // จัดเรียงตามลำดับ 'no'
    });

    if (subTopics.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ SubTopic ที่เกี่ยวข้อง' });
    }

    res.status(200).json({ message: 'ดึงข้อมูล SubTopics สำเร็จ', subTopics });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล SubTopics' });
  }
};

exports.getSubTopicById = async (req, res) => {
  try {
    const subtopic_id = req.query.subtopic_id; // ดึงค่า subtopic_id จาก URL

    // ค้นหา SubTopic โดยใช้ subtopic_id
    const subTopic = await SubTopicCourse.findByPk(subtopic_id, {
      include: [{
        model: Video, // เชื่อมโยงกับข้อมูลวิดีโอ
        attributes: ['title', 'file_path', 'duration'], // ดึงเฉพาะข้อมูลที่ต้องการจากวิดีโอ
      }],
    });

    if (!subTopic) {
      return res.status(404).json({ message: 'ไม่พบ SubTopic ดังกล่าว' });
    }

    res.status(200).json({ message: 'ดึงข้อมูล SubTopic สำเร็จ', subTopic });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล SubTopic' });
  }
};



exports.editSubTopic = async (req, res) => {
  const { subtopicId, title, description } = req.body;

  try {
      // ค้นหา SubTopic โดย ID
      const subtopic = await SubTopicCourse.findByPk(subtopicId);

      if (!subtopic) {
          return res.status(404).json({ error: 'SubTopic not found' });
      }   

      // หากมีวิดีโอใหม่ให้จัดการกับการอัพโหลด
      if (req.file) {
          // ลบวิดีโอเก่าหากมี
          if (subtopic.video_id) {
              const oldVideo = await Video.findByPk(subtopic.video_id);
              if (oldVideo) {
                  const oldVideoPath = path.join(__dirname, "../",oldVideo.file_path);
                  fs.unlink(oldVideoPath, (err) => {
                      if (err) console.error('Error deleting old video:', err);
                  });
              }
          }

          // สร้างวิดีโอใหม่ในฐานข้อมูล
          const newVideo = await Video.create({
              title: req.file.filename,
              file_path: req.file.path,
              duration: 0, // คุณสามารถตั้งค่า duration ถ้ารู้ หรือคำนวณจากไฟล์ได้
          });

          // อัปเดตข้อมูล SubTopic
          subtopic.title = title;
          subtopic.description = description;
          subtopic.video_id = newVideo.id; // กำหนด video_id ใหม่
      } else {
          // ถ้าไม่มีวิดีโอใหม่ให้แก้ไขแค่ชื่อและคำอธิบาย
          subtopic.title = title;
          subtopic.description = description;
      }

      await subtopic.save();
      return res.status(200).json({ message: 'SubTopic updated successfully', subtopic });
  } catch (error) {
      console.error('Error updating SubTopic:', error);
      return res.status(500).json({ error: 'Server error' });
  }
};



exports.deleteSubTopicAndClearQuestions = async (req, res) => {
  try {
    const { subTopic_id } = req.body; // รับ subTopic_id จาก body ของ request

    // ตรวจสอบว่ามี subTopic_id หรือไม่
    if (!subTopic_id) {
      return res.status(400).json({ error: 'subTopic_id is required.' });
    }

    // ลบ Answers ทั้งหมดที่เชื่อมโยงกับคำถามใน subTopic_id นี้
    await Answer.destroy({
      where: {
        question_id: {
          [Op.in]: Sequelize.literal(`(SELECT id FROM Questions WHERE subTopic_id = ${subTopic_id})`)
        }
      }
    });

    // ลบคำถามทั้งหมดใน subTopic_id นี้
    await Question.destroy({
      where: { subTopic_id: subTopic_id },
    });

    // ลบ UserVideoProgress ที่เชื่อมโยงกับ subTopic_id
    await UserVideoProgress.destroy({
      where: { subtopic_id: subTopic_id },
    });

    // ลบ SubTopicCourse
    const result = await SubTopicCourse.destroy({
      where: { id: subTopic_id },
    });

    if (result === 0) {
      return res.status(404).json({ message: "SubTopic not found or already deleted" });
    }

    return res.status(200).json({ message: 'SubTopic and all associated questions, answers, and video progress deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subtopic and clearing questions:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the subtopic and clearing the questions.' });
  }
};

