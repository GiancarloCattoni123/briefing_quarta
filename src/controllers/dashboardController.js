const prisma = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    const summary = await prisma.task.groupBy({
      by: ['status'],
      where: { company_id: req.user.company_id },
      _count: { _all: true }
    });

    const result = {
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0
    };

    summary.forEach(item => {
      result[item.status] = item._count._all;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const usersWithTasks = await prisma.user.findMany({
      where: { company_id: req.user.company_id },
      select: {
        id: true,
        name: true,
        assigned_tasks: {
          select: { status: true }
        }
      }
    });

    const result = usersWithTasks.map(user => {
      const taskCounts = { todo: 0, in_progress: 0, done: 0, overdue: 0 };
      
      user.assigned_tasks.forEach(task => {
        if (taskCounts[task.status] !== undefined) {
          taskCounts[task.status]++;
        }
      });

      return {
        id: user.id,
        name: user.name,
        taskCounts
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
