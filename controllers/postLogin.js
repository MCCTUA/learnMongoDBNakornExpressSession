const Users = require('../models/Users')

module.exports = async (req, res) => {
  const user = await Users.findOne({
    email: req.body.email,
    password: req.body.password
  })
  if (!user) {
    req.flash('error', 'Email หรือ Password ไม่ถูกต้อง')
    return res.redirect('/login')
  }
  // ถ้าพบ user ให้เก็บลงใน Session ตามด้านล่างต่อไป
  req.flash('success', 'เข้าสู่ระบบสำเร็จ')
  req.session.user = user
  return res.redirect('/')
}
