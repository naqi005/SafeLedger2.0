const { validationResult } = require('express-validator')
const { fail } = require('../utils/response')

/**
 * Reads express-validator results and short-circuits with 400 if any field failed.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const message = errors.array().map(e => `${e.path}: ${e.msg}`).join(' | ')
    return fail(res, message, 400)
  }
  next()
}