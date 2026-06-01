import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const avatarLetter = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <img
          src="/images/logo-mark.png"
          alt=""
          className="navbar-logo"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="navbar-brand-label">Smiling Brunch</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          首頁
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          菜單
        </NavLink>
        {user && (
          <>
            <NavLink to="/cart" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              <svg className="navbar-cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="navbar-link-label">購物車</span>
              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount}</span>
              )}
            </NavLink>
            <NavLink to="/orders" end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              <svg className="navbar-cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span className="navbar-link-label">我的訂單</span>
            </NavLink>
          </>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            後台管理
          </NavLink>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <div className="navbar-user-menu" ref={menuRef}>
            <button
              className="navbar-user-trigger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="navbar-user-avatar">{avatarLetter}</span>
              <span className="navbar-user">{user.name}</span>
              <span className="navbar-user-caret">▾</span>
            </button>

            {menuOpen && (
              <div className="navbar-user-dropdown" role="menu">
                <Link
                  to="/profile"
                  className="navbar-user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  個人資料
                </Link>
                <Link
                  to="/orders/history"
                  className="navbar-user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  訂單紀錄
                </Link>
                <button
                  className="navbar-user-dropdown-item navbar-user-dropdown-logout"
                  onClick={handleLogout}
                >
                  登出
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="navbar-action-link">
              登入
            </NavLink>
            <NavLink to="/register" className="navbar-action-link navbar-action-link-accent">
              註冊
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
