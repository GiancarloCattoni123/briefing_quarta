const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado: permissão insuficiente.', code: 'FORBIDDEN' });
    }
    next();
  };
};

module.exports = {
  isAdmin: requireRole(['admin']),
  isMemberOrAdmin: requireRole(['admin', 'member']),
};
