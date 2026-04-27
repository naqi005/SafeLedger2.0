/**
 * Send a plain data response (array, object, etc.)
 * Frontend axios calls use res.data directly, so we return data unwrapped.
 */
const send = (res, data, statusCode = 200) => res.status(statusCode).json(data)

/**
 * Send a JSON error with a `message` field.
 * Frontend uses err.response?.data?.message for display.
 */
const fail = (res, message = 'Internal server error', statusCode = 500) =>
  res.status(statusCode).json({ message })

module.exports = { send, fail }