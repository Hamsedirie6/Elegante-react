// ============================
// DTOs
// ============================

export interface MenuItemDto {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price: number;
  image?: string;
  mediaUrl?: string;
}

export interface MenuItemPayload {
  title: string;
  description: string;
  price: number;
  image?: string;
  [key: string]: unknown;
}

export interface ReservationPayload {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes?: string;
}

export interface ReservationDto extends ReservationPayload {
  id: string;
  title?: string;
}

export interface OrderLinePayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  customer: { name: string };
  lines: OrderLinePayload[];
  total: number;
  title?: string;
  clientCode?: string;
  [key: string]: unknown;
}

export interface OrderDto {
  id: string;
  status?: string;
  total: number;
  customer?: { name: string } | Record<string, unknown>;
  lines?: { name: string; quantity: number; price?: number }[];
}

export interface OrderUpdatePayload {
  status?: string;
  total?: number;
  customer?: OrderPayload['customer'];
  lines?: OrderPayload['lines'];
}

export type ReservationUpdatePayload = Partial<ReservationPayload>;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('API error:', path, res.status, text);
    throw new Error(`API ${res.status}: ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  return (ct.includes('application/json')
    ? await res.json()
    : (undefined as unknown)) as T;
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
