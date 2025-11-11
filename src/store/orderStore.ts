export type KitchenStatus = 'new' | 'inprogress' | 'ready' | 'delivered';

export type StoredOrder = {
  id: string; // 4-digit client code
  status: KitchenStatus;
  total?: number;
  lines?: { name: string; quantity: number; price?: number }[];
  backendId?: string;
  updatedAt: string; // ISO
};

const LS_KEY = 'elegante_orders';

function readAll(): Record<string, StoredOrder> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, StoredOrder>;
  } catch {}
  return {};
}

function writeAll(map: Record<string, StoredOrder>) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
  broadcast();
}

export function upsertOrder(order: StoredOrder) {
  const map = readAll();
  map[order.id] = { ...map[order.id], ...order, updatedAt: new Date().toISOString() } as StoredOrder;
  writeAll(map);
}

export function ensureOrder(id: string, seed?: Partial<StoredOrder>) {
  const map = readAll();
  if (!map[id]) {
    map[id] = {
      id,
      status: 'new',
      total: seed?.total,
      lines: seed?.lines,
      backendId: seed?.backendId,
      updatedAt: new Date().toISOString(),
    };
    writeAll(map);
  }
}

export function getOrder(id: string): StoredOrder | undefined {
  const map = readAll();
  return map[id];
}

export function getAll(): StoredOrder[] {
  const map = readAll();
  return Object.values(map);
}

export function updateStatus(id: string, status: KitchenStatus) {
  const map = readAll();
  if (!map[id]) return;
  map[id] = { ...map[id], status, updatedAt: new Date().toISOString() };
  writeAll(map);
}

const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('elegante_orders') : null;

function broadcast() {
  try { bc?.postMessage({ type: 'changed' }); } catch {}
}

export function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === LS_KEY) callback(); };
  window.addEventListener('storage', onStorage);
  const onBC = () => callback();
  bc?.addEventListener?.('message', onBC as any);
  return () => {
    window.removeEventListener('storage', onStorage);
    try { bc?.removeEventListener?.('message', onBC as any); } catch {}
  };
}

