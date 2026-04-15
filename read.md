# Prompt — Backend: Sistema de Gestão de Tarefas

## Contexto

Você vai construir o backend completo de um sistema de gestão de tarefas para uma startup com time 100% remoto. O sistema tem três camadas: frontend (React), backend (Node.js/Express) e banco de dados (PostgreSQL). Sua responsabilidade é exclusivamente o backend e o banco de dados.

O frontend já tem escopo definido e vai consumir sua API via HTTP. Não construa nada de interface.

---

## Stack obrigatória

- **Node.js** com **Express.js**
- **PostgreSQL** como banco de dados
- **Prisma ORM** para comunicação com o banco
- **JWT (jsonwebtoken)** para autenticação — access token expira em 15 minutos, refresh token expira em 7 dias
- **Bcrypt** para criptografia de senhas
- **Dotenv** para variáveis de ambiente
- **Cors** habilitado para o frontend consumir a API

---

## Estrutura de pastas

```
/src
  /routes        → auth.js, users.js, tasks.js, dashboard.js
  /controllers   → lógica separada das rotas
  /middleware    → auth.js (valida JWT), role.js (verifica se é admin)
  /prisma        → schema.prisma, client.js
  /utils         → gerarToken.js, compararSenha.js
.env             → DATABASE_URL, JWT_SECRET, PORT
server.js        → inicializa Express e conecta rotas
```

---

## Banco de dados — tabelas via Prisma

### companies
| Campo | Tipo | Obrigatório |
|---|---|---|
| id | UUID | Sim (gerado automaticamente) |
| name | VARCHAR(255) | Sim |
| logo_url | TEXT | Não |
| created_at | TIMESTAMP | Sim |
| updated_at | TIMESTAMP | Sim |

### users
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | UUID | Sim | |
| company_id | UUID (FK → companies) | Sim | |
| name | VARCHAR(255) | Sim | |
| email | VARCHAR(255) | Sim | único |
| password_hash | TEXT | Sim | bcrypt |
| role | ENUM | Sim | 'admin' ou 'member' |
| position | VARCHAR(255) | Não | cargo |
| is_active | BOOLEAN | Sim | false = não pode logar |
| created_at | TIMESTAMP | Sim | |
| updated_at | TIMESTAMP | Sim | |

### tasks
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | UUID | Sim | |
| company_id | UUID (FK → companies) | Sim | |
| created_by | UUID (FK → users) | Sim | |
| assigned_to | UUID (FK → users) | Sim | |
| title | VARCHAR(255) | Sim | |
| description | TEXT | Não | |
| status | ENUM | Sim | 'todo', 'in_progress', 'done', 'overdue' |
| priority | ENUM | Sim | 'low', 'medium', 'high' |
| due_date | DATE | Sim | |
| completed_at | TIMESTAMP | Não | preenchido ao marcar como done |
| created_at | TIMESTAMP | Sim | |
| updated_at | TIMESTAMP | Sim | |

### refresh_tokens
| Campo | Tipo | Obrigatório |
|---|---|---|
| id | UUID | Sim |
| user_id | UUID (FK → users) | Sim |
| token | TEXT | Sim |
| expires_at | TIMESTAMP | Sim |
| created_at | TIMESTAMP | Sim |

---

## Hierarquia de itens (regra de negócio)

O sistema opera com três níveis hierárquicos. **Isso precisa estar no banco e nas rotas:**

- **Projeto** → pode conter uma ou mais tarefas. Pode existir sem tarefas.
- **Tarefa** → pode estar dentro de um projeto ou existir de forma independente. Pode conter uma ou mais subtarefas. Pode ser movida para dentro ou fora de um projeto.
- **Subtarefa** → pode estar dentro de uma tarefa ou existir de forma independente. Pode ser movida para dentro ou fora de uma tarefa.

Para implementar isso, a tabela `tasks` precisa de dois campos adicionais:
- `project_id` UUID (FK → projects, nullable) — null = tarefa independente
- `parent_task_id` UUID (FK → tasks, nullable) — null = tarefa raiz, preenchido = é subtarefa

Crie também a tabela `projects`:
| Campo | Tipo | Obrigatório |
|---|---|---|
| id | UUID | Sim |
| company_id | UUID (FK → companies) | Sim |
| created_by | UUID (FK → users) | Sim |
| name | VARCHAR(255) | Sim |
| description | TEXT | Não |
| created_at | TIMESTAMP | Sim |
| updated_at | TIMESTAMP | Sim |

---

## Rotas da API

### /api/auth
| Método | Rota | Recebe | Faz | Retorna |
|---|---|---|---|---|
| POST | /setup | name (empresa), name (admin), email, password | Verifica se já existe empresa. Se não existir, cria empresa e usuário admin. | { company, user, token } |
| POST | /login | email, password | Valida credenciais com bcrypt, gera JWT + refreshToken, salva refreshToken no banco. | { token, refreshToken, user } |
| POST | /logout | refreshToken no header | Invalida o refreshToken no banco. | { message: 'ok' } |
| POST | /refresh | refreshToken | Valida o refreshToken e gera novo JWT. | { token } |

### /api/users — todas exigem JWT. Rotas [admin] bloqueiam members com 403.
| Método | Rota | Acesso | Faz |
|---|---|---|---|
| GET | / | admin | Lista usuários da empresa com contagem de tarefas ativas por pessoa. |
| POST | / | admin | Cria funcionário. Recebe: name, email, password, role, position. |
| GET | /me | todos | Dados do usuário logado. |
| PUT | /me/password | todos | Altera própria senha. |
| GET | /:id | todos | Dados de um usuário específico. |
| PUT | /:id | admin | Atualiza name, position, role ou is_active. |
| DELETE | /:id | admin | Desativa (is_active = false). Nunca apaga do banco. |

### /api/projects — todas exigem JWT.
| Método | Rota | Acesso | Faz |
|---|---|---|---|
| GET | / | todos | Lista projetos da empresa. Admin vê todos, member vê os que tem tarefas atribuídas. |
| POST | / | admin | Cria projeto. Recebe: name, description. |
| GET | /:id | todos | Detalhes do projeto + tarefas vinculadas. |
| PUT | /:id | admin | Atualiza name ou description. |
| DELETE | /:id | admin | Remove projeto (não remove tarefas — elas ficam independentes). |

### /api/tasks — todas exigem JWT.
| Método | Rota | Acesso | Faz |
|---|---|---|---|
| GET | / | todos | Lista tarefas. Admin vê todas, member vê só as suas. Filtros: status, assigned_to, priority, due_date, project_id, parent_task_id. |
| POST | / | admin | Cria tarefa. Recebe: title, description, assigned_to, due_date, priority, project_id (opcional), parent_task_id (opcional). |
| GET | /:id | todos | Detalhes da tarefa + subtarefas filhas. |
| PUT | /:id | admin | Atualiza qualquer campo, incluindo mover project_id ou parent_task_id (pode ser null para desvincular). |
| PATCH | /:id/status | todos | Atualiza só o status. Member só atualiza tarefas atribuídas a ele. |
| DELETE | /:id | admin | Remove tarefa permanentemente. |
| GET | /overdue | todos | Tarefas com due_date < hoje e status != 'done'. |

### /api/dashboard — todas exigem JWT.
| Método | Rota | Retorna |
|---|---|---|
| GET | /summary | Total de tarefas por status (todo, in_progress, done, overdue) para a empresa. |
| GET | /by-user | Lista de usuários com contagem de tarefas por status para cada um. |

---

## Regras de negócio obrigatórias

**Atraso:**
- Tarefa com `due_date < hoje` e `status != 'done'` é considerada atrasada.
- O status `overdue` deve ser atualizado automaticamente — implemente um job que roda a cada hora verificando e atualizando tarefas vencidas. Use `node-cron` ou equivalente.
- Além do job, a rota GET /api/tasks/overdue retorna essas tarefas sob demanda.

**Alertas (lógica de notificação):**
- Quando uma tarefa vence (due_date = hoje), registrar o evento. Canal de envio ainda não definido — deixe a lógica de disparo isolada em um serviço `/src/services/notificationService.js` com a função `notifyOverdue(task)` vazia mas documentada, pronta para ser conectada a qualquer canal depois.
- Reincidência: a cada 7 dias enquanto a tarefa não for concluída, a função deve ser chamada novamente. Implemente o controle de reincidência no job.

**Permissões:**
- Admin vê e gerencia tudo dentro da empresa.
- Member vê apenas tarefas atribuídas a ele e pode atualizar apenas o status das suas tarefas.
- Nenhuma rota expõe dados de outras empresas — sempre filtrar por `company_id` extraído do JWT.

**Setup único:**
- A rota POST /api/auth/setup deve verificar se já existe alguma empresa cadastrada no banco. Se existir, retornar erro 409 com mensagem clara.

---

## Variáveis de ambiente (.env.example a ser criado)

```
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3001
```

---

## O que entregar

1. Projeto Node.js completo e funcional com todas as rotas listadas acima
2. `schema.prisma` com todas as tabelas e relacionamentos
3. Migration gerada via `prisma migrate dev`
4. Arquivo `.env.example` com todas as variáveis necessárias
5. `README.md` com instruções de instalação, configuração e como rodar localmente
6. `notificationService.js` criado e documentado mesmo que vazio
7. Job de atualização automática de status `overdue` funcionando

---

## O que NÃO construir

- Nenhuma interface visual
- Integração com Slack, e-mail ou qualquer canal externo de notificação
- Lógica de escala, filas ou cache
- Controle de acesso por departamento ou time (apenas admin/member)
- Migração de dados externos