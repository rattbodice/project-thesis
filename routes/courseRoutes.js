const express = require('express');
const courseController = require('../controllers/courseController');
const router = express.Router();

const multer = require('multer');

const { ImageUploader, VideoUploader, FileUploader } = require('../config/multer'); // นำเข้า ImageUploader และ VideoUploader

// สร้าง instance ของ ImageUploader และ VideoUploader
const imageUploader = new ImageUploader().getUploader(FileUploader.imageFilter);
const videoUploader = new VideoUploader().getUploader(FileUploader.videoFilter);

router.post('/create-course', (req, res, next) => {
    imageUploader.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next(); // หากไม่มีข้อผิดพลาด ไปที่ courseController.createCourse
    });
  }, courseController.createCourse);
  router.put('/edit-course/:courseId', (req, res, next) => {
    // ใช้ imageUploader สำหรับจัดการการอัปโหลดรูปภาพ (ถ้ามี)
    imageUploader.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // จัดการกรณีเกิดข้อผิดพลาดจาก multer
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // จัดการข้อผิดพลาดทั่วไป
        return res.status(400).json({ error: err.message });
      }
      next(); // หากไม่มีข้อผิดพลาด ไปที่ courseController.editCourse
    });
  }, courseController.editCourse);

  
router.put('/edit-topic-course/:id', courseController.editTopicCourse);

router.post('/create-topic-course',courseController.createTopicCourse)

router.get('/getCourseById', courseController.getCourseById);
router.get('/getAllCourses', courseController.getAllCourses);
router.delete('/deleteCourseById' ,courseController.deleteCourse);
router.get('/getAllTopicCourse', courseController.getAllTopicCourse);
router.delete('/delete-topic-course/:topicId',courseController.deleteTopic);

router.post('/create-subtopic', (req, res, next) => {
  videoUploader.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next(); // หากไม่มีข้อผิดพลาด ไปที่ courseController.createSubTopic
  });
}, courseController.createSubTopic);
router.put('/order-subtopic', courseController.orderSubtopic)
router.put('/order-topic', courseController.orderTopic)
router.get('/get-subtopic', courseController.getSubTopicById);
router.post('/edit-subtopic', (req, res, next) => {
  videoUploader.single('video')(req, res, (err) => {
    console.log('req.body:', req.body); // ตรวจสอบข้อมูลใน req.body
    console.log('req.file:', req.file); // ตรวจสอบว่ามีไฟล์ถูกอัปโหลดเข้ามาหรือไม่
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, courseController.editSubTopic);
router.delete('/delete-subtopic', courseController.deleteSubTopicAndClearQuestions);

module.exports = router;