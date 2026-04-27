const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { createDeposit, getDeposits, createDepositRules } = require('../controllers/depositController')

router.use(auth)

router.get('/',  getDeposits)
router.post('/', createDepositRules, validate, createDeposit)

module.exports = router