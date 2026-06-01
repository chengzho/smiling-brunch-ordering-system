import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Loading } from './components/common/Loading';

// Eager — critical path pages
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';

// Lazy — customer secondary pages
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

// Lazy — admin pages
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminMenuPage = lazy(() =>
  import('./pages/admin/AdminMenuPage').then((m) => ({ default: m.AdminMenuPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);

function AppLoadingScreen() {
  return (
    <div className="app-loading-screen">
      <img
        src={`${import.meta.env.BASE_URL}images/logo-mark.png`}
        alt="Smiling Brunch"
        className="app-loading-logo"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <p className="app-loading-brand">Smiling Brunch</p>
      <p className="app-loading-subtitle">正在為您準備今日的早午餐…</p>
      <div className="app-loading-spinner" />
    </div>
  );
}

function RouteLoading() {
  return (
    <div className="route-loading">
      <div className="route-loading-spinner" />
      <span>正在載入頁面…</span>
    </div>
  );
}

function withRouteLoading(element: React.ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/menu" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const el = document.getElementById('initial-loader');
      if (el) {
        el.classList.add('initial-loader-hidden');
        setTimeout(() => el.remove(), 200);
      }
    }
  }, [loading]);

  if (loading) return <AppLoadingScreen />;

  return (
    <Routes>
      {/* Public customer routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={withRouteLoading(<LoginPage />)} />
        <Route path="/register" element={withRouteLoading(<RegisterPage />)} />
        <Route path="/menu"     element={<MenuPage />} />

        {/* Protected customer routes */}
        <Route element={<RequireAuth />}>
          <Route path="/cart"            element={withRouteLoading(<CartPage />)} />
          <Route path="/orders"         element={withRouteLoading(<OrdersPage mode="active" />)} />
          <Route path="/orders/history" element={withRouteLoading(<OrdersPage mode="history" />)} />
          <Route path="/orders/:id"     element={withRouteLoading(<OrderDetailPage />)} />
          <Route path="/profile"        element={withRouteLoading(<ProfilePage />)} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"             element={withRouteLoading(<AdminDashboardPage />)} />
          <Route path="/admin/menu"        element={withRouteLoading(<AdminMenuPage />)} />
          <Route path="/admin/categories"  element={withRouteLoading(<AdminCategoriesPage />)} />
          <Route path="/admin/orders"      element={withRouteLoading(<AdminOrdersPage />)} />
          <Route path="/admin/users"       element={withRouteLoading(<AdminUsersPage />)} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
