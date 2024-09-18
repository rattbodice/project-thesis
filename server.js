const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');

// นำเข้าโมเดลทั้งหมดที่สร้างขึ้นมา
const User = require('./models/User');
const Course = require('./models/Course');
const TopicCourse = require('./models/TopicCourse');
const SubTopicCourse = require('./models/SubTopicCourse');
const Video = require('./models/Video');
const Question = require('./models/Question');
const Document = require('./models/Document');
const DocumentTopic = require('./models/DocumentTopic');
const DocumentSubtopic = require('./models/DocumentSubtopic');
const DocumentContent = require('./models/DocumentContent');
const TypeOrderContent = require('./models/TypeOrderContent');
const ImageContent = require('./models/ImageContent');
const VideoContent = require('./models/VideoContent');
const TextContent = require('./models/TextContent');

// ========================
// Middleware settings
// ========================

// ใช้ body-parser เพื่อแยกข้อมูล request body เป็น JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// ตั้งค่า CORS ให้อนุญาตการเชื่อมต่อจากต่างโดเมน (เช่น จาก frontend)
app.use(cors({
  origin: 'http://localhost:3000', // เจาะจงโดเมนต้นทางที่อนุญาต
  credentials: true,               // อนุญาตการส่ง cookies และข้อมูล session
}));

// ใช้ morgan สำหรับ logging (optional)
app.use(morgan('dev'));

// ตั้งค่าการจัดการ Static Files (ถ้ามี)
app.use(express.static('public'));

// ========================
// Route
// ========================
const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')

app.use('/api/users', userRoutes);
app.use('/api/course', courseRoutes);

const { verifyToken } = require('./middleware/auth');
app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'You have access to this protected route',
    user: req.user // ข้อมูลผู้ใช้จาก JWT token
  });
});
// app.use('/api/courses', courseRoutes);
// app.use('/api/videos', videoRoutes);

// ========================
// การเริ่มต้นเซิร์ฟเวอร์
// ========================

const PORT = process.env.PORT || 8001;

// Sync กับฐานข้อมูลและรันเซิร์ฟเวอร์
sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('ไม่สามารถ sync กับฐานข้อมูลได้:', err);
  });
