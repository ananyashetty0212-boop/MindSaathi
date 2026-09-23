const { verifyToken } = require('../services/authService');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required. Please log in again.' });
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission for this action.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
