const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in first.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Login token is invalid or expired.' })
  }
}

module.exports = requireAuth