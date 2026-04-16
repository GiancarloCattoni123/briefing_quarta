import React from 'react';

// ── Badge de prioridade ────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = {
    high:   { label: 'Alta',   bg: 'var(--red-50)',   color: 'var(--red-600)' },
    medium: { label: 'Média',  bg: 'var(--amber-50)', color: 'var(--amber-600)' },
    low:    { label: 'Baixa',  bg: 'var(--green-50)', color: 'var(--green-600)' },
  };
  const s = map[priority] || map.low;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px',
      borderRadius: 20, background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

// ── Badge de status ────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    todo:        { label: 'A fazer',      bg: 'var(--gray-100)', color: 'var(--gray-600)' },
    in_progress: { label: 'Em andamento', bg: 'var(--blue-50)',  color: 'var(--blue-600)' },
    done:        { label: 'Concluído',    bg: 'var(--green-50)', color: 'var(--green-600)' },
    overdue:     { label: 'Atrasado',     bg: 'var(--red-50)',   color: 'var(--red-600)' },
  };
  const s = map[status] || map.todo;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px',
      borderRadius: 20, background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

// ── Avatar com iniciais ────────────────────────────────────────
const COLORS = ['#1e5fa5','#534ab7','#0f6e56','#993556','#854f0b','#3b6d11'];
export function Avatar({ name = '', size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 500, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

// ── Botão primário ─────────────────────────────────────────────
export function Btn({ children, onClick, type = 'button', variant = 'primary', disabled, style }) {
  const styles = {
    primary: { background: 'var(--blue-500)', color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: 'var(--gray-600)', border: '1px solid var(--gray-200)' },
    danger: { background: 'var(--red-400)', color: '#fff', border: 'none' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 38, padding: '0 18px', borderRadius: 'var(--radius-md)',
        fontSize: 13, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 6,
        ...styles[variant], ...style,
      }}
    >{children}</button>
  );
}

// ── Input ──────────────────────────────────────────────────────
export const Input = React.forwardRef(function Input({ label, error, ...props }, ref) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 5 }}>{label}</label>}
      <input
        ref={ref}
        style={{
          width: '100%', height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--red-400)' : 'var(--gray-200)'}`,
          fontSize: 13, color: 'var(--gray-800)', background: '#fff', outline: 'none',
          transition: 'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red-400)' : 'var(--gray-200)'}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red-400)', marginTop: 3, display: 'block' }}>{error}</span>}
    </div>
  );
});

// ── Select ─────────────────────────────────────────────────────
export const Select = React.forwardRef(function Select({ label, error, children, ...props }, ref) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 5 }}>{label}</label>}
      <select
        ref={ref}
        style={{
          width: '100%', height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--red-400)' : 'var(--gray-200)'}`,
          fontSize: 13, color: 'var(--gray-800)', background: '#fff', outline: 'none',
        }}
        {...props}
      >{children}</select>
      {error && <span style={{ fontSize: 11, color: 'var(--red-400)', marginTop: 3, display: 'block' }}>{error}</span>}
    </div>
  );
});

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,30,56,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 'var(--radius-xl)', padding: 28,
        width, maxWidth: '95vw', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-800)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-100)', padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)', ...style,
    }}>{children}</div>
  );
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 28, height: 28, border: '3px solid var(--gray-100)',
        borderTopColor: 'var(--blue-500)', borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
