const API_BASE_URL = 'http://localhost:3000/api';

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const skipAuth = (options as any).skipAuth === true;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('API Error Response:', data);
    const error = new Error(data?.message || `Erreur ${response.status}`);
    (error as Error & { status: number; data?: unknown }).status = response.status;
    (error as Error & { status: number; data?: unknown }).data = data;
    throw error;
  }

  return data as T;
}
