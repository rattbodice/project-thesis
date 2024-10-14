const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');

// นำเข้าโมเดลทั้งหมดที่สร้างขึ้นมา
const User = require('./models/User');
const Course = require('./models/Course');
const Video = require('./models/Video');
const TopicCourse = require('./models/TopicCourse');
const SubTopicCourse = require('./models/SubTopicCourse');
const Question = require('./models/Question');
const Document = require('./models/Document');
const DocumentTopic = require('./models/DocumentTopic');
const DocumentSubtopic = require('./models/DocumentSubtopic');
const DocumentContent = require('./models/DocumentContent');
const TypeOrderContent = require('./models/TypeOrderContent');
const ImageContent = require('./models/ImageContent');
const VideoContent = require('./models/VideoContent');
const TextContent = require('./models/TextContent');
const Answer = require('./models/Answer')
const UserSubTopicCourse = require('./models/UserSubTopicCourse')
const UserTopicCourse = require('./models/UserTopicCourse')
const UserVideoProgress = require('./models/UserVideoProgress')



TopicCourse.hasMany(SubTopicCourse, { foreignKey: 'topic_course_id', as: 'subTopics' });
SubTopicCourse.hasMany(UserVideoProgress, {
  foreignKey: 'subtopic_id', // สมมติว่าคุณมี foreign key นี้ใน UserVideoProgress
  as: 'userVideoProgress', // ใช้ alias ที่ต้องการ
});
SubTopicCourse.hasMany(Question, {foreignKey: 'subTopic_id', as: 'questions'})
Question.hasMany(Answer, {
  foreignKey: 'question_id', // สมมติว่าคุณมี foreign key นี้ใน Answer
  as: 'answers', // ใช้ alias ที่ต้องการ
});

// ========================
// Middleware settings
// ========================

// ใช้ body-parser เพื่อแยกข้อมูล request body เป็น JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
const questionRoutes = require('./routes/questionRoutes')
const progressUserVideo = require('./routes/videoProgressRoutes')
const answerRoutes = require('./routes/answerRoutes')

app.use('/api/users', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/progressVideo', progressUserVideo);
app.use('/api/answer', answerRoutes);

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
