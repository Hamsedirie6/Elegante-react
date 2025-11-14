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
  getMenuExpanded: () => apiFetch<any[]>(`/expand/menu`),
  createMenuItem: (payload: any) =>
    apiFetch<any>('/menu', { method: 'POST', body: JSON.stringify(payload) }),
  updateMenuItem: (id: string, payload: any) =>
    apiFetch<any>(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMenuItem: (id: string) =>
    apiFetch<any>(`/menu/${id}`, { method: 'DELETE' }),

  // ⬇⬇⬇ ÄNDRAD RAD – POSTA TILL /booking I STÄLLET FÖR /reservations ⬇⬇⬇
  createReservation: (payload: any) =>
    apiFetch('/booking', { method: 'POST', body: JSON.stringify(payload) }),

  // Hämtar inloggade användarens bokningar (via ReservationRoutes)
  getReservations: () => apiFetch<any[]>('/my/reservations'),

  createOrder: (payload: any) =>
    apiFetch<{ id: string }>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id: string) => apiFetch<any>(`/orders/${id}`),

  // Orders (admin use)
  getOrdersExpanded: () => apiFetch<any[]>(`/expand/orders`),
  getOrdersRaw: () => apiFetch<any[]>(`/raw/orders`),

  // Admin reservations (alla bokningar – via expand/alias)
  getAllReservations: () => apiFetch<any[]>(`/expand/reservations`),

  // Auth
  register: (payload: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
