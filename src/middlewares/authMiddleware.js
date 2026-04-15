const { verifyAccessToken } = require('../utils/tokenUtils');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token não fornecido ou inválido', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Token expirado ou inválido', code: 'UNAUTHORIZED' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!user || (!user.is_active && req.path !== '/logout')) {
    return res.status(401).json({ success: false, message: 'Usuário desativado ou não encontrado', code: 'UNAUTHORIZED' });
  }

  req.user = decoded; // { id, company_id, role }
  next();
};

module.exports = authenticate;
