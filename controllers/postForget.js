const path = require('path')
const Users = require('../models/Users')
const generateToken = require('../utils/generateToken')
const sendMail = require('../utils/sendMail')

module.exports = async (req, res) => {
  const user = await Users.findOne({ email: req.body.email })
  if (!user) {
    req.flash('error', 'ไม่พบที่อยู่อีเมลที่คุณเรียกขอ')
    return res.redirect('/forget')
  }
  const resetToken = generateToken()
  user.token.reset = resetToken
  await user.save()
  sendMail({
    email: user.email,
    subject: 'แก้ไขรหัสผ่านใหม่',
    pug: {
      file: path.join(__dirname, '../views/mails/reset.pug'),
      options: {
        tokenUrl: `${process.env.BASE_URL}/reset/${resetToken}`
      }
    }
  })
  req.flash('success', `เราได้จัดส่งลิงก์สำหรับการรับรหัสผ่านใหม่ไปยังอีเมล ${user.email}`)
  return res.redirect('/login')
}
