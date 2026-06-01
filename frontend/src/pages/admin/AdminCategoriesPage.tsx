import { useState, useEffect, useCallback } from 'react';
import {
  apiAdminGetCategories,
  apiAdminCreateCategory,
  apiAdminUpdateCategory,
  apiAdminDeleteCategory,
} from '../../api/adminApi';
import type { Category } from '../../types/menu';

type ModalMode = 'create' | 'edit' | null;

type CategoryForm = {
  category_id:   number | null;
  category_name: string;
  description:   string;
};

const EMPTY_FORM: CategoryForm = {
  category_id:   null,
  category_name: '',
  description:   '',
};

export function AdminCategoriesPage() {
  const [categories, setCategories]           = useState<Category[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');

  const [modalMode, setModalMode]             = useState<ModalMode>(null);
  const [editSelectedId, setEditSelectedId]   = useState('');
  const [form, setForm]                       = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting]           = useState(false);
  const [formError, setFormError]             = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  const loadCategories = useCallback(() => {
    setLoading(true);
    apiAdminGetCategories()
      .then(setCategories)
      .catch(() => setError('載入分類失敗'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditSelectedId('');
    setConfirmingDelete(false);
    setModalMode('create');
  };

  const openEditModal = () => {
    setForm(EMPTY_FORM);
    setEditSelectedId('');
    setFormError('');
    setConfirmingDelete(false);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditSelectedId('');
    setFormError('');
    setConfirmingDelete(false);
  };

  const handleEditSelectChange = (id: string) => {
    setEditSelectedId(id);
    setFormError('');
    setConfirmingDelete(false);
    if (!id) { setForm(EMPTY_FORM); return; }
    const cat = categories.find(c => c.category_id.toString() === id);
    if (cat) {
      setForm({
        category_id:   cat.category_id,
        category_name: cat.category_name,
        description:   cat.description,
      });
    }
  };

  const setField = (key: keyof CategoryForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.category_name.trim()) { setFormError('請輸入分類名稱'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      if (form.category_id === null) {
        await apiAdminCreateCategory({
          category_name: form.category_name.trim(),
          description:   form.description.trim(),
        });
      } else {
        await apiAdminUpdateCategory({
          category_id:   form.category_id,
          category_name: form.category_name.trim(),
          description:   form.description.trim(),
        });
      }
      closeModal();
      loadCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (form.category_id === null) return;
    setDeleting(true);
    setFormError('');
    try {
      await apiAdminDeleteCategory(form.category_id);
      closeModal();
      loadCategories();
    } catch (err) {
      setConfirmingDelete(false);
      setFormError(err instanceof Error ? err.message : '刪除失敗，請稍後再試');
    } finally {
      setDeleting(false);
    }
  };

  const formFields = (
    <>
      <div className="form-group">
        <label className="form-label">分類名稱</label>
        <input
          type="text"
          className="form-input"
          value={form.category_name}
          onChange={(e) => setField('category_name', e.target.value)}
          placeholder="輸入分類名稱"
        />
      </div>
      <div className="form-group">
        <label className="form-label">
          描述 <span className="form-hint">（選填）</span>
        </label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="輸入分類描述"
        />
      </div>
    </>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-menu-header-left">
          <h1>分類管理</h1>
          {!loading && (
            <span className="admin-menu-count">
              <span className="admin-menu-count-label">目前分類：</span>
              <span className="admin-menu-count-current">{categories.length}</span>
            </span>
          )}
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-admin-action btn-sm" onClick={openCreate}>
            ＋ 新增分類
          </button>
          <button className="btn btn-admin-action btn-sm" onClick={openEditModal}>
            ✎ 編輯分類
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><span>載入中...</span></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="admin-cat-col-name">分類名稱</th>
                <th className="admin-cat-col-count">餐點數量</th>
                <th className="admin-cat-col-desc">描述</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="admin-empty-cell">尚無分類</td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const count = cat.item_count ?? 0;
                  return (
                    <tr key={cat.category_id}>
                      <td className="admin-cat-name">{cat.category_name}</td>
                      <td className={count === 0 ? 'admin-cat-count admin-cat-count-zero' : 'admin-cat-count'}>
                        {count}
                      </td>
                      <td className="admin-cat-desc">{cat.description || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create modal ── */}
      {modalMode === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">新增分類</p>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              {formFields}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={closeModal} disabled={submitting}>
                取消
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {modalMode === 'edit' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">編輯分類</p>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}

              {confirmingDelete ? (
                <div className="admin-cat-delete-confirm">
                  <p className="admin-cat-delete-confirm-msg">
                    確定要刪除「{form.category_name}」嗎？
                  </p>
                  <p className="admin-cat-delete-confirm-sub">刪除後將無法復原。</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">選擇分類</label>
                    <select
                      className="form-select"
                      value={editSelectedId}
                      onChange={(e) => handleEditSelectChange(e.target.value)}
                    >
                      <option value="">請選擇要編輯的分類</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {editSelectedId ? formFields : (
                    <p className="admin-edit-hint">請先選擇要編輯的分類。</p>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              {confirmingDelete ? (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                  >
                    取消
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? '刪除中...' : '確認刪除'}
                  </button>
                </>
              ) : (
                <>
                  {editSelectedId && (
                    <button
                      className="btn btn-destructive-soft btn-sm admin-cat-footer-delete"
                      onClick={() => setConfirmingDelete(true)}
                      disabled={submitting}
                    >
                      刪除分類
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    取消
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmit}
                    disabled={submitting || !editSelectedId}
                  >
                    {submitting ? '儲存中...' : '儲存變更'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
