export function validateBody(schema) {
  return (req, res, next) => {
    const keys = Object.keys(schema);
    for (const k of keys) {
      const rule = schema[k];
      const v = req.body[k];
      if (rule.required && (v === undefined || v === null || v === '')) {
        return res.status(400).json({ error: `${k} is required` });
      }
      if (v !== undefined && v !== null && rule.type) {
        const t = typeof v;
        if (rule.type === 'string' && t !== 'string') {
          return res.status(400).json({ error: `${k} must be a string` });
        }
        if (rule.type === 'number' && t !== 'number') {
          return res.status(400).json({ error: `${k} must be a number` });
        }
      }
    }
    next();
  };
}
