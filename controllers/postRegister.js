const bcrypt = require('bcrypt')
const Users = require('../models/Users')

module.exports = async (req, res) => {
  // ---------------------
  const redirectWithError = (message) => {
    req.flash('error', message)
    return res.redirect('/register')
  }
  // ---------------------
  if (req.body.password !== req.body.passwordConfirm) {
    return redirectWithError('รหัสผ่านไม่เหมือนกัน')
  }
  const user = await Users.findOne({ email: req.body.email })
  if (user) {
    return redirectWithError('Email นี้เคยลงทะเบียนแล้ว')
  }
  try {
    req.body.password = await bcrypt.hash(
      req.body.password,
      +process.env.SALT_ROUND
    )
    await Users.create(req.body)
  } catch (error) {
    redirectWithError(error.message || 'เกิดปัญหาในการสมัคร')
  }
  req.flash('success', 'คุณได้สมัครสมาชิกสำเร็จแล้ว')
  return res.redirect('/login')
}
