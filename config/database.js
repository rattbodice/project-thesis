const { Sequelize } = require('sequelize');
require('dote nv').config(); // โหลดข้อมูลจากไฟล์ .env

console.log(process.env.DB_NAME)
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
    }
  );
sequelize.authenticate()
  .then(() => {
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
  })
  .catch(err => {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err);
  });

module.exports = sequelize;