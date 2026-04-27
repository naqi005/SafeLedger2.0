const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { register, login, me, logout, logoutAll, registerRules, loginRules } = require('../controllers/authController')

router.post('/register',   registerRules, validate, register)
router.post('/login',      loginRules,    validate, login)
router.get('/me',          auth,                    me)
router.post('/logout',     logout)
router.post('/logout-all', auth,                    logoutAll)

module.exports = router