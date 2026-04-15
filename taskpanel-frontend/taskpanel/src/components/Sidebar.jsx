import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './UI';

const Icon = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 16px', borderRadius: 'var(--radius-md)',
    fontSize: 13, fontWeight: isActive ? 500 : 400,
    color: isActive ? '#fff' : 'var(--navy-200)',
    background: isActive ? 'rgba(30,95,165,.5)' : 'transparent',
    margin: '1px 8px', transition: 'background .12s, color .12s',
    textDecoration: 'none',
  });

  return (
    <aside style={{
      width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)',
      background: 'var(--navy-800)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '18px 20px 16px' }}>
        <div style={{ width: 32, height: 32, background: 'var(--blue-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".7"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>TaskPanel</span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '0 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 12, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--navy-400)', letterSpacing: '.08em', padding: '10px 20px 4px', textTransform: 'uppercase' }}>Menu</p>

        <NavLink to="/dashboard" style={navStyle}>
          <Icon d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
          Dashboard
        </NavLink>

        <NavLink to="/tasks" style={navStyle}>
          <Icon d="M2 4h12M2 8h8M2 12h10" />
          Tarefas
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/users" style={navStyle}>
            <Icon d="M8 7a3 3 0 100-6 3 3 0 000 6zM2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            Funcionários
          </NavLink>
        )}

        <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--navy-400)', letterSpacing: '.08em', padding: '14px 20px 4px', textTransform: 'uppercase' }}>Conta</p>

        <NavLink to="/profile" style={navStyle}>
          <Icon d="M8 8a3 3 0 100-6 3 3 0 000 6zM4 14a4 4 0 018 0" />
          Meu perfil
        </NavLink>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 16px', borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--navy-200)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          margin: '1px 8px', width: 'calc(100% - 16px)',
          transition: 'background .12s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
          Sair
        </button>
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name={user?.name || ''} size={30} />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--navy-100)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: 'var(--navy-400)' }}>{user?.role === 'admin' ? 'Administrador' : 'Membro'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
