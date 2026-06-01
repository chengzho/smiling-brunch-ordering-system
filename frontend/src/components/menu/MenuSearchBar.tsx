type MenuSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MenuSearchBar({ value, onChange }: MenuSearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="搜尋餐點..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
