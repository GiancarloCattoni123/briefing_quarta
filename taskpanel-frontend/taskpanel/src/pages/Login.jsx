import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { Input, Btn } from '../components/UI';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await authAPI.login(data);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = (role) => {
    const users = {
      admin: { id: 'demo-admin', name: 'Rafael Gestor', email: 'admin@demo.com', role: 'admin', position: 'Gestor' },
      member: { id: 'demo-member', name: 'Ana Lima', email: 'ana@demo.com', role: 'member', position: 'Designer' },
    };
    login(users[role], 'demo-token');
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar esquerda */}
      <div style={{
        width: 420, minWidth: 420, background: 'var(--navy-800)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 40px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
            <div style={{ width: 34, height: 34, background: 'var(--blue-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>TaskPanel</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 500, color: '#fff', lineHeight: 1.3, marginBottom: 14 }}>Gerencie sua equipe com clareza</h2>
          <p style={{ fontSize: 14, color: 'var(--navy-200)', lineHeight: 1.7, marginBottom: 40 }}>
            Acompanhe tarefas, prazos e responsáveis em um painel visual e intuitivo.
          </p>
          {['Kanban por status em tempo real', 'Alertas automáticos de atraso', 'Controle por nível de acesso'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(30,95,165,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="var(--navy-200)" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--navy-200)' }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--navy-400)' }}>© {new Date().getFullYear()} TaskPanel. Todos os direitos reservados.</p>
      </div>

      {/* Formulário direita */}
      <div style={{ flex: 1, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)', padding: '40px 36px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-sm)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>Bem-vindo de volta</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 28 }}>Entre com suas credenciais para continuar</p>

          {apiError && (
            <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13, color: 'var(--red-600)', marginBottom: 20 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@empresa.com"
              error={errors.email?.message}
              {...register('email', { required: 'E-mail obrigatório' })}
            />
            <div style={{ marginBottom: 4 }}>
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', { required: 'Senha obrigatória' })}
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 22 }}>
              <a href="#!" style={{ fontSize: 12, color: 'var(--blue-500)' }}>Esqueceu a senha?</a>
            </div>
            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 42 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Btn>
          </form>

          {/* Modo demonstração */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>ou entre em modo demo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <button onClick={() => loginDemo('admin')} style={{
              padding: '10px 0', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
              fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: 16 }}>👤</span>
              <span>Admin</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>Acesso total</span>
            </button>
            <button onClick={() => loginDemo('member')} style={{
              padding: '10px 0', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
              fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: 16 }}>👥</span>
              <span>Membro</span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>Acesso limitado</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>primeiro acesso?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
          </div>

          <a href="/setup" style={{
            display: 'block', textAlign: 'center', padding: '10px',
            border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
            fontSize: 13, color: 'var(--gray-600)',
          }}>
            Configurar empresa <span style={{ color: 'var(--blue-500)', fontWeight: 500 }}>por aqui →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
