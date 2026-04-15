# TaskPanel — Frontend

Painel de tarefas com Kanban, controle de acesso e integração com API REST.

---

## Estrutura do projeto

```
src/
├── pages/
│   ├── Login.jsx          # Tela de login
│   ├── Setup.jsx          # Configuração inicial (empresa + admin)
│   ├── Dashboard.jsx      # Painel Kanban principal
│   ├── Tasks.jsx          # Lista completa de tarefas
│   ├── Users.jsx          # Gestão de funcionários (admin)
│   └── Profile.jsx        # Perfil do usuário logado
├── components/
│   ├── UI.jsx             # Componentes reutilizáveis (Button, Input, Modal, Avatar...)
│   ├── Sidebar.jsx        # Menu lateral
│   └── Layout.jsx         # Wrapper com sidebar + topbar
├── services/
│   └── api.js             # Axios + todas as chamadas à API
├── store/
│   └── authStore.js       # Estado global com Zustand (usuário, token)
├── routes/
│   └── Guards.jsx         # PrivateRoute, AdminRoute, PublicRoute
├── App.jsx                # Rotas principais
└── index.js               # Entry point
```

---

## Instalação e execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variável de ambiente
```bash
cp .env.example .env
```
Edite o `.env` e defina a URL da sua API:
```
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Rodar em desenvolvimento
```bash
npm start
```
Acesse: `http://localhost:3000`

### 4. Build para produção
```bash
npm run build
```

---

## Como funciona sem a API (modo mock)

Todas as páginas possuem dados mock embutidos. Enquanto o backend não estiver pronto, o sistema funciona normalmente com dados de exemplo. As chamadas à API falham silenciosamente e os dados mock são exibidos.

Para ativar a integração real, basta ter o backend rodando na URL configurada no `.env`.

---

## Fluxo de autenticação

1. Usuário faz login → API retorna `{ token, user }`
2. Token salvo em memória via Zustand (`authStore`)
3. Axios injeta o token automaticamente em todas as requisições via interceptor
4. Se o token expirar (erro 401), o usuário é redirecionado para `/login`

---

## Rotas e permissões

| Rota         | Acesso         | Descrição                        |
|--------------|----------------|----------------------------------|
| `/login`     | Público        | Tela de login                    |
| `/setup`     | Público        | Configuração inicial da empresa  |
| `/dashboard` | Autenticado    | Kanban com resumo e filtros      |
| `/tasks`     | Autenticado    | Lista completa com filtros       |
| `/users`     | Admin apenas   | Cadastro e gestão de funcionários|
| `/profile`   | Autenticado    | Dados pessoais e senha           |

---

## Conectando ao backend

Todos os endpoints estão centralizados em `src/services/api.js`:

```js
// Autenticação
authAPI.login({ email, password })
authAPI.setup({ companyName, adminName, email, password })

// Tarefas
tasksAPI.list(params)         // GET /tasks?status=todo&assigned_to=id
tasksAPI.create(data)         // POST /tasks
tasksAPI.update(id, data)     // PUT /tasks/:id
tasksAPI.updateStatus(id, s)  // PATCH /tasks/:id/status
tasksAPI.remove(id)           // DELETE /tasks/:id

// Usuários
usersAPI.list()               // GET /users
usersAPI.create(data)         // POST /users
usersAPI.update(id, data)     // PUT /users/:id
usersAPI.deactivate(id)       // DELETE /users/:id
usersAPI.me()                 // GET /users/me

// Dashboard
dashboardAPI.summary()        // GET /dashboard/summary
dashboardAPI.byUser()         // GET /dashboard/by-user
```

---

## Dependências principais

| Pacote               | Versão   | Uso                              |
|----------------------|----------|----------------------------------|
| react                | ^18.2    | Interface                        |
| react-router-dom     | ^6.22    | Navegação entre telas            |
| axios                | ^1.6     | Chamadas HTTP                    |
| @tanstack/react-query| ^5.24    | Cache e sincronização de dados   |
| react-hook-form      | ^7.51    | Formulários com validação        |
| zustand              | ^4.5     | Estado global (auth)             |
