const Course = require('../models/Course');
const User = require('../models/User');
const ImageContent = require('../models/ImageContent');
const path = require('path');
const fs = require('fs');

// ตรวจสอบว่ามีโฟลเดอร์ 'uploads' หรือไม่ ถ้าไม่มีก็สร้างโฟลเดอร์นี้
const ensureUploadFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, created_by } = req.body;
    const file = req.file; // รูปภาพที่ถูกอัปโหลดจาก form

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงในระบบหรือไม่
    const user = await User.findByPk(created_by);
    if (!user) {
      return res.status(404).json({ message: 'ผู้ใช้ไม่พบ' });
    }

    // ขั้นตอนการอัปโหลดรูปภาพก่อนสร้างคอร์ส
    let image = null;
    if (file) {
      // เส้นทางของโฟลเดอร์ที่ต้องการเก็บรูปภาพ
      const uploadFolder = path.join(__dirname, '..', 'uploads');

      // ตรวจสอบและสร้างโฟลเดอร์ถ้าไม่มีก่อนบันทึกไฟล์
      ensureUploadFolderExists(uploadFolder);

      // สร้างเส้นทางของไฟล์ที่ต้องการบันทึก
      const imagePath = path.join(uploadFolder, file.filename);

      // บันทึกไฟล์ภาพลงในระบบไฟล์
      fs.writeFileSync(imagePath, file.buffer);

      // สร้างข้อมูล ImageContent ในฐานข้อมูล
      image = await ImageContent.create({
        image_name: file.filename,
        image_url: `/uploads/${file.filename}`, // เก็บ URL เพื่อให้ใช้ในฟรอนต์เอนด์ง่ายขึ้น
      });
    }

    // สร้างคอร์สใหม่ในฐานข้อมูล
    const newCourse = await Course.create({
      title,
      description,
      image_id: image ? image.id : null, // ถ้ามีรูปภาพให้ใส่ image_id ถ้าไม่มีก็ null
      created_by: user.id,
    });

    // ส่งข้อมูลคอร์สที่ถูกสร้างกลับไปให้ client
    return res.status(201).json(newCourse);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างคอร์ส:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างคอร์ส' });
  }
};
