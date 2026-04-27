const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { getAll, sendMoney, getById, sendRules } = require('../controllers/transactionController')

router.use(auth)

router.get('/',         getAll)
router.post('/send',    sendRules, validate, sendMoney)
router.get('/:id',      getById)

module.exports = router