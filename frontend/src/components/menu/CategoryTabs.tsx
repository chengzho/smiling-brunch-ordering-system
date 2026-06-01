import type { Category } from '../../types/menu';

type CategoryTabsProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="category-tabs">
      <button
        className={`category-tab ${selectedCategoryId === null ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          className={`category-tab ${selectedCategoryId === cat.category_id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.category_id)}
        >
          {cat.category_name}
        </button>
      ))}
    </div>
  );
}
