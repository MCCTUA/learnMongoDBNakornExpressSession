const bcrypt = require('bcrypt')
const Users = require('../models/Users')

module.exports = async (req, res) => {
  const redirectWithError = () => {
    req.flash('error', 'Email หรือ Password ไม่ถูกต้อง')
    return res.redirect('/login')
  }
  const user = await Users.findOne({
    email: req.body.email
  })
  if (!user) {
    return redirectWithError()
  }
  // Compare password ที่ส่งเข้ามากับใน Database ผ่าน bcrypt ว่าถูกต้องหรือไม่
  const result = await bcrypt.compare(req.body.password, user.password)
  if (!result) {
    return redirectWithError()
  }

  // ถ้าพบ user ให้เก็บลงใน Session ตามด้านล่างต่อไป
  req.flash('success', 'เข้าสู่ระบบสำเร็จ')
  req.session.user = user
  return res.redirect('/')
}
