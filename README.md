# Task Management Backend

Este é o backend do Sistema de Gestão de Tarefas, desenvolvido em Node.js com Express e PostgreSQL via Prisma ORM.

## Pré-requisitos
- Node.js v16+
- PostgreSQL
- Npm ou Yarn

## Configuração

1. Clone ou baixe o projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o banco de dados PostgreSQL.
4. Crie o arquivo `.env` a partir do `/.env.example` e atualize a variável `DATABASE_URL` com as suas credenciais e nome do base de dados (Ex: postgresql://postgres:1234@localhost:5432/taskmanager).
5. Gere as migrações do Prisma para criar as tabelas no seu banco:
   ```bash
   npx prisma migrate dev --name init
   ```

## Executar o Servidor

Existem dois comandos principais para rodar o projeto.

### Desenvolvimento
Inicia o servidor com NodeMon (recarrega automaticamente a cada modificação):
```bash
npm run dev
```

### Produção / Standalone
Inicia o servidor normalmente com o node:
```bash
npm start
```

## Como o Setup funciona

A primeira chamada de API a ser realizada no sistema deve ser em `POST http://localhost:3001/api/auth/setup` enviando as informações básicas da company e do primeiro usuário administrador. Posteriormente, logue no terminal com `/api/auth/login`.

```json
{
  "companyName": "Minha Empresa",
  "adminName": "John Doe",
  "email": "johndoe@email.com",
  "password": "senha_segura"
}
```

O App possui um Cron integrado no arquivo `src/jobs/overdueJob.js` que roda e verifica automaticamente as tarefas atrasadas e emite logs da notificação a cada hora.
