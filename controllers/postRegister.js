const Users = require('../models/Users')

module.exports = async (req, res) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return res.redirect('/register')
  }
  await Users.create(req.body)
  return res.redirect('/login')
}
