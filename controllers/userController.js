const User = require('../models/User');
const bcrypt = require('bcrypt'); // ใช้สำหรับการแฮชรหัสผ่าน
const jwt = require('jsonwebtoken'); // ใช้สำหรับการสร้าง JWT (JSON Web Token)

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ตรวจสอบอีเมล
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ตรวจสอบรหัสผ่าน (เปลี่ยนตรงนี้หากใช้ bcrypt)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    // ส่ง JWT Token กลับไปใน response body
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.logout = (req, res) => {
    res.clearCookie('token'); // ลบ Cookie ที่เก็บ JWT Token
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ตรวจสอบว่ามีอีเมลซ้ำในฐานข้อมูลหรือไม่
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // สร้างผู้ใช้ใหม่ (ไม่แนะนำให้เก็บรหัสผ่านเป็น plain text)
    const user = await User.create({
      username,
      email,
      password, // รหัสผ่านเก็บใน plain text (ไม่ปลอดภัย)
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



  exports.verifyToken = (req, res) => {
    console.log('print')
    // ตรวจสอบว่ามี Cookie ชื่อ 'token' หรือไม่
    const token = req.cookies.token;
  
    // ถ้าไม่มี Token ใน Cookie
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      // ตรวจสอบความถูกต้องของ Token
      const verified = jwt.verify(token, 'your_jwt_secret'); // ใช้ secret key เดียวกับตอนที่สร้าง Token
      res.status(200).json({ message: 'Token is valid', user: verified });
    } catch (err) {
      res.status(400).json({ message: 'Invalid token' });
    }
  };