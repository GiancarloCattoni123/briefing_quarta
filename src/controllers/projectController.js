const prisma = require('../config/db');

exports.listProjects = async (req, res, next) => {
  try {
    let projects;
    
    if (req.user.role === 'admin') {
      projects = await prisma.project.findMany({
        where: { company_id: req.user.company_id }
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          company_id: req.user.company_id,
          tasks: {
            some: { assigned_to: req.user.id }
          }
        }
      });
    }

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: 'O nome do projeto é obrigatório.', code: 'MISSING_PROJECT_NAME' });

    const project = await prisma.project.create({
      data: {
        company_id: req.user.company_id,
        created_by: req.user.id,
        name,
        description
      }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id },
      include: {
        tasks: {
          where: req.user.role === 'member' ? { assigned_to: req.user.id } : undefined
        }
      }
    });

    if (!project) return res.status(404).json({ success: false, message: 'Projeto não encontrado ou acesso negado.', code: 'PROJECT_NOT_FOUND' });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const projectExists = await prisma.project.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!projectExists) return res.status(404).json({ success: false, message: 'Projeto não encontrado.', code: 'PROJECT_NOT_FOUND' });

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const projectExists = await prisma.project.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!projectExists) return res.status(404).json({ success: false, message: 'Projeto não encontrado.', code: 'PROJECT_NOT_FOUND' });

    await prisma.task.updateMany({
      where: { project_id: req.params.id },
      data: { project_id: null }
    });

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, data: { message: 'Projeto removido.' } });
  } catch (error) {
    next(error);
  }
};
