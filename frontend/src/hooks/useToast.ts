import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastState = {
  message: string;
  type: ToastType;
  key: number;
} | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}
