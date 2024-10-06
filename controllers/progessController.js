const UserVideoProgress = require('../models/UserVideoProgress');

exports.createUserVideoProgress = async (req, res) => {
  try {
    const { user_id, subtopic_id, last_watched_time, is_finished } = req.body;

    // ตรวจสอบว่าเป็นข้อมูลที่ถูกต้องหรือไม่
    if (last_watched_time < 0) {
      return res.status(400).json({ error: 'Last watched time must be a positive number.' });
    }

    // ค้นหาข้อมูล UserVideoProgress ที่มีอยู่
    const existingProgress = await UserVideoProgress.findOne({
      where: {
        user_id,
        subtopic_id,
      },
    });

    if (existingProgress) {
      // ถ้ามีข้อมูลอยู่แล้ว ให้ทำการ update
      existingProgress.last_watched_time = last_watched_time;
      existingProgress.is_finished = is_finished;

      await existingProgress.save(); // บันทึกการเปลี่ยนแปลง

      return res.status(200).json({ success: true, data: existingProgress });
    } else {
      // ถ้าไม่มีข้อมูลอยู่ ให้สร้างข้อมูลใหม่
      const userVideoProgress = await UserVideoProgress.create({
        user_id,
        subtopic_id,
        last_watched_time,
        is_finished,
      });

      return res.status(201).json({ success: true, data: userVideoProgress });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
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