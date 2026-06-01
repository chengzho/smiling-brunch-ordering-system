import { useState, useEffect, useCallback } from 'react';
import {
  apiAdminGetMenuItems,
  apiAdminCreateMenuItem,
  apiAdminUpdateMenuItem,
  apiAdminSetMenuItemUnavailable,
} from '../../api/menuApi';
import { apiGetCategories } from '../../api/menuApi';
import { formatCurrency } from '../../utils/formatCurrency';
import type { MenuItem, Category } from '../../types/menu';

type MenuForm = {
  item_id: number | null;
  category_id: string;
  item_name: string;
  description: string;
  price: string;
  image_url: string;
  is_available: string;
};

const EMPTY_FORM: MenuForm = {
  item_id: null,
  category_id: '',
  item_name: '',
  description: '',
  price: '',
  image_url: '',
  is_available: '1',
};

export function AdminMenuPage() {
  const [items, setItems]           = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [modalMode, setModalMode]           = useState<'create' | 'edit' | null>(null);
  const [editSelectedId, setEditSelectedId] = useState('');
  const [form, setForm]                     = useState<MenuForm>(EMPTY_FORM);
  const [submitting, setSubmitting]         = useState(false);
  const [formError, setFormError]           = useState('');
  const [updating, setUpdating]             = useState<number | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([apiAdminGetMenuItems(), apiGetCategories()])
      .then(([menuItems, cats]) => {
        setItems(menuItems);
        setCategories(cats);
      })
      .catch(() => setError('載入資料失敗'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.category_id.toString() ?? '' });
    setFormError('');
    setEditSelectedId('');
    setModalMode('create');
  };

  const openEditModal = () => {
    setForm(EMPTY_FORM);
    setEditSelectedId('');
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditSelectedId('');
    setFormError('');
  };

  const handleEditSelectChange = (id: string) => {
    setEditSelectedId(id);
    setFormError('');
    if (!id) { setForm(EMPTY_FORM); return; }
    const item = items.find(i => i.item_id.toString() === id);
    if (item) {
      setForm({
        item_id:      item.item_id,
        category_id:  item.category_id.toString(),
        item_name:    item.item_name,
        description:  item.description,
        price:        item.price.toString(),
        image_url:    item.image_url,
        is_available: item.is_available.toString(),
      });
    }
  };

  const setField = (key: keyof MenuForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const price = parseFloat(form.price);
    if (!form.item_name.trim())     { setFormError('請輸入餐點名稱'); return; }
    if (!form.category_id)          { setFormError('請選擇分類'); return; }
    if (isNaN(price) || price <= 0) { setFormError('請輸入有效價格'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      if (form.item_id === null) {
        await apiAdminCreateMenuItem({
          category_id: Number(form.category_id),
          item_name:   form.item_name.trim(),
          description: form.description.trim(),
          price,
          image_url:   form.image_url.trim(),
        });
      } else {
        await apiAdminUpdateMenuItem({
          item_id:      form.item_id,
          category_id:  Number(form.category_id),
          item_name:    form.item_name.trim(),
          description:  form.description.trim(),
          price,
          image_url:    form.image_url.trim(),
          is_available: Number(form.is_available),
        });
      }
      closeModal();
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newAvailable = item.is_available === 1 ? 0 : 1;
    setUpdating(item.item_id);
    setError('');
    try {
      if (newAvailable === 0) {
        await apiAdminSetMenuItemUnavailable(item.item_id);
      } else {
        await apiAdminUpdateMenuItem({
          item_id:      item.item_id,
          category_id:  item.category_id,
          item_name:    item.item_name,
          description:  item.description,
          price:        item.price,
          image_url:    item.image_url,
          is_available: 1,
        });
      }
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗');
    } finally {
      setUpdating(null);
    }
  };

  const availableCount = items.filter(i => i.is_available === 1).length;

  const formFields = (
    <>
      <div className="form-group">
        <label className="form-label">餐點名稱</label>
        <input
          type="text" className="form-input" value={form.item_name}
          onChange={(e) => setField('item_name', e.target.value)} placeholder="輸入餐點名稱"
        />
      </div>
      <div className="form-group">
        <label className="form-label">分類</label>
        <select className="form-select" value={form.category_id}
          onChange={(e) => setField('category_id', e.target.value)}>
          <option value="">請選擇分類</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">描述</label>
        <textarea className="form-textarea" value={form.description}
          onChange={(e) => setField('description', e.target.value)} placeholder="輸入餐點描述" />
      </div>
      <div className="form-group">
        <label className="form-label">價格（NT$）</label>
        <input
          type="number" className="form-input" value={form.price}
          onChange={(e) => setField('price', e.target.value)} placeholder="0" min="0" step="1"
        />
      </div>
      <div className="form-group">
        <label className="form-label">
          圖片 URL <span className="form-hint">（選填）</span>
        </label>
        <input
          type="text" className="form-input" value={form.image_url}
          onChange={(e) => setField('image_url', e.target.value)} placeholder="https://..."
        />
      </div>
    </>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-menu-header-left">
          <h1>菜單管理</h1>
          {!loading && (
            <span className="admin-menu-count">
              <span className="admin-menu-count-label">可供應餐點：</span>
              <span className="admin-menu-count-current">{availableCount}</span>
              <span className="admin-menu-count-total"> / {items.length}</span>
            </span>
          )}
          <div className="admin-status-legend">
            <span className="admin-status-legend-item">
              <span className="admin-status-legend-dot admin-status-legend-available" />
              上架
            </span>
            <span className="admin-status-legend-item">
              <span className="admin-status-legend-dot admin-status-legend-unavailable" />
              下架
            </span>
          </div>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-admin-action btn-sm" onClick={openCreate}>
            ＋ 新增餐點
          </button>
          <button className="btn btn-admin-action btn-sm" onClick={openEditModal}>
            ✎ 編輯餐點
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
                <th>餐點名稱</th>
                <th>狀態</th>
                <th>分類</th>
                <th>價格</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">尚無餐點</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.item_id} className={item.is_available === 0 ? 'admin-menu-row-unavailable' : undefined}>
                    <td>
                      <div className="admin-menu-item-name">
                        <span className="admin-menu-item-title">{item.item_name}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`admin-status-dot ${item.is_available === 1 ? 'admin-status-dot-available' : 'admin-status-dot-unavailable'}`}
                        disabled={updating === item.item_id}
                        title={item.is_available === 1 ? '目前上架，點擊切換為下架' : '目前下架，點擊切換為上架'}
                        aria-label={item.is_available === 1 ? '目前上架，點擊切換為下架' : '目前下架，點擊切換為上架'}
                        onClick={() => handleToggleAvailability(item)}
                      />
                    </td>
                    <td>{item.category_name ?? '—'}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>
                      {item.description
                        ? <span className="admin-menu-description" title={item.description}>{item.description}</span>
                        : <span className="admin-menu-description-empty">—</span>
                      }
                    </td>
                  </tr>
                ))
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
              <p className="modal-title">新增餐點</p>
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
              <p className="modal-title">編輯餐點</p>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label className="form-label">選擇餐點</label>
                <select className="form-select" value={editSelectedId}
                  onChange={(e) => handleEditSelectChange(e.target.value)}>
                  <option value="">請選擇要編輯的餐點</option>
                  {items.map((item) => (
                    <option key={item.item_id} value={item.item_id}>{item.item_name}</option>
                  ))}
                </select>
              </div>
              {editSelectedId ? (
                <>
                  {formFields}
                  <div className="form-group">
                    <label className="form-label">狀態</label>
                    <select className="form-select" value={form.is_available}
                      onChange={(e) => setField('is_available', e.target.value)}>
                      <option value="1">上架</option>
                      <option value="0">下架</option>
                    </select>
                  </div>
                </>
              ) : (
                <p className="admin-edit-hint">請先選擇要編輯的餐點。</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={closeModal} disabled={submitting}>
                取消
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit}
                disabled={submitting || !editSelectedId}>
                {submitting ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
