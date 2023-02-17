module.exports = (req, res) => {
  req.session.user = null
  res.redirect('/login')
}
