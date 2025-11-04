export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`/api${path}`, { ...options, headers });
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
  createOrder: (payload: any) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id: string) => apiFetch<any>(`/orders/${id}`),
};