import * as authService from '../services/auth.service.js';

export async function studentLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const result = await authService.studentLogin(username.trim(), password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  res.json(result);
}

export async function adminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const result = await authService.adminLogin(username.trim(), password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  res.json(result);
}
