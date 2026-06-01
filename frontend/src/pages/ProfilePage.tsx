import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUpdateProfile } from '../api/authApi';

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())  { setError('姓名為必填欄位');       return; }
    if (!email.trim()) { setError('電子郵件為必填欄位'); return; }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await apiUpdateProfile({
        name:  name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      updateUser(updatedUser);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗，請稍後再試。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page profile-page">
      <div className="auth-card profile-card">
        <div>
          <h1 className="auth-title">個人資料</h1>
          <p className="auth-sub">管理您的會員資料</p>
        </div>

        {success && (
          <div className="auth-success profile-success">
            <strong>個人資料已更新</strong>
            <p>您的會員資料已成功儲存。</p>
          </div>
        )}

        {error && <div className="profile-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">姓名</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="5" r="3"/>
                <path d="M2 14a6 6 0 0 1 12 0"/>
              </svg>
              <input
                id="profile-name"
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
            <label className="form-label" htmlFor="profile-email">電子郵件</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="14" height="10" rx="1.5"/>
                <polyline points="1,3 8,9 15,3"/>
              </svg>
              <input
                id="profile-email"
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
            <label className="form-label" htmlFor="profile-phone">
              手機號碼
              <span className="form-hint">（選填）</span>
            </label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" width="16" height="16" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 1h2.5l1.5 3.5-1.5 1a8.5 8.5 0 0 0 4 4l1-1.5L15 9.5V12a1 1 0 0 1-1 1C5.163 13 1 8.837 1 4a1 1 0 0 1 1-1z"/>
              </svg>
              <input
                id="profile-phone"
                type="tel"
                className="form-input"
                placeholder="輸入手機號碼"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={saving}
          >
            {saving ? '儲存中…' : '儲存變更'}
          </button>
        </form>
      </div>
    </div>
  );
}
