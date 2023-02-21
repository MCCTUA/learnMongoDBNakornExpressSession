const hashPassword = require('../utils/hashPassword')

module.exports = async (req, res) => {
  req.user.password = await hashPassword(req.body.password)
  await req.user.save()
  req.flash('success', 'คุณได้เพิ่มรหัสผ่านแล้ว')
  res.redirect('/')
}
