module.exports = (req, res, next) => {
  // ใช้.logout()ซึ่งเป็น method ของ password แทน req.session.user = null
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.flash('success', 'คุณได้ออกจากระบบเสร็จสิ้น')
    res.redirect('/login')
  })
  req.flash('success', 'คุณได้ออกจากระบบเสร็จสิ้น')
}
