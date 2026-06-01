import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function CustomerLayout() {
  return (
    <div className="customer-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="customer-footer">
        © 2026 Smiling Brunch · 早午餐線上點餐系統
      </footer>
    </div>
  );
}
