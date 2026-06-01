import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',            label: '儀表板',  end: true },
  { to: '/admin/orders',     label: '訂單管理', end: false },
  { to: '/admin/menu',       label: '菜單管理', end: false },
  { to: '/admin/categories', label: '分類管理', end: false },
  { to: '/admin/users',      label: '用戶管理', end: false },
];

function AdminIcon() {
  return (
    <svg className="sidebar-footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="sidebar-footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Smiling Brunch</div>
        <div className="sidebar-brand-sub">後台管理</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-admin-row">
            <AdminIcon />
            <span className="sidebar-admin-label">{user.name}</span>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          登出
        </button>
      </div>
    </aside>
  );
}
