const router   = require('express').Router()
const auth     = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const {
  getProfile, updateProfile, changePassword, addMoney,
  updateProfileRules, changePasswordRules, addMoneyRules,
} = require('../controllers/userController')

router.use(auth)

router.get('/profile',         getProfile)
router.put('/profile',         updateProfileRules,  validate, updateProfile)
router.put('/change-password', changePasswordRules, validate, changePassword)
router.post('/add-money',      addMoneyRules,       validate, addMoney)

module.exports = router