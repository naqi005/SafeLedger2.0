const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { getRates, convert, convertRules } = require('../controllers/exchangeController')

router.get('/rates',   auth, getRates)
router.post('/convert', auth, convertRules, validate, convert)

module.exports = router