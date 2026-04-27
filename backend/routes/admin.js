const router = require('express').Router()
const auth   = require('../middlewares/auth')
const {
  adminOnly, getAllUsers, getAllTransactions,
  freezeWallet, unfreezeWallet, getAuditLog, suspendUser, reactivateUser,
} = require('../controllers/adminController')

// All admin routes require a valid JWT + admin role
router.use(auth, adminOnly)

router.get('/users',                    getAllUsers)
router.get('/transactions',             getAllTransactions)
router.get('/audit-log',                getAuditLog)
router.patch('/wallets/:id/freeze',     freezeWallet)
router.patch('/wallets/:id/unfreeze',   unfreezeWallet)
router.patch('/users/:id/suspend',      suspendUser)
router.patch('/users/:id/reactivate',   reactivateUser)

module.exports = router