# Documentação da API

Todas as rotas (exceto `/api/health` e `/api/auth/setup` / `/api/auth/login`) exigem Autenticação enviando o Header:
`Authorization: Bearer <TOKEN>`

Formato Padrão de Resposta (Sucesso):
```json
{
  "success": true,
  "data": { ... }
}
```

Formato Padrão de Resposta (Erro):
```json
{
  "success": false,
  "message": "Descrição do erro",
  "code": "ERROR_CODE"
}
```

---

## Health Check

### GET /api/health
Verifica a disponibilidade do Backend.
- **Auth:** Não requerida
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2023-10-31T12:00:00.000Z"
  }
}
```

---

## Auth

### POST /api/auth/setup
Cria o primeiro usuário (Admin) e a Empresa. Só pode ser executada se não houver nenhuma empresa.
- **Auth:** Não requerida
- **Body:** `{ "companyName": "string", "adminName": "string", "email": "string", "password": "string" }`
- **Resposta:** `{ "success": true, "data": { "company": {...}, "user": {...}, "token": "..." } }`

### POST /api/auth/login
Loga usuário e retorna credenciais e JWT de refresh.
- **Auth:** Não requerida
- **Body:** `{ "email": "string", "password": "string" }`
- **Resposta:** `{ "success": true, "data": { "token": "...", "refreshToken": "...", "user": {...} } }`

### POST /api/auth/refresh
Renova access token.
- **Auth:** Não requerida (recebe via body)
- **Body:** `{ "refreshToken": "string" }`
- **Resposta:** `{ "success": true, "data": { "token": "..." } }`

### POST /api/auth/logout
Deleta a sessão ativa do banco.
- **Auth:** Não requerida no Bearer (mas pega do Refresh)
- **Body:** `{ "refreshToken": "string" }`
- **Resposta:** `{ "success": true, "data": { "message": "ok" } }`

---

## Users

### GET /api/users/me
- **Auth:** Todos (Member/Admin)
- **Resposta:** `{ "success": true, "data": { "id": "...", "name": "...", "email": "..." } }`

### PUT /api/users/me/password
- **Auth:** Todos
- **Body:** `{ "password": "nova senha aqui" }`

### GET /api/users
- **Auth:** Admin
- **Resposta:** Lista de usuários na `.data` com a contagem de tarefas não terminadas.

### POST /api/users
Cria novo usuário filiado à mesma empresa do Admin.
- **Auth:** Admin
- **Body:** `{ "name": "string", "email": "string", "password": "string", "role": "admin" | "member", "position": "string?" }`

### GET /api/users/:id
- **Auth:** Todos (Retorna o usuário)

### PUT /api/users/:id
Altera dados de um usuário (apenas Admin).
- **Auth:** Admin
- **Body:** Mutações Opcionais.

### DELETE /api/users/:id
Desativa usuário.
- **Auth:** Admin

---

## Projects

### GET /api/projects
- **Auth:** Todos. Retorna lista. Se Admin, todos os projetos. Se Member, apenas os que ele tem tarefas dentro.

### POST /api/projects
- **Auth:** Admin
- **Body:** `{ "name": "string", "description": "string?" }`

### GET /api/projects/:id
- **Auth:** Todos. Retorna projeto com lista aninhada em `tasks`.

### PUT /api/projects/:id
- **Auth:** Admin
- **Body:** `{ "name": "string?", "description": "string?" }`

### DELETE /api/projects/:id
- **Auth:** Admin (Remove mas as tasks viram null).

---

## Tasks

### GET /api/tasks
Lista tarefas ativas/inativas da companhia com filtros query: `?status=x&priority=y`. Se Member, filtra forçadamente por ele mesmo.
- **Auth:** Todos

### GET /api/tasks/overdue
Retorna as tarefas pendentes de hoje para trás.
- **Auth:** Todos

### POST /api/tasks
Cria nova tarefa.
- **Auth:** Admin
- **Body:** `{ "title": "string", "description": "string?", "assigned_to": "User ID", "due_date": "ISO-Date", "priority": "low | medium | high", "project_id": "Project ID?", "parent_task_id": "Parent Task ID?" }`

### GET /api/tasks/:id
Retorna detalhes + Array de `subtasks`.
- **Auth:** Todos (Filtra de acordo com restrições do Member).

### PUT /api/tasks/:id
Atualiza qualquer campo incluindo mudança estrutural de pai/projeto.
- **Auth:** Admin
- **Body:** Mutações opcionais listadas no endpoint de Criação.

### PATCH /api/tasks/:id/status
Permite a modificação do estado de progressão por quem o possui. (Member pode se atribuída).
- **Auth:** Todos
- **Body:** `{ "status": "todo | in_progress | done | overdue" }`

### DELETE /api/tasks/:id
Apaga a Tarefa.
- **Auth:** Admin

---

## Dashboard

### GET /api/dashboard/summary
Contadores numéricos em tela baseados no Schema Inteiro (Para membros e admin baseados no seu tipo de visao).
- **Auth:** Admin (Ideal) / Todos (Escopo Geral da Company)

### GET /api/dashboard/by-user
Exibe matriz de usuários agrupando contadores atrelados.
- **Auth:** Admin/Todos
