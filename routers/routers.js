const { Router } = require('express')
const mustLoggedIn = require('../middlewares/mustLoggedIn')
const router = Router()

router.get('/', mustLoggedIn, require('../controllers/index'))
router.get('/login', require('../controllers/getLogin'))
router.post('/login', require('../controllers/postLogin.js'))
router.get('/register', require('../controllers/getRegister'))
router.post('/register', require('../controllers/postRegister'))

module.exports = router
