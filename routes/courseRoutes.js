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
router.post('/create-topic-course',courseController.createTopicCourse)

router.get('/getCourseById', courseController.getCourseById);
router.get('/getAllCourses', courseController.getAllCourses);
router.get('/deleteCourseById' ,courseController.deleteCourse);
router.get('/getAllTopicCourse', courseController.getAllTopicCourse);

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
router.get('/get-subtopic', courseController.getSubTopicById);

module.exports = router;