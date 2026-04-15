require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Inicia os Crons
require('./src/jobs/overdueJob');

const app = express();

// Configuração de CORS para Conexão Frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight OPTIONS Global
app.options(/(.*)/, cors());

app.use(express.json());

// Importação das rotas
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const projectRoutes = require('./src/routes/projects');
const taskRoutes = require('./src/routes/tasks');
const dashboardRoutes = require('./src/routes/dashboard');

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Configuração das rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware de Tratamento Global de Erros (Stack traces omitidas)
app.use((err, req, res, next) => {
  console.error('[Global Error Info]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    code: err.code || 'INTERNAL_ERROR'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
