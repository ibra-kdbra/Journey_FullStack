const crypto = require('crypto')
const { ACCESS_TOKEN } = require('../config.js')
const cookie = require('cookie')

function safeEqual (a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

module.exports = (cookies) => {
  if (ACCESS_TOKEN) { // server allows admin connections
    if (cookies) { // client has cookies
      const parsedCookies = cookie.parse(cookies)
      const token = parsedCookies.Access_Token
      if (typeof token === 'string' && safeEqual(token, ACCESS_TOKEN)) { // auth
        return true
      }
    }
  }
  return false
}
