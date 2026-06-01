import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/menu', { replace: true });
    }
  }, [user, navigate]);

  const validate = (): string => {
    if (!name.trim())  return '請輸入姓名';
    if (!email.trim()) return '請輸入電子郵件';
    if (!password)     return '請輸入密碼';
    if (password.length < 6) return '密碼至少需要 6 個字元';
    if (password !== confirmPassword) return '兩次密碼輸入不一致';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-register">
        <div>
          <h1 className="auth-title">建立帳號</h1>
          <p className="auth-sub">加入 Smiling Brunch 開始訂餐</p>
        </div>

        {error   && <div className="auth-alert">{error}</div>}
        {success && <div className="auth-success">註冊成功！正在跳轉至登入頁面...</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">姓名</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="5" r="2.5"/>
                <path d="M2.5 14c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"/>
              </svg>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="輸入姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              手機號碼 <span className="form-hint">（選填）</span>
            </label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="1" width="8" height="14" rx="1.5"/>
                <line x1="7" y1="12.5" x2="9" y2="12.5"/>
              </svg>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                placeholder="至少 6 個字元"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">確認密碼</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="10" height="7" rx="1.5"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2"/>
              </svg>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading || success}
          >
            {loading ? '處理中...' : '建立帳號'}
          </button>
        </form>

        <p className="auth-footer">
          已有帳號？{' '}
          <Link to="/login">立即登入</Link>
        </p>
      </div>
    </div>
  );
}
