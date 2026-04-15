const cron = require('node-cron');
const prisma = require('../config/db');
const { notifyOverdue } = require('../services/notificationService');

// Roda a cada hora no minuto 0 (ex: 14:00, 15:00)
cron.schedule('0 * * * *', async () => {
  console.log('[Cron Job] Verificando tarefas atrasadas...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Atualizar para overdue tarefas que VENCERAM (due_date < hoje)
    // E que ainda não possuem status 'overdue' ou 'done'
    const newlyOverdued = await prisma.task.findMany({
      where: {
        due_date: { lt: today },
        status: { notIn: ['done', 'overdue'] }
      }
    });

    for (const task of newlyOverdued) {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'overdue',
          last_notified_at: new Date() // Primeira notificação
        }
      });
      // Notifica vencimento
      await notifyOverdue(task);
    }

    // 2. Lógica de reincidência (Tarefas que já são overdue e não concluídas)
    // "a cada 7 dias enquanto não for concluída"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recurringOverdue = await prisma.task.findMany({
      where: {
        status: 'overdue',
        OR: [
          { last_notified_at: { lte: sevenDaysAgo } },
          { last_notified_at: null } // Caso manual
        ]
      }
    });

    for (const task of recurringOverdue) {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          last_notified_at: new Date() // Atualiza timer da reincidência
        }
      });
      // Notifica reincidência
      await notifyOverdue(task);
    }

    if (newlyOverdued.length > 0 || recurringOverdue.length > 0) {
      console.log(`[Cron Job] Atualizadas/Notificadas: ${newlyOverdued.length} novas, ${recurringOverdue.length} reincidentes.`);
    }

  } catch (error) {
    console.error('[Cron Job] Erro ao processar tarefas atrasadas:', error);
  }
});
