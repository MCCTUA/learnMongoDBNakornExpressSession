const { Router } = require('express')
const getLoginController = require('../controller/getLogin')
const router = Router()

router.get('/', getLoginController)

module.exports = router
