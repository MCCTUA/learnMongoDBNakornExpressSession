module.exports = (req, res) => {
  res.render('reset', {
    user: res.locals.user,
    token: req.params.token
  })
}
