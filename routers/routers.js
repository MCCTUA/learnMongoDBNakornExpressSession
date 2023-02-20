const { Router } = require('express')
const passport = require('passport')
const mustLoggedIn = require('../middlewares/mustLoggedIn')
const router = Router()

const postLogin = require('../controllers/postLogin')
const scopeFacebook = ['email']

router.get('/', mustLoggedIn, require('../controllers/index'))
router.post(
  '/update-password',
  mustLoggedIn,
  require('../controllers/updatePassword')
)
router.get('/login', require('../controllers/getLogin'))
router.post('/login', postLogin('local'))
router.get(
  '/login/facebook',
  passport.authenticate('facebook', { scope: [scopeFacebook] })
)
router.get('/login/google', passport.authenticate('google'))
router.get('/login/facebook/callback', postLogin('facebook'))
router.get('/login/google/callback', postLogin('google'))

router.get('/register', require('../controllers/getRegister'))
router.post('/register', require('../controllers/postRegister'))
router.get('/logout', require('../controllers/logout'))

// ทำทดสอบ passport deserialize ให้ดู ข้อมูล req.user
// router.get('/user', (req, res) => {
//   res.send(req.user)
// })

module.exports = router
