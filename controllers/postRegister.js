const bcrypt = require('bcrypt')
const crypto = require('crypto')
const path = require('path')
const Users = require('../models/Users')
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
    req.body.password = await bcrypt.hash(
      req.body.password,
      +process.env.SALT_ROUND
    )
    const activateToken = crypto.randomBytes(32).toString('hex')
    req.body.token = {
      activate: activateToken
    }
    await Users.create(req.body)
    await sendMail({
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
