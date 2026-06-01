import { useState, useEffect, useCallback } from 'react';
import {
  apiAdminGetUsers,
  apiAdminUpdateUserStatus,
  apiAdminCreateAdmin,
} from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import type { User, UserStatus } from '../../types/user';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', password_confirm: '' };

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]             = useState('');
  const [createdAdminName, setCreatedAdminName] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);
  const [confirming, setConfirming]       = useState(false);

  // Create admin modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm]           = useState(EMPTY_FORM);
  const [createError, setCreateError]         = useState('');
  const [creating, setCreating]               = useState(false);

  const loadUsers = useCallback(() => {
    setLoading(true);
    apiAdminGetUsers()
      .then(setUsers)
      .catch(() => setError('載入用戶失敗'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const adminUsers = users
    .filter(u => u.role === 'admin')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const customerUsers    = users.filter(u => u.role === 'customer');
  const activeAdminCount = adminUsers.filter(u => u.status === 'active').length;

  const isSelf = (user: User) => user.user_id === currentUser?.user_id;

  const canToggle = (user: User): boolean => {
    if (user.status === 'active') {
      if (isSelf(user)) return false;
      if (user.role === 'admin' && activeAdminCount <= 1) return false;
    }
    return true;
  };

  const getLockedReason = (user: User): string | undefined => {
    if (!canToggle(user) && user.status === 'active') {
      if (isSelf(user)) return '無法停用目前登入的帳號';
      if (user.role === 'admin') return '至少需要保留一位啟用中的管理員';
    }
    return undefined;
  };

  const handleStatusPillClick = (user: User) => {
    if (!canToggle(user)) return;
    setConfirmTarget(user);
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const newStatus: UserStatus = confirmTarget.status === 'active' ? 'inactive' : 'active';
    setConfirming(true);
    setError('');
    setCreatedAdminName('');
    try {
      await apiAdminUpdateUserStatus(confirmTarget.user_id, newStatus);
      setUsers(prev =>
        prev.map(u => u.user_id === confirmTarget.user_id ? { ...u, status: newStatus } : u)
      );
      setConfirmTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新狀態失敗');
      setConfirmTarget(null);
    } finally {
      setConfirming(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm(EMPTY_FORM);
    setCreateError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowCreateModal(false);
    setCreateForm(EMPTY_FORM);
    setCreateError('');
  };

  const handleCreateField =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCreateForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.name.trim())            { setCreateError('請輸入姓名'); return; }
    if (!createForm.email.trim())           { setCreateError('請輸入電子郵件'); return; }
    if (!createForm.password)              { setCreateError('請輸入初始密碼'); return; }
    if (createForm.password.length < 6)    { setCreateError('密碼至少需要 6 個字元'); return; }
    if (!createForm.password_confirm)      { setCreateError('請再次輸入密碼'); return; }
    if (createForm.password !== createForm.password_confirm) {
      setCreateError('兩次輸入的密碼不一致');
      return;
    }

    setCreating(true);
    try {
      await apiAdminCreateAdmin({
        name:             createForm.name.trim(),
        email:            createForm.email.trim(),
        phone:            createForm.phone.trim() || undefined,
        password:         createForm.password,
        password_confirm: createForm.password_confirm,
      });
      setShowCreateModal(false);
      setCreatedAdminName(createForm.name.trim());
      setCreateForm(EMPTY_FORM);
      setError('');
      loadUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '建立失敗，請重試');
    } finally {
      setCreating(false);
    }
  };

  const renderStatusPill = (user: User) => {
    const clickable  = canToggle(user);
    const isActive   = user.status === 'active';
    const lockedNote = getLockedReason(user);

    return (
      <span
        className={[
          'admin-user-status-pill',
          isActive ? 'admin-user-status-active' : 'admin-user-status-inactive',
          clickable ? 'admin-user-status-clickable' : 'admin-user-status-locked',
        ].join(' ')}
        onClick={clickable ? () => handleStatusPillClick(user) : undefined}
        title={lockedNote}
      >
        {isActive ? '啟用' : '停用'}
      </span>
    );
  };

  const renderTable = (tableUsers: User[], emptyText: string) => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>Email</th>
            <th>電話</th>
            <th>狀態</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          {tableUsers.length === 0 ? (
            <tr>
              <td colSpan={5} className="admin-empty-cell">{emptyText}</td>
            </tr>
          ) : (
            tableUsers.map(user => (
              <tr
                key={user.user_id}
                className={user.status === 'inactive' ? 'admin-user-row-inactive' : undefined}
              >
                <td>
                  <div className="admin-user-name-cell">
                    <span className="admin-user-name">{user.name}</span>
                    {isSelf(user) && (
                      <span className="admin-user-current-badge">目前帳號</span>
                    )}
                  </div>
                </td>
                <td className="admin-user-meta">{user.email}</td>
                <td className="admin-user-meta">{user.phone || '—'}</td>
                <td>{renderStatusPill(user)}</td>
                <td className="admin-user-meta">{formatDate(user.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Status confirm modal copy — role-aware
  const isActivating  = confirmTarget?.status === 'inactive';
  const isAdminTarget = confirmTarget?.role === 'admin';

  const modalTitle = isAdminTarget
    ? (isActivating ? '啟用管理員帳號' : '停用管理員帳號')
    : (isActivating ? '啟用帳號'       : '停用帳號');

  const confirmTitle = isAdminTarget
    ? isActivating
      ? `確定要啟用「${confirmTarget?.name}」的管理員帳號嗎？`
      : `確定要停用「${confirmTarget?.name}」的管理員帳號嗎？`
    : isActivating
      ? `確定要啟用「${confirmTarget?.name}」的帳號嗎？`
      : `確定要停用「${confirmTarget?.name}」的帳號嗎？`;

  const confirmBody = isAdminTarget
    ? isActivating
      ? '啟用後，此帳號將可重新登入後台管理系統。'
      : '停用後，此帳號將無法登入後台管理系統。'
    : isActivating
      ? '啟用後，此用戶將可正常登入。'
      : '停用後，此用戶將無法登入。';

  const confirmAction = isActivating ? '確認啟用' : '確認停用';

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-menu-header-left">
          <h1>用戶管理</h1>
          {!loading && (
            <>
              <span className="admin-menu-count">
                <span className="admin-menu-count-label">管理員帳號：</span>
                <span className="admin-menu-count-current">{adminUsers.length}</span>
              </span>
              <span className="admin-menu-count">
                <span className="admin-menu-count-label">一般使用者：</span>
                <span className="admin-menu-count-current">{customerUsers.length}</span>
              </span>
            </>
          )}
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-sm btn-admin-action" onClick={openCreateModal}>
            ＋ 新增管理員
          </button>
        </div>
      </div>

      {createdAdminName && (
        <div className="admin-create-success">
          <svg className="admin-create-success-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div className="admin-create-success-body">
            <p className="admin-create-success-title">管理員帳號建立成功</p>
            <p className="admin-create-success-desc">「{createdAdminName}」已加入管理員帳號，現在可以使用後台登入。</p>
          </div>
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><span>載入中...</span></div>
      ) : (
        <>
          <div className="admin-users-section">
            <p className="admin-users-section-title">管理員帳號</p>
            {renderTable(adminUsers, '尚無管理員帳號')}
          </div>

          <div className="admin-users-section">
            <p className="admin-users-section-title">一般使用者</p>
            {renderTable(customerUsers, '尚無一般使用者')}
          </div>
        </>
      )}

      {/* ── Create admin modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">新增管理員</p>
              <button className="modal-close" onClick={closeCreateModal} disabled={creating}>×</button>
            </div>
            <form onSubmit={handleCreateAdmin}>
              <div className="modal-body">
                {createError && <div className="alert alert-error">{createError}</div>}

                <div className="form-group">
                  <label className="form-label">姓名</label>
                  <input
                    className="form-input"
                    type="text"
                    value={createForm.name}
                    onChange={handleCreateField('name')}
                    placeholder="輸入姓名"
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">電子郵件</label>
                  <input
                    className="form-input"
                    type="email"
                    value={createForm.email}
                    onChange={handleCreateField('email')}
                    placeholder="輸入電子郵件"
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">手機號碼（選填）</label>
                  <input
                    className="form-input"
                    type="text"
                    value={createForm.phone}
                    onChange={handleCreateField('phone')}
                    placeholder="輸入手機號碼"
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">初始密碼</label>
                  <input
                    className="form-input"
                    type="password"
                    value={createForm.password}
                    onChange={handleCreateField('password')}
                    placeholder="至少 6 個字元"
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">確認密碼</label>
                  <input
                    className="form-input"
                    type="password"
                    value={createForm.password_confirm}
                    onChange={handleCreateField('password_confirm')}
                    placeholder="再次輸入密碼"
                    disabled={creating}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={creating}
                >
                  {creating ? '建立中...' : '建立管理員'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status confirmation modal ── */}
      {confirmTarget && (
        <div className="modal-overlay" onClick={() => { if (!confirming) setConfirmTarget(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">{modalTitle}</p>
              <button className="modal-close" onClick={() => setConfirmTarget(null)} disabled={confirming}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-user-confirm-block">
                <p className="admin-user-confirm-msg">{confirmTitle}</p>
                <p className="admin-user-confirm-sub">{confirmBody}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirmTarget(null)}
                disabled={confirming}
              >
                取消
              </button>
              <button
                className={`btn btn-sm ${isActivating ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? '處理中...' : confirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
