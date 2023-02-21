const path = require('path')
const Users = require('../models/Users')
const generateToken = require('../utils/generateToken')
const hashPassword = require('../utils/hashPassword')
const sendMail = require('../utils/sendMail')

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
    req.body.password = await hashPassword(req.body.password)
    const activateToken = generateToken()
    req.body.token = {
      activate: activateToken
    }
    await Users.create(req.body)
    // ขั้นตอนการส่ง mail (sendMail()) นี้ ไม่ต้อง await ให้ระบบส่ง email ไปได้เลย เนื่องจากเวลาอยู่ใน production หาก เรา await ขั้นตอนนี้ จะเสียเวลามาก และเกิดการรอ ทำให้ไม่ลงไปทำงาน req.flash (ด้านล่าง) ต่อ
    sendMail({
      email: req.body.email,
      subject: 'ยืนยันตัวตนผ่านทางอีเมล',
      pug: {
        file: path.join(__dirname, '../views/mails/activate.pug'),
        options: {
          tokenUrl: `${process.env.BASE_URL}/activate/${activateToken}`
        }
      }
    })
  } catch (error) {
    redirectWithError(error.message || 'เกิดปัญหาในการสมัคร')
  }
  req.flash('success', 'คุณได้สมัครสมาชิกสำเร็จแล้ว')
  return res.redirect('/login')
}
