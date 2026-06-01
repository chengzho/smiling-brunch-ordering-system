import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, login, authNotice, clearAuthNotice } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/menu', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');
    clearAuthNotice();

    try {
      await login(email.trim(), password);
      // redirect handled by the useEffect above
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-login">
        <div>
          <h1 className="auth-title">登入帳號</h1>
          <p className="auth-sub">歡迎回來 Smiling Brunch</p>
        </div>

        {authNotice && (
          <div className="auth-disabled-notice">
            <p className="auth-disabled-notice-title">{authNotice.title}</p>
            <p className="auth-disabled-notice-desc">{authNotice.description}</p>
          </div>
        )}

        {error && <div className="auth-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">電子郵件</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="14" height="10" rx="1.5"/>
                <polyline points="1,3 8,9 15,3"/>
              </svg>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="輸入電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">密碼</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="10" height="7" rx="1.5"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2"/>
              </svg>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <p className="auth-footer">
          還沒有帳號？{' '}
          <Link to="/register">立即註冊</Link>
        </p>
      </div>
    </div>
  );
}
