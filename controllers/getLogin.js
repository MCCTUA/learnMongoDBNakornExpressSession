module.exports = (req, res) => {
  res.render('login', {
    error: req.flash('error')
  })
}
