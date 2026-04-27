const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { createWithdrawal, getWithdrawals, createWithdrawalRules } = require('../controllers/withdrawalController')

router.use(auth)

router.get('/',  getWithdrawals)
router.post('/', createWithdrawalRules, validate, createWithdrawal)

module.exports = router