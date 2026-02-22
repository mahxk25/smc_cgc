import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smc-career-connect-secret-change-in-prod';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authStudent(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'student') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.studentId = decoded.id;
  next();
}

export function authAdmin(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'admin') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.adminId = decoded.id;
  req.adminRole = decoded.role;
  next();
}
