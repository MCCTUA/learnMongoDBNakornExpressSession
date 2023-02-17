const Users = require('../models/Users')

module.exports = async (req, res) => {
  const user = await Users.findOne({
    email: req.body.email,
    password: req.body.password
  })
  if (!user) {
    return res.redirect('/login')
  }
  // ถ้าพบ user ให้เก็บลงใน Session ตามด้านล่างต่อไป
  req.session.user = user
  return res.redirect('/')
}
