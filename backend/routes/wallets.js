const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { getAll, create, getById, toggleStatus, createRules } = require('../controllers/walletController')

router.use(auth)

router.get('/',             getAll)
router.post('/',            createRules, validate, create)
router.get('/:id',          getById)
router.patch('/:id/toggle', toggleStatus)

module.exports = router