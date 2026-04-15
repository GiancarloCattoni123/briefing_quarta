const prisma = require('../config/db');

exports.listTasks = async (req, res, next) => {
  try {
    const { status, assigned_to, priority, due_date, project_id, parent_task_id } = req.query;
    
    let whereClause = { company_id: req.user.company_id };

    if (req.user.role === 'member') {
      whereClause.assigned_to = req.user.id;
    } else if (assigned_to) {
      whereClause.assigned_to = assigned_to;
    }

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (due_date) whereClause.due_date = new Date(due_date);
    if (project_id !== undefined) whereClause.project_id = project_id === 'null' ? null : project_id;
    if (parent_task_id !== undefined) whereClause.parent_task_id = parent_task_id === 'null' ? null : parent_task_id;

    const tasks = await prisma.task.findMany({ where: whereClause });
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueTasks = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let whereClause = {
      company_id: req.user.company_id,
      due_date: { lt: today },
      status: { not: 'done' }
    };

    if (req.user.role === 'member') {
      whereClause.assigned_to = req.user.id;
    }

    const tasks = await prisma.task.findMany({ where: whereClause });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assigned_to, due_date, priority, project_id, parent_task_id } = req.body;

    if (!title || !assigned_to || !due_date || !priority) {
      return res.status(400).json({ success: false, message: 'Campos title, assigned_to, due_date e priority são obrigatórios.', code: 'MISSING_TASK_FIELDS' });
    }

    const task = await prisma.task.create({
      data: {
        company_id: req.user.company_id,
        created_by: req.user.id,
        assigned_to,
        title,
        description,
        status: 'todo',
        priority,
        due_date: new Date(due_date),
        project_id: project_id || null,
        parent_task_id: parent_task_id || null
      }
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        company_id: req.user.company_id,
        ...(req.user.role === 'member' && { assigned_to: req.user.id })
      },
      include: {
        subtasks: true
      }
    });

    if (!task) return res.status(404).json({ success: false, message: 'Tarefa não encontrada ou restrita.', code: 'TASK_NOT_FOUND' });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, assigned_to, due_date, priority, status, project_id, parent_task_id } = req.body;

    const taskExists = await prisma.task.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!taskExists) return res.status(404).json({ success: false, message: 'Tarefa não encontrada.', code: 'TASK_NOT_FOUND' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (due_date !== undefined) updateData.due_date = new Date(due_date);
    if (priority !== undefined) updateData.priority = priority;
    if (project_id !== undefined) updateData.project_id = project_id;
    if (parent_task_id !== undefined) updateData.parent_task_id = parent_task_id;
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'done' && taskExists.status !== 'done') {
        updateData.completed_at = new Date();
      } else if (status !== 'done') {
        updateData.completed_at = null;
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status é obrigatório.', code: 'MISSING_STATUS' });

    const taskExists = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        company_id: req.user.company_id,
        ...(req.user.role === 'member' && { assigned_to: req.user.id })
      }
    });

    if (!taskExists) return res.status(404).json({ success: false, message: 'Tarefa não encontrada ou você não tem acesso.', code: 'TASK_NOT_FOUND' });

    let completed_at = taskExists.completed_at;
    if (status === 'done' && taskExists.status !== 'done') {
      completed_at = new Date();
    } else if (status !== 'done') {
      completed_at = null;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status, completed_at }
    });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const taskExists = await prisma.task.findFirst({
      where: { id: req.params.id, company_id: req.user.company_id }
    });

    if (!taskExists) return res.status(404).json({ success: false, message: 'Tarefa não encontrada.', code: 'TASK_NOT_FOUND' });

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, data: { message: 'Tarefa removida com sucesso.' } });
  } catch (error) {
    next(error);
  }
};
