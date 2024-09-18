const multer = require('multer');
const path = require('path');

// คลาสหลักที่ใช้จัดการการอัปโหลดไฟล์
class FileUploader {
  constructor(destinationPath) {
    this.destinationPath = destinationPath;
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.destinationPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }

  getUploader(fileFilter) {
    return multer({
      storage: this.storage,
      limits: { fileSize: 1024 * 1024 * 50 },
      fileFilter: fileFilter,
    });
  }

  static imageFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ภาพเท่านั้น!'));
    }
  }

  static videoFilter(req, file, cb) {
    const allowedTypes = /mp4|avi|mkv/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์วิดีโอเท่านั้น!'));
    }
  }
}

class ImageUploader extends FileUploader {
  constructor() {
    super('uploads/images'); // เก็บไฟล์ในโฟลเดอร์ uploads/images
  }
}

class VideoUploader extends FileUploader {
  constructor() {
    super('uploads/videos'); // เก็บไฟล์ในโฟลเดอร์ uploads/videos
  }
}

// ส่งออกคลาสที่เราต้องการใช้
module.exports = {
  ImageUploader,
  VideoUploader,
  FileUploader,
};
