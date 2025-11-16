export type StoredReservation = {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  phone?: string;
  notes?: string;
  createdAt: string;
};

const LS_KEY = 'elegante_reservations';

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function readAll(): StoredReservation[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as StoredReservation[];
    }
  } catch {}
  return [];
}

const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('elegante_reservations')
  : null;

function broadcast() {
  try {
    bc?.postMessage({ type: 'changed' });
  } catch {}
}

function writeAll(list: StoredReservation[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  broadcast();
}

export function addReservation(
  reservation: Omit<StoredReservation, 'createdAt' | 'id'> & { id?: string; createdAt?: string }
) {
  const entry: StoredReservation = {
    id: reservation.id || generateId(),
    name: reservation.name,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    phone: reservation.phone,
    notes: reservation.notes,
    createdAt: reservation.createdAt || new Date().toISOString(),
  };
  const list = readAll();
  list.unshift(entry);
  // keep latest 100 entries to avoid unbounded growth
  writeAll(list.slice(0, 100));
  return entry;
}

export function getAll(): StoredReservation[] {
  return readAll();
}

export function subscribe(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LS_KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  const onBC = () => callback();
  bc?.addEventListener?.('message', onBC as any);
  return () => {
    window.removeEventListener('storage', onStorage);
    try {
      bc?.removeEventListener?.('message', onBC as any);
    } catch {}
  };
}
