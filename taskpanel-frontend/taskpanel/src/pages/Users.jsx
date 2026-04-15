import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout';
import { Avatar, Modal, Input, Select, Btn, Spinner } from '../components/UI';
import { useForm } from 'react-hook-form';

const MOCK_USERS = [
  { id: 'u1', name: 'Ana Lima',    email: 'ana@empresa.com',   role: 'member', position: 'Designer',          is_active: true,  taskCount: 4 },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@empresa.com', role: 'member', position: 'Desenvolvedor',     is_active: true,  taskCount: 5 },
  { id: 'u3', name: 'Carla Melo',  email: 'carla@empresa.com', role: 'admin',  position: 'Gestora de Projetos',is_active: true,  taskCount: 3 },
  { id: 'u4', name: 'Diego Rocha', email: 'diego@empresa.com', role: 'member', position: 'Analista',          is_active: false, taskCount: 0 },
];

function UserForm({ user, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: user || {} });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => { setLoading(true); await onSave(data); setLoading(false); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Nome completo" placeholder="João Silva" error={errors.name?.message} {...register('name', { required: 'Obrigatório' })} />
        <Input label="Cargo" placeholder="Ex: Designer" {...register('position')} />
      </div>
      <Input label="E-mail" type="email" placeholder="joao@empresa.com" error={errors.email?.message} {...register('email', { required: 'Obrigatório' })} />
      {!user && (
        <Input label="Senha provisória" type="password" placeholder="Mínimo 8 caracteres" error={errors.password?.message}
          {...register('password', { required: 'Obrigatório', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
      )}
      <Select label="Nível de acesso" {...register('role')}>
        <option value="member">Membro</option>
        <option value="admin">Administrador</option>
      </Select>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn type="submit" disabled={loading}>{loading ? 'Salvando...' : user ? 'Salvar' : 'Cadastrar'}</Btn>
      </div>
    </form>
  );
}

export default function Users() {
  const qc = useQueryClient();
  const [modalUser, setModalUser] = useState(null);
  const [deactivateId, setDeactivateId] = useState(null);

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersAPI.list().then(r => r.data), placeholderData: MOCK_USERS });

  const createMut = useMutation({ mutationFn: usersAPI.create, onSuccess: () => { qc.invalidateQueries(['users']); setModalUser(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => usersAPI.update(id, data), onSuccess: () => { qc.invalidateQueries(['users']); setModalUser(null); } });
  const deactivateMut = useMutation({ mutationFn: usersAPI.deactivate, onSuccess: () => { qc.invalidateQueries(['users']); setDeactivateId(null); } });

  const isNew = modalUser === 'new';

  return (
    <Layout title="Funcionários">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Btn onClick={() => setModalUser('new')}><span style={{ fontSize: 16 }}>+</span> Novo funcionário</Btn>
      </div>

      {isLoading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {(users || MOCK_USERS).map(u => (
            <div key={u.id} style={{
              background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)',
              padding: '20px', boxShadow: 'var(--shadow-sm)',
              opacity: u.is_active ? 1 : 0.55,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Avatar name={u.name} size={40} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.position || '—'}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                  background: u.role === 'admin' ? 'var(--blue-50)' : 'var(--gray-100)',
                  color: u.role === 'admin' ? 'var(--blue-600)' : 'var(--gray-600)',
                }}>
                  {u.role === 'admin' ? 'Admin' : 'Membro'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 14 }}>{u.email}</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                  <b style={{ color: 'var(--gray-700)' }}>{u.taskCount ?? 0}</b> tarefas ativas
                </span>
                {u.is_active ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModalUser(u)} style={{ fontSize: 11, color: 'var(--blue-500)', background: 'var(--blue-50)', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 5 }}>Editar</button>
                    <button onClick={() => setDeactivateId(u.id)} style={{ fontSize: 11, color: 'var(--red-600)', background: 'var(--red-50)', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 5 }}>Desativar</button>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontStyle: 'italic' }}>Inativo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modalUser} onClose={() => setModalUser(null)} title={isNew ? 'Novo funcionário' : 'Editar funcionário'}>
        {modalUser && (
          <UserForm
            user={isNew ? null : modalUser}
            onClose={() => setModalUser(null)}
            onSave={(data) => isNew
              ? createMut.mutateAsync(data)
              : updateMut.mutateAsync({ id: modalUser.id, data })
            }
          />
        )}
      </Modal>

      <Modal open={!!deactivateId} onClose={() => setDeactivateId(null)} title="Desativar funcionário" width={380}>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>O funcionário não conseguirá mais fazer login. As tarefas dele permanecem no sistema.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="secondary" onClick={() => setDeactivateId(null)}>Cancelar</Btn>
          <Btn variant="danger" onClick={() => deactivateMut.mutate(deactivateId)} disabled={deactivateMut.isPending}>
            {deactivateMut.isPending ? 'Desativando...' : 'Sim, desativar'}
          </Btn>
        </div>
      </Modal>
    </Layout>
  );
}
