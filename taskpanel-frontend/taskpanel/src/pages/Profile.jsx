import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Avatar, Input, Btn, Card } from '../components/UI';

export default function Profile() {
  const { user, login, token } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const { register: regInfo, handleSubmit: handleInfo, formState: { errors: errInfo } } = useForm({ defaultValues: { name: user?.name, position: user?.position } });
  const { register: regPass, handleSubmit: handlePass, watch, reset: resetPass, formState: { errors: errPass } } = useForm();

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const onSaveInfo = async (data) => {
    try {
      const res = await usersAPI.update(user?.id, data);
      login({ ...user, ...res.data }, token);
      showSuccess('Informações atualizadas!');
    } catch { setErrMsg('Erro ao salvar.'); }
  };

  const onChangePass = async (data) => {
    try {
      await usersAPI.updatePass({ password: data.newPass });
      resetPass();
      showSuccess('Senha alterada com sucesso!');
    } catch { setErrMsg('Senha atual incorreta.'); }
  };

  return (
    <Layout title="Meu perfil">
      <div style={{ maxWidth: 600 }}>

        {successMsg && (
          <div style={{ background: 'var(--green-50)', border: '1px solid #c8e6c9', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--green-600)', marginBottom: 20 }}>
            {successMsg}
          </div>
        )}
        {errMsg && (
          <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--red-600)', marginBottom: 20 }}>
            {errMsg}
          </div>
        )}

        {/* Avatar + info */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <Avatar name={user?.name || ''} size={56} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-800)' }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{user?.role === 'admin' ? 'Administrador' : 'Membro'} · {user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleInfo(onSaveInfo)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Nome completo" error={errInfo.name?.message} {...regInfo('name', { required: 'Obrigatório' })} />
              <Input label="Cargo" placeholder="Ex: Designer" {...regInfo('position')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn type="submit">Salvar informações</Btn>
            </div>
          </form>
        </Card>

        {/* Alterar senha */}
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 18 }}>Alterar senha</h2>
          <form onSubmit={handlePass(onChangePass)}>
            <Input label="Senha atual" type="password" placeholder="••••••••" error={errPass.current?.message} {...regPass('current', { required: 'Obrigatório' })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" error={errPass.newPass?.message}
                {...regPass('newPass', { required: 'Obrigatório', minLength: { value: 8, message: 'Mínimo 8' } })} />
              <Input label="Confirmar" type="password" placeholder="Repita a nova senha" error={errPass.confirm?.message}
                {...regPass('confirm', { validate: v => v === watch('newPass') || 'Não coincide' })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn type="submit">Alterar senha</Btn>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
