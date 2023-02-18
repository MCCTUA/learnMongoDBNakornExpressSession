const { Router } = require('express')
const mustLoggedIn = require('../middlewares/mustLoggedIn')
const router = Router()

router.get('/', mustLoggedIn, require('../controllers/index'))
router.get('/login', require('../controllers/getLogin'))
router.post('/login', require('../controllers/postLogin'))
router.get('/register', require('../controllers/getRegister'))
router.post('/register', require('../controllers/postRegister'))
router.get('/logout', require('../controllers/logout'))

// ทำทดสอบ passport deserialize ให้ดู ข้อมูล req.user
// router.get('/user', (req, res) => {
//   res.send(req.user)
// })

module.exports = router
