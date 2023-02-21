const Users = require('../models/Users')

module.exports = async (req, res, next) => {
  const user = await Users.findOne({ 'token.reset': req.params.token })
  if (!user) {
    req.flash('error', 'ไม่พบการขอรับรหัสผ่านใหม่ หรือได้รับการแก้ไขเสร็จสิ้น')
    return res.redirect('/login')
  }
  res.locals.user = user
  next()
}
