import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, usersAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Avatar, PriorityBadge, StatusBadge, Modal, Input, Select, Btn, Spinner } from '../components/UI';
import { useForm } from 'react-hook-form';

const MOCK_TASKS = [
  { id: '1', title: 'Revisar proposta comercial', description: 'Revisar e ajustar valores conforme briefing', assignedUser: { name: 'Ana Lima' }, priority: 'high',   status: 'todo',        due_date: '2025-04-18' },
  { id: '2', title: 'Atualizar documentação da API', description: '', assignedUser: { name: 'Bruno Costa' }, priority: 'medium', status: 'todo',        due_date: '2025-04-20' },
  { id: '3', title: 'Criar relatório mensal', description: '', assignedUser: { name: 'Carla Melo' }, priority: 'low',    status: 'todo',        due_date: '2025-04-25' },
  { id: '4', title: 'Desenvolver módulo de relatórios', description: '', assignedUser: { name: 'Bruno Costa' }, priority: 'high',   status: 'in_progress', due_date: '2025-04-17' },
  { id: '5', title: 'Reunião de alinhamento design', description: '', assignedUser: { name: 'Ana Lima' }, priority: 'medium', status: 'in_progress', due_date: '2025-04-16' },
  { id: '6', title: 'Onboarding novo funcionário', description: '', assignedUser: { name: 'Carla Melo' }, priority: 'low',    status: 'in_progress', due_date: '2025-04-19' },
  { id: '7', title: 'Configurar ambiente de staging', description: '', assignedUser: { name: 'Bruno Costa' }, priority: 'high',   status: 'done',        due_date: '2025-04-12' },
  { id: '9', title: 'Enviar contrato para assinatura', description: '', assignedUser: { name: 'Carla Melo' }, priority: 'high',   status: 'overdue',     due_date: '2025-04-12' },
];
const MOCK_USERS = [{ id: 'u1', name: 'Ana Lima' }, { id: 'u2', name: 'Bruno Costa' }, { id: 'u3', name: 'Carla Melo' }];

function TaskForm({ task, users, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task ? { ...task, assigned_to: task.assignedUser?.id } : {},
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => { setLoading(true); await onSave(data); setLoading(false); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Título" placeholder="Título da tarefa" error={errors.title?.message} {...register('title', { required: 'Obrigatório' })} />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 5 }}>Descrição</label>
        <textarea rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 13, resize: 'vertical', fontFamily: 'var(--font)' }} {...register('description')} />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Select label="Status" {...register('status')}>
          <option value="todo">A fazer</option>
          <option value="in_progress">Em andamento</option>
          <option value="done">Concluído</option>
        </Select>
        <Input label="Prazo" type="date" error={errors.due_date?.message} {...register('due_date', { required: 'Obrigatório' })} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn type="submit" disabled={loading}>{loading ? 'Salvando...' : task ? 'Salvar alterações' : 'Criar tarefa'}</Btn>
      </div>
    </form>
  );
}

export default function Tasks() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [modalTask, setModalTask] = useState(null); // null=closed, 'new', or task obj
  const [deleteId, setDeleteId] = useState(null);

  const { data: tasks, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => tasksAPI.list().then(r => r.data), placeholderData: MOCK_TASKS });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => usersAPI.list().then(r => r.data), placeholderData: MOCK_USERS });

  const createMut = useMutation({ mutationFn: tasksAPI.create, onSuccess: () => { qc.invalidateQueries(['tasks']); setModalTask(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => tasksAPI.update(id, data), onSuccess: () => { qc.invalidateQueries(['tasks']); setModalTask(null); } });
  const deleteMut = useMutation({ mutationFn: tasksAPI.remove, onSuccess: () => { qc.invalidateQueries(['tasks']); setDeleteId(null); } });

  const isNew = modalTask === 'new';

  const filtered = (tasks || MOCK_TASKS).filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchUser = !filterUser || t.assignedUser?.name === filterUser;
    return matchSearch && matchStatus && matchUser;
  });

  return (
    <Layout title="Tarefas">
      {/* Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            placeholder="Buscar tarefa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: 34, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 12, width: 200 }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 34, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 12, background: '#fff' }}>
            <option value="">Todos os status</option>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluído</option>
            <option value="overdue">Atrasado</option>
          </select>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ height: 34, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: 12, background: '#fff' }}>
            <option value="">Todos os membros</option>
            {(users || MOCK_USERS).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        {user?.role === 'admin' && <Btn onClick={() => setModalTask('new')}><span style={{ fontSize: 16 }}>+</span> Nova tarefa</Btn>}
      </div>

      {/* Tabela */}
      {isLoading ? <Spinner /> : (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                {['Tarefa', 'Responsável', 'Prioridade', 'Status', 'Prazo', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', maxWidth: 280 }}>
                    <p style={{ marginBottom: 2 }}>{t.title}</p>
                    {t.description && <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 400 }}>{t.description}</p>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Avatar name={t.assignedUser?.name || ''} size={24} />
                      <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{t.assignedUser?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><PriorityBadge priority={t.priority} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: t.status === 'overdue' ? 'var(--red-600)' : 'var(--gray-400)' }}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  {user?.role === 'admin' && (
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setModalTask(t)} style={{ fontSize: 11, color: 'var(--blue-500)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 5, background: 'var(--blue-50)' }}>Editar</button>
                        <button onClick={() => setDeleteId(t.id)} style={{ fontSize: 11, color: 'var(--red-600)', background: 'var(--red-50)', border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 5 }}>Excluir</button>
                      </div>
                    </td>
                  )}
                  {user?.role !== 'admin' && <td />}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Nenhuma tarefa encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal open={!!modalTask} onClose={() => setModalTask(null)} title={isNew ? 'Nova tarefa' : 'Editar tarefa'}>
        {modalTask && (
          <TaskForm
            task={isNew ? null : modalTask}
            users={users}
            onClose={() => setModalTask(null)}
            onSave={(data) => isNew
              ? createMut.mutateAsync(data)
              : updateMut.mutateAsync({ id: modalTask.id, data })
            }
          />
        )}
      </Modal>

      {/* Modal confirmar exclusão */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir tarefa" width={380}>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>Tem certeza? Esta ação não pode ser desfeita.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Btn>
          <Btn variant="danger" onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? 'Excluindo...' : 'Sim, excluir'}
          </Btn>
        </div>
      </Modal>
    </Layout>
  );
}
