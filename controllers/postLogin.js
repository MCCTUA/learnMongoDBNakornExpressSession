const passport = require('passport')

module.exports = (req, res, next) => {
  // Custom handler จากการใช้ passport
  // (err, user, info) ได้มาจาก ./boostrap/passport.js ในจังหวะที่เราส่ง next(null, user, message) ออกมา
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      // next(err) ตัวนี้เป็น middleware ของ express ไม่ใช้ของ passport
      return next(err)
    }
    if (!user) {
      req.flash('error', info)
      return res.redirect('/login')
    }
    req.login(user, (err) => {
      if (err) {
        return next(err)
      }
      req.flash('success', 'คุณได้เข้าสู่ระบบเสร็จสิ้น')
      return res.redirect('/')
    })
  })(req, res, next) // <--- วงเล็บปิดเรียก (req, res, next)
}

/*
{
    successRedirect: '/',
    failureRedirect: '/login'
  }
*/
