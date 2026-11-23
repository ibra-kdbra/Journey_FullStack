const { READ_ONLY, NON_LOCAL_READ_ONLY } = require('../config.js')
const isAdmin = require('./isAdmin.js')

module.exports = (req, res, next) => {
  // skip if development
  if (process.env.NODE_ENV === 'development') {
    return next()
  }

  // allow if admin
  if (isAdmin(req.headers.cookie)) {
    return next()
  }

  let allowedAccess = true

  // READ_ONLY check
  if (READ_ONLY) {
    allowedAccess = false
  }

  // NON_LOCAL_READ_ONLY check
  const clientIp = getClientIp(req)
  if (NON_LOCAL_READ_ONLY && !isIpPrivate(clientIp)) {
    allowedAccess = false
  }

  if (allowedAccess) {
    return next()
  } else {
    res.status(403).send({
      success: false,
      message: 'Permission Denied! read only access allowed.'
    })
  }
}

// The X-Forwarded-For header is client controlled unless a trusted reverse
// proxy sets it. Only honour it when TRUSTED_PROXY=true, and then use the last
// entry, which is the one appended by our own proxy.
function getClientIp (req) {
  if (process.env.TRUSTED_PROXY === 'true') {
    const xff = req.headers['x-forwarded-for']
    if (typeof xff === 'string' && xff.trim()) {
      const parts = xff.split(',')
      return parts[parts.length - 1].trim()
    }
  }
  const addr = (req.socket && req.socket.remoteAddress) || ''
  return addr.replace(/^::ffff:/, '')
}

function isIpPrivate (ip) {
  // https://www.npmjs.com/package/ip
  return /^10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip)
}

module.exports.getClientIp = getClientIp
module.exports.isIpPrivate = isIpPrivate
