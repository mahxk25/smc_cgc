export function requireAdmin(req, res, next) {
  if (req.adminRole !== 'ADMIN' && req.adminRole !== 'PLACEMENT_OFFICER') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
