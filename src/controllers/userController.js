const prisma = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { company_id: req.user.company_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        is_active: true,
        created_at: true,
        _count: {
          select: {
            assigned_tasks: {
              where: { status: { not: 'done' } }
            }
          }
        }
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, position } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.', code: 'MISSING_FIELDS' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'E-mail já está em uso.', code: 'EMAIL_IN_USE' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        company_id: req.user.company_id,
        name,
        email,
        password_hash: hashedPassword,
        role,
        position,
        is_active: true
      },
      select: { id: true, name: true, email: true, role: true, position: true }
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, position: true, is_active: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateMyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Nova senha é obrigatória.', code: 'MISSING_PASSWORD' });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash: hashedPassword }
    });

    res.json({ success: true, data: { message: 'Senha atualizada com sucesso.' } });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id },
      select: { id: true, name: true, email: true, role: true, position: true, is_active: true }
    });

    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado.', code: 'USER_NOT_FOUND' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, position, role, is_active } = req.body;
    
    const userExists = await prisma.user.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!userExists) return res.status(404).json({ success: false, message: 'Usuário não encontrado.', code: 'USER_NOT_FOUND' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(position !== undefined && { position }),
        ...(role && { role }),
        ...(is_active !== undefined && { is_active })
      },
      select: { id: true, name: true, role: true, position: true, is_active: true }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const userExists = await prisma.user.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!userExists) return res.status(404).json({ success: false, message: 'Usuário não encontrado.', code: 'USER_NOT_FOUND' });

    await prisma.user.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });

    res.json({ success: true, data: { message: 'Usuário desativado com sucesso.' } });
  } catch (error) {
    next(error);
  }
};
