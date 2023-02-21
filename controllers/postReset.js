const hashPassword = require('../utils/hashPassword')

module.exports = async (req, res) => {
  const { user } = res.locals
  user.token.reset = undefined
  user.password = await hashPassword(req.body.password)
  await user.save()
  req.flash('success', 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที')
  return res.redirect('/login')
}
