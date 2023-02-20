const bcrypt = require('bcrypt')

module.exports = async (req, res) => {
  req.user.password = await bcrypt.hash(
    req.body.password,
    +process.env.SALT_ROUND
  )
  await req.user.save()
  req.flash('success', 'คุณได้เพิ่มรหัสผ่านแล้ว')
  res.redirect('/')
}
