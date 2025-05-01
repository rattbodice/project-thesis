const UserVideoProgress = require('@models/UserVideoProgress');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected');
  
    socket.on('update_process_video', async (data) => {
      try {
        const { user_id, subtopic_id, last_watched_time, is_finished } = data;
  
        // ค้นหาข้อมูล progress
        const existingProgress = await UserVideoProgress.findOne({
          where: {
            user_id,
            subtopic_id,
          },
        });
  
        if (existingProgress) {
          // อัปเดตข้อมูล
          existingProgress.last_watched_time = last_watched_time;
          existingProgress.is_finished = is_finished;
          await existingProgress.save();
          console.log('✅ Updated progress:', existingProgress);
          
        } else {
          // สร้างใหม่
          const newProgress = await UserVideoProgress.create({
            user_id,
            subtopic_id,
            last_watched_time,
            is_finished,
          });
  
        }
      } catch (err) {
        console.error('❌ Error:', err.message);
      }
    });
  });
};
