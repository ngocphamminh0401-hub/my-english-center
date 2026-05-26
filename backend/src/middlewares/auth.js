const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const tokenPair = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith('token='));
  if (!tokenPair) return null;
  return decodeURIComponent(tokenPair.substring('token='.length));
};

const authenticate = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.user_id || payload.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = {
      user_id: userId,
      role: payload.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

module.exports = { authenticate, requireRole };
