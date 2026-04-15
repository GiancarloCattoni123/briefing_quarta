const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateAccessToken } = require('../utils/tokenUtils');
const crypto = require('crypto');

exports.setup = async (req, res, next) => {
  try {
    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      return res.status(409).json({ success: false, message: 'Uma empresa já está cadastrada no sistema. O setup só pode ser executado uma vez.', code: 'COMPANY_EXISTS' });
    }

    const { companyName, adminName, email, password } = req.body;
    
    if (!companyName || !adminName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Preencha todos os campos: companyName, adminName, email, password.', code: 'MISSING_FIELDS' });
    }

    const company = await prisma.company.create({
      data: { name: companyName }
    });

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        company_id: company.id,
        name: adminName,
        email,
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true
      }
    });

    const token = generateAccessToken(user);

    res.status(201).json({
      success: true,
      data: {
        company: { id: company.id, name: company.name },
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.', code: 'MISSING_CREDENTIALS' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.is_active || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas ou usuário inativo.', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateAccessToken(user);
    
    // Gera refreshToken
    const refreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    const refreshToken = await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshTokenStr,
        expires_at: expiresAt
      }
    });

    res.json({
      success: true,
      data: {
        token,
        refreshToken: refreshToken.token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers['x-refresh-token'] || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token não fornecido.', code: 'MISSING_REFRESH_TOKEN' });
    }

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    res.json({ success: true, data: { message: 'ok' } });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token não fornecido.', code: 'MISSING_REFRESH_TOKEN' });
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      return res.status(401).json({ success: false, message: 'Refresh token inválido.', code: 'INVALID_REFRESH_TOKEN' });
    }

    if (new Date() > tokenRecord.expires_at) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      return res.status(401).json({ success: false, message: 'Refresh token expirado.', code: 'EXPIRED_REFRESH_TOKEN' });
    }

    if (!tokenRecord.user.is_active) {
      return res.status(401).json({ success: false, message: 'Usuário inativo.', code: 'INACTIVE_USER' });
    }

    const token = generateAccessToken(tokenRecord.user);
    res.json({ success: true, data: { token } });

  } catch (error) {
    next(error);
  }
};
