const Users = require('../models/Users')

module.exports = async (req, res) => {
  const user = await Users.findOne({ 'token.activate': req.params.token })
  if (!user) {
    req.flash('error', 'ไม่พบรหัสการยืนยันตัวตน หรือได้รับการยืนยันไปแล้ว')
    return res.redirect('/login')
  }
  user.token.activate = undefined // เฉพาะใน mongoose จะเป็นการลบข้อมูลตัวนี้ออกไป ในที่นี้คือ token : {activate:...}
  await user.save()
  req.flash('success', `คุณได้ยืนยันตัวตนผ่านอีเมล ${user.email} เสร็จสิ้น`)
  return res.redirect('/login')
}
