import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI, tasksAPI, usersAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Avatar, PriorityBadge, Modal, Input, Select, Btn, Spinner } from '../components/UI';
import { useForm } from 'react-hook-form';

// ── Dados mock (usados enquanto API não está conectada) ─────────
const MOCK_SUMMARY = { todo: 4, in_progress: 3, done: 12, overdue: 2 };
const MOCK_TASKS = [
  { id: '1', title: 'Revisar proposta comercial', assignedUser: { name: 'Ana Lima' }, priority: 'high',   status: 'todo',        due_date: '2025-04-18' },
  { id: '2', title: 'Atualizar documentação da API', assignedUser: { name: 'Bruno Costa' }, priority: 'medium', status: 'todo',        due_date: '2025-04-20' },
  { id: '3', title: 'Criar relatório mensal', assignedUser: { name: 'Carla Melo' }, priority: 'low',    status: 'todo',        due_date: '2025-04-25' },
  { id: '4', title: 'Desenvolver módulo de relatórios', assignedUser: { name: 'Bruno Costa' }, priority: 'high',   status: 'in_progress', due_date: '2025-04-17' },
  { id: '5', title: 'Reunião de alinhamento design', assignedUser: { name: 'Ana Lima' }, priority: 'medium', status: 'in_progress', due_date: '2025-04-16' },
  { id: '6', title: 'Onboarding novo funcionário', assignedUser: { name: 'Carla Melo' }, priority: 'low',    status: 'in_progress', due_date: '2025-04-19' },
  { id: '7', title: 'Configurar ambiente de staging', assignedUser: { name: 'Bruno Costa' }, priority: 'high',   status: 'done',        due_date: '2025-04-12' },
  { id: '8', title: 'Levantamento de requisitos Q2', assignedUser: { name: 'Ana Lima' }, priority: 'medium', status: 'done',        due_date: '2025-04-10' },
  { id: '9', title: 'Enviar contrato para assinatura', assignedUser: { name: 'Carla Melo' }, priority: 'high',   status: 'overdue',     due_date: '2025-04-12' },
  { id: '10', title: 'Publicar atualização no servidor', assignedUser: { name: 'Bruno Costa' }, priority: 'high',   status: 'overdue',     due_date: '2025-04-13' },
];
const MOCK_USERS = [
  { id: 'u1', name: 'Ana Lima' }, { id: 'u2', name: 'Bruno Costa' }, { id: 'u3', name: 'Carla Melo' },
];

const COLS = [
  { key: 'todo',        label: 'A fazer',       pip: '#888780' },
  { key: 'in_progress', label: 'Em andamento',  pip: 'var(--blue-500)' },
  { key: 'done',        label: 'Concluído',     pip: 'var(--green-400)' },
  { key: 'overdue',     label: 'Atrasado',      pip: 'var(--red-400)' },
];

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ── Modal Nova Tarefa ──────────────────────────────────────────
function TaskModal({ open, onClose, users }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => { qc.invalidateQueries(['tasks']); qc.invalidateQueries(['dashboard']); reset(); onClose(); },
  });

  const onSubmit = (data) => mut.mutate(data);

  return (
    <Modal open={open} onClose={onClose} title="Nova tarefa">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Título" placeholder="Ex: Revisar proposta" error={errors.title?.message} {...register('title', { required: 'Obrigatório' })} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 5 }}>Descrição</label>
          <textarea rows={3} placeholder="Detalhes da tarefa..." style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 13, resize: 'vertical', fontFamily: 'var(--font)' }} {...register('description')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select label="Responsável" error={errors.assigned_to?.message} {...register('assigned_to', { required: 'Obrigatório' })}>
            <option value="">Selecionar...</option>
            {(users || MOCK_USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Select label="Prioridade" {...register('priority')}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </Select>
        </div>
        <Input label="Prazo" type="date" error={errors.due_date?.message} {...register('due_date', { required: 'Obrigatório' })} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn type="submit" disabled={mut.isPending}>{mut.isPending ? 'Salvando...' : 'Criar tarefa'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

// ── Card de Tarefa ─────────────────────────────────────────────
function KanbanCard({ task }) {
  const isOverdue = task.status === 'overdue';
  const isDone = task.status === 'done';
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--gray-100)',
      borderLeft: isOverdue ? '3px solid var(--red-400)' : '1px solid var(--gray-100)',
      padding: 13, cursor: 'pointer', transition: 'box-shadow .15s',
      opacity: isDone ? 0.72 : 1,
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-800)', lineHeight: 1.45, marginBottom: 9, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--gray-400)' }}>
        {task.title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={task.assignedUser?.name || ''} size={20} />
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{task.assignedUser?.name?.split(' ')[0]}</span>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      <p style={{ fontSize: 10, color: isOverdue ? 'var(--red-600)' : 'var(--gray-400)' }}>
        {isOverdue ? `Venceu: ${formatDate(task.due_date)}` : isDone ? `Entregue: ${formatDate(task.due_date)}` : `Prazo: ${formatDate(task.due_date)}`}
      </p>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────
export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterUser, setFilterUser] = useState('');
  const user = useAuthStore(s => s.user);

  const { data: summary } = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: () => dashboardAPI.summary().then(r => r.data), placeholderData: MOCK_SUMMARY });
  const { data: tasks, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => tasksAPI.list().then(r => r.data), placeholderData: MOCK_TASKS });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => usersAPI.list().then(r => r.data), placeholderData: MOCK_USERS });

  const filtered = (tasks || MOCK_TASKS).filter(t => !filterUser || t.assignedUser?.name === filterUser);
  const total = (summary?.todo || 0) + (summary?.in_progress || 0) + (summary?.done || 0) + (summary?.overdue || 0);
  const pct = total > 0 ? Math.round(((summary?.done || 0) / total) * 100) : 0;

  const summaryCards = [
    { key: 'todo',        label: 'A fazer',      value: summary?.todo || 0,        color: 'var(--gray-600)' },
    { key: 'in_progress', label: 'Em andamento', value: summary?.in_progress || 0, color: 'var(--blue-500)' },
    { key: 'done',        label: 'Concluídas',   value: summary?.done || 0,        color: 'var(--green-400)' },
    { key: 'overdue',     label: 'Atrasadas',    value: summary?.overdue || 0,     color: 'var(--red-400)' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Topbar actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            style={{ height: 34, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 12, color: 'var(--gray-600)', background: '#fff' }}
          >
            <option value="">Toda a equipe</option>
            {(users || MOCK_USERS).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        {user?.role === 'admin' && (
          <Btn onClick={() => setModalOpen(true)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nova tarefa
          </Btn>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.6fr', gap: 12, marginBottom: 24 }}>
        {summaryCards.map(c => (
          <div key={c.key} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: 24, fontWeight: 600, color: c.color, lineHeight: 1 }}>{c.value}</p>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              {c.label}
            </p>
          </div>
        ))}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Progresso geral</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{pct}%</span>
          </div>
          <div style={{ height: 7, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--blue-500)', borderRadius: 4, transition: 'width .6s ease' }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      {isLoading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'start' }}>
          {COLS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.key);
            return (
              <div key={col.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.pip, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 8px', borderRadius: 20 }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(t => <KanbanCard key={t.id} task={t} />)}
                  {colTasks.length === 0 && (
                    <div style={{ border: '1.5px dashed var(--gray-200)', borderRadius: 'var(--radius-md)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--gray-400)' }}>
                      Sem tarefas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} users={users} />
    </Layout>
  );
}
