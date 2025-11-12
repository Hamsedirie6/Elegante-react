export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  // Ensure auth cookies/session are sent for protected routes
  const res = await fetch(`/api${path}`, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return (ct.includes('application/json') ? await res.json() : (undefined as unknown)) as T;
}

export const api = {
  getMenu: () => apiFetch<any[]>('/menu'),
  createReservation: (payload: any) => apiFetch('/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  getReservations: () => apiFetch<any[]>('/reservations'),
  createOrder: (payload: any) => apiFetch<{ id: string }>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id: string) => apiFetch<any>(`/orders/${id}`),
  // Auth
  register: (payload: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
};
