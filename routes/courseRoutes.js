const express = require('express');
const courseController = require('../controllers/courseController');
const router = express.Router();

const { ImageUploader, VideoUploader, FileUploader } = require('../config/multer'); // นำเข้า ImageUploader และ VideoUploader

// สร้าง instance ของ ImageUploader และ VideoUploader
const imageUploader = new ImageUploader().getUploader(FileUploader.imageFilter);
const videoUploader = new VideoUploader().getUploader(FileUploader.videoFilter);

router.post('/create-course', imageUploader.single('image'),courseController.createCourse)

module.exports = router;