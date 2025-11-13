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
  getMenu: () => apiFetch<MenuItemDto[]>('/menu'),
  getMenuExpanded: () => apiFetch<MenuItemDto[]>('/expand/menu'),
  createMenuItem: (payload: MenuItemPayload) =>
    apiFetch<MenuItemDto>('/menu', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMenuItem: (id: string, payload: MenuItemPayload) =>
    apiFetch<MenuItemDto>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMenuItem: (id: string) =>
    apiFetch<void>(`/menu/${id}`, {
      method: 'DELETE',
    }),
  createReservation: (payload: ReservationPayload) =>
    apiFetch<ReservationDto>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getReservations: () => apiFetch<ReservationDto[]>('/reservations'),
  updateReservation: (id: string, payload: ReservationUpdatePayload) =>
    apiFetch<ReservationDto>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteReservation: (id: string) =>
    apiFetch<void>(`/reservations/${id}`, {
      method: 'DELETE',
    }),
  getAllReservations: () => apiFetch<ReservationDto[]>('/expand/reservations'),
  createOrder: (payload: OrderPayload) =>
    apiFetch<{ id: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getOrder: (id: string) => apiFetch<OrderDto>(`/orders/${id}`),
  updateOrder: (id: string, payload: OrderUpdatePayload) =>
    apiFetch<OrderDto>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getOrdersExpanded: () => apiFetch<OrderDto[]>('/expand/orders'),
  getOrdersRaw: () => apiFetch<OrderDto[]>('/raw/orders'),
  register: (payload: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    apiFetch<void>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
