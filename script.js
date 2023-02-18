// Convert all password ใน Database ที่ไม่ถูก bcrypt ให้ทำ bcrypt แทน
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Users = require('./models/Users')

dotenv.config()
mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const users = await Users.find()
  for (const user of users) {
    if (!user.password.startsWith('$2b$10$')) {
      user.password = await bcrypt.hash(user.password, +process.env.SALT_ROUND)
      await user.save()
    }
  }
  console.log('Done!')
  process.exit(0)
})
