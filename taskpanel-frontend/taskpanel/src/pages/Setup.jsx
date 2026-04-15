import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { Input, Btn } from '../components/UI';

export default function Setup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await authAPI.setup({
        companyName: data.companyName,
        adminName: data.adminName,
        email: data.email,
        password: data.password,
      });
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao configurar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Empresa', 'Administrador', 'Confirmação'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'var(--navy-800)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--navy-800)' }}>TaskPanel</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 6 }}>Configuração inicial</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Configure sua empresa e crie a conta de administrador</p>
        </div>

        {/* Stepper visual */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>{i + 1}</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--gray-200)', margin: '0 8px' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)', padding: '32px 36px', boxShadow: 'var(--shadow-sm)' }}>
          {apiError && (
            <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13, color: 'var(--red-600)', marginBottom: 20 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--blue-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Dados da empresa</p>

            <Input
              label="Nome da empresa"
              placeholder="Ex: Acme Ltda"
              error={errors.companyName?.message}
              {...register('companyName', { required: 'Nome da empresa obrigatório' })}
            />

            <div style={{ height: 1, background: 'var(--gray-100)', margin: '8px 0 22px' }} />
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--blue-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Conta do administrador</p>

            <Input
              label="Seu nome completo"
              placeholder="João Silva"
              error={errors.adminName?.message}
              {...register('adminName', { required: 'Nome obrigatório' })}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="admin@empresa.com"
              error={errors.email?.message}
              {...register('email', { required: 'E-mail obrigatório' })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirmação obrigatória',
                  validate: v => v === watch('password') || 'As senhas não coincidem',
                })}
              />
            </div>

            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 42, marginTop: 8 }}>
              {loading ? 'Configurando...' : 'Criar conta e começar →'}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--gray-400)' }}>
          Já tem uma conta? <a href="/login" style={{ color: 'var(--blue-500)' }}>Fazer login</a>
        </p>
      </div>
    </div>
  );
}
