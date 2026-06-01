import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '../types/user';
import { apiGetMe, apiLogin, apiRegister, apiLogout } from '../api/authApi';
import { registerUnauthorizedHandler } from '../api/apiRequest';
import type { RegisterInput } from '../api/authApi';

export type AuthNotice = {
  title: string;
  description: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authNotice: AuthNotice | null;
  clearAuthNotice: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
};

const DISABLED_CUSTOMER_NOTICE: AuthNotice = {
  title: '您的帳號已停用，無法繼續使用系統。',
  description: '如需協助，請聯絡系統管理員。',
};

const DISABLED_ADMIN_NOTICE: AuthNotice = {
  title: '您的管理員帳號已停用，無法繼續使用後台管理系統。',
  description: '請聯絡其他系統管理員。',
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null);

  // Sync ref so the unauthorized callback always sees the current user value
  // without needing to re-register on every user change.
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const refreshUser = async () => {
    try {
      const me = await apiGetMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      // Only act when a previously authenticated user loses their session.
      // If userRef.current is null the 401 came from an unauthenticated check
      // (e.g. the initial me.php probe on app load) and should be ignored here.
      const current = userRef.current;
      if (current === null) return;
      setAuthNotice(current.role === 'admin' ? DISABLED_ADMIN_NOTICE : DISABLED_CUSTOMER_NOTICE);
      setUser(null);
    });

    refreshUser().finally(() => setLoading(false));

    return () => registerUnauthorizedHandler(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAuthNotice = () => setAuthNotice(null);

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setAuthNotice(null);
    setUser(u);
  };

  const register = async (data: RegisterInput) => {
    await apiRegister(data);
  };

  const logout = async () => {
    await apiLogout();
    setAuthNotice(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, authNotice, clearAuthNotice, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
