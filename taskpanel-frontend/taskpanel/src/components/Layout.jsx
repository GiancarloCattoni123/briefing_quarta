import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-h)', background: '#fff',
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{title}</h1>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
