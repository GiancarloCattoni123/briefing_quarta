/**
 * Serviço de Notificação
 * 
 * Responsável por lidar com o envio de alertas para usuários sobre tarefas.
 * Futuramente, esta classe poderá ser acoplada a serviços de e-mail (SendGrid, AWS SES),
 * Slack, Discord ou Webhooks internos da aplicação frontend.
 */

const notifyOverdue = async (task) => {
  // TODO: Conectar com provedores externos de e-mail/mensagens
  // Parâmetros esperados na task:
  // - task.id, task.title, task.assigned_to, etc.
  
  console.log(`[Notification Service] Alerta de Tarefa Atrasada enviada:
  - Tarefa ID: ${task.id}
  - Título: ${task.title}
  - Atribuído para (User ID): ${task.assigned_to}
  - Data de Vencimento original: ${task.due_date}`);
};

module.exports = {
  notifyOverdue
};
