const API_BASE = `${import.meta.env.BASE_URL}api`;

type UnauthorizedHandler = () => void;
let _unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(cb: UnauthorizedHandler | null): void {
  _unauthorizedHandler = cb;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const hasBody = options.body !== undefined && !(options.body instanceof FormData);

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
    credentials: 'include',
  });

  const text = await response.text();

  if (!text.trim()) {
    throw new Error('伺服器回應為空，請確認後端服務是否正常運行');
  }

  let result: { success: boolean; message?: string; data?: T };
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('伺服器回應格式錯誤，請稍後再試');
  }

  if (!result.success) {
    if (response.status === 401) {
      _unauthorizedHandler?.();
    }
    throw new Error(result.message ?? '操作失敗，請稍後再試');
  }

  return result.data as T;
}
