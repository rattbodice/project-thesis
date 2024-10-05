const Course = require("../models/Course");
const User = require("../models/User");
const Video = require('../models/Video');
const ImageContent = require("../models/ImageContent");
const TopicCourse = require("../models/TopicCourse");
const SubTopicCourse = require("../models/SubTopicCourse");
const path = require("path");
const fs = require("fs");
const multer = require('multer');
const { VideoUploader,FileUploader } = require('../config/multer'); // นำเข้า VideoUploader
const videoUploader = new VideoUploader().getUploader(FileUploader.videoFilter); // เรียกใช้ VideoUploader

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

    // ขั้นตอนการอัปโหลดรูปภาพก่อนสร้างคอร์ส
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

    // สร้างคอร์สใหม่ในฐานข้อมูล
    const newCourse = await Course.create({
      title,
      description,
      image_id: image ? image.id : null, // ถ้ามีรูปภาพให้ใส่ image_id ถ้าไม่มีก็ null
      level: level,
      created_by: user.id,
    });

    // ส่งข้อมูลคอร์สที่ถูกสร้างกลับไปให้ client
    return res.status(201).json(newCourse);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างคอร์ส:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างคอร์ส" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.query.courseId;
    const result = await Course.destroy({
      where: {
        id: courseId, // Match the course ID
      },
    });

    if (result === 0) {
      // No records found to delete
      return res
        .status(404)
        .json({ message: "Course not found or already deleted" });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting course", error: error.message });
  }
};

exports.getCourseById = async (req,res) => {
  try {
    const courseId = req.query.courseId;
    const course = await Course.findByPk(courseId)

    if (!course) {
      return res.status(404).json({ message: "ไม่พบคอร์สดังกล่าว" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.log(error);
    
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส" });
  }
}

exports.getAllCourses = async (req, res) => {
  try {
    // ค้นหาคอร์สทั้งหมดในฐานข้อมูล
    const courses = await Course.findAll({
      include: [
        {
          model: ImageContent, // รวมข้อมูลรูปภาพที่เกี่ยวข้อง
          as: "image", // ควรระบุ alias ที่ถูกต้องตามการกำหนดในโมเดล
        },
      ],
    });

    // ส่งข้อมูลคอร์สทั้งหมดกลับไปยัง client
    return res.status(200).json(courses);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคอร์สทั้งหมด:", error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์สทั้งหมด" });
  }
};

exports.createTopicCourse = async (req, res) => {
  console.log(req.body);
  const { title, description, course_id, level, no } = req.body;
  try {
    // Fetch the course to check if it exists
    const course = await Course.findByPk(course_id);

    if (!course) {
      return res.status(404).json({ message: "ไม่พบคอร์สดังกล่าว" });
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
      .json({ message: "เกิดข้อผิดพลาดในการสร้างหัวข้อในคอร์ส" });
  }
};

exports.getAllTopicCourse = async (req, res) => {
  try {
    const courseId = req.query.courseId; // Get the courseId from query parameters
    const topicCourse = await TopicCourse.findAll({
      where: {
        course_id: courseId,
      },
      include: [
        {
          model: SubTopicCourse, // เชื่อมโยงกับโมเดล SubTopicCourse
          as: 'subTopics',       // ชื่อที่ตั้งไว้ใน association
          include: [
            {
              model: Video,      // เชื่อมโยงกับโมเดล Video
              as: 'video',       // ชื่อที่ตั้งไว้ใน association ของ Video
            },
          ],
        },
      ],
    });

    return res.status(200).json(topicCourse); // Return topics as a JSON response
  } catch (error) {
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหัวข้อ" });
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
